import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { firstValidationMessage } from "@/lib/validation";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("forum_post_status"),
    postId: z.string().uuid(),
    status: z.enum(["pending", "published", "hidden", "deleted"]),
    reason: z.string().trim().min(3).max(1000),
  }),
  z.object({
    action: z.literal("thread_lock"),
    threadId: z.string().uuid(),
    locked: z.boolean(),
    reason: z.string().trim().min(3).max(1000),
  }),
  z.object({
    action: z.literal("correction_status"),
    reportId: z.string().uuid(),
    status: z.enum([
      "new",
      "under_review",
      "needs_source",
      "accepted",
      "rejected",
      "published",
    ]),
    notes: z.string().trim().max(4000).default(""),
  }),
  z.object({
    action: z.literal("boolean_setting"),
    key: z.enum(["project_commercial_mode", "first_post_requires_approval"]),
    value: z.boolean(),
  }),
  z.object({
    action: z.literal("content_status"),
    table: z.enum([
      "works",
      "editions",
      "canonical_passages",
      "edition_passages",
      "themes",
      "commentary_entries",
      "study_guides",
    ]),
    id: z.string().uuid(),
    status: z.enum([
      "draft",
      "needs_review",
      "approved",
      "published",
      "rejected",
      "archived",
    ]),
  }),
  z.object({
    action: z.literal("source_enabled"),
    sourceId: z.string().uuid(),
    enabled: z.boolean(),
  }),
  z.object({
    action: z.literal("quote_template_approval"),
    templateId: z.string().uuid(),
    approved: z.boolean(),
  }),
  z.object({
    action: z.literal("user_role"),
    userId: z.string().uuid(),
    role: z.enum(["moderator", "admin"]),
    enabled: z.boolean(),
  }),
  z.object({
    action: z.literal("sanction"),
    userId: z.string().uuid(),
    sanction: z.enum(["warning", "posting_restriction", "suspension", "ban"]),
    reason: z.string().trim().min(3).max(2000),
    hours: z.number().int().positive().max(8760).nullable(),
  }),
]);

type DatabaseClient = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

async function audit(
  db: DatabaseClient,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  await db.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}

export async function POST(request: Request) {
  try {
    const input = ActionSchema.parse(await request.json());
    const access = await getAdminAccess();

    if (!access.configured) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
    }

    if (!access.allowed || !access.user) {
      return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
    }

    const db = await createSupabaseServerClient();
    if (!db) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
    }

    if (input.action === "forum_post_status") {
      const { data: post } = await db
        .from("forum_posts")
        .select("id,thread_id,author_id,status")
        .eq("id", input.postId)
        .maybeSingle();

      if (!post) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }

      const { error } = await db
        .from("forum_posts")
        .update({
          status: input.status,
          deleted_at: input.status === "deleted" ? new Date().toISOString() : null,
        })
        .eq("id", input.postId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await db.from("moderation_actions").insert({
        moderator_id: access.user.id,
        target_user_id: post.author_id,
        post_id: post.id,
        thread_id: post.thread_id,
        action: `post_${input.status}`,
        reason: input.reason,
      });
      await audit(db, access.user.id, `post_${input.status}`, "forum_post", post.id, {
        previousStatus: post.status,
        reason: input.reason,
      });
    }

    if (input.action === "thread_lock") {
      const { error } = await db
        .from("forum_threads")
        .update({
          is_locked: input.locked,
          status: input.locked ? "locked" : "open",
        })
        .eq("id", input.threadId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await db.from("moderation_actions").insert({
        moderator_id: access.user.id,
        thread_id: input.threadId,
        action: input.locked ? "thread_locked" : "thread_unlocked",
        reason: input.reason,
      });
      await audit(
        db,
        access.user.id,
        input.locked ? "thread_locked" : "thread_unlocked",
        "forum_thread",
        input.threadId,
        { reason: input.reason },
      );
    }

    if (input.action === "correction_status") {
      const { error } = await db
        .from("correction_reports")
        .update({
          status: input.status,
          reviewer_id: access.user.id,
          review_notes: input.notes || null,
        })
        .eq("id", input.reportId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await audit(db, access.user.id, "correction_status_changed", "correction_report", input.reportId, {
        status: input.status,
      });
    }

    if (input.action === "boolean_setting") {
      const { error } = await db
        .from("site_settings")
        .update({ value: input.value, updated_by: access.user.id })
        .eq("key", input.key);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await audit(db, access.user.id, "setting_changed", "site_setting", input.key, {
        value: input.value,
      });
    }

    if (input.action === "content_status") {
      const statusColumn = input.table === "edition_passages" ? "review_status" : "status";
      const { error } = await db
        .from(input.table)
        .update({ [statusColumn]: input.status })
        .eq("id", input.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await audit(db, access.user.id, "content_status_changed", input.table, input.id, {
        status: input.status,
      });
    }

    if (input.action === "source_enabled") {
      const { error } = await db
        .from("source_records")
        .update({ enabled: input.enabled })
        .eq("id", input.sourceId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await audit(db, access.user.id, "source_enabled_changed", "source_record", input.sourceId, {
        enabled: input.enabled,
      });
    }

    if (input.action === "quote_template_approval") {
      const { error } = await db
        .from("quote_templates")
        .update({
          approved: input.approved,
          approved_by: input.approved ? access.user.id : null,
          approved_at: input.approved ? new Date().toISOString() : null,
        })
        .eq("id", input.templateId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await audit(db, access.user.id, "quote_template_approval_changed", "quote_template", input.templateId, {
        approved: input.approved,
      });
    }

    if (input.action === "user_role") {
      if (input.userId === access.user.id && input.role === "admin" && !input.enabled) {
        return NextResponse.json(
          { error: "You cannot remove your own administrator role." },
          { status: 400 },
        );
      }

      const result = input.enabled
        ? await db.from("user_roles").upsert(
            {
              user_id: input.userId,
              role: input.role,
              granted_by: access.user.id,
            },
            { onConflict: "user_id,role" },
          )
        : await db
            .from("user_roles")
            .delete()
            .eq("user_id", input.userId)
            .eq("role", input.role);

      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 400 });
      }

      await audit(db, access.user.id, input.enabled ? "role_granted" : "role_removed", "user", input.userId, {
        role: input.role,
      });
    }

    if (input.action === "sanction") {
      const endsAt = input.hours
        ? new Date(Date.now() + input.hours * 60 * 60 * 1000).toISOString()
        : null;

      const { data: sanction, error } = await db
        .from("user_sanctions")
        .insert({
          user_id: input.userId,
          action: input.sanction,
          reason: input.reason,
          ends_at: input.sanction === "warning" ? new Date().toISOString() : endsAt,
          active: input.sanction !== "warning",
          issued_by: access.user.id,
        })
        .select("id")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await audit(db, access.user.id, "sanction_issued", "user", input.userId, {
        sanctionId: sanction.id,
        sanction: input.sanction,
        endsAt,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = firstValidationMessage(error, "Invalid administrative action.");
    if (message) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "The administrative action could not be completed." },
      { status: 500 },
    );
  }
}
