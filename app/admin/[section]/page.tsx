import { notFound, redirect } from "next/navigation";
import { AdminActionForm } from "@/components/admin-action-form";
import { adminSections } from "@/lib/admin";
import { getAdminAccess } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function generateStaticParams() {
  return adminSections.map((item) => ({ section: item.slug }));
}

type Row = Record<string, any>;

const statuses = [
  "draft",
  "needs_review",
  "approved",
  "published",
  "rejected",
  "archived",
];

function StatusControl({
  table,
  id,
  current,
}: {
  table: string;
  id: string;
  current: string;
}) {
  return (
    <AdminActionForm
      payload={{ action: "content_status", table, id }}
      label="Update"
      className="admin-inline-form"
    >
      <label>
        <span className="sr-only">Publication status</span>
        <select name="status" defaultValue={current}>
          {statuses.map((status) => (
            <option value={status} key={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
    </AdminActionForm>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

function SectionTable({
  headings,
  rows,
}: {
  headings: string[];
  rows: React.ReactNode[][];
}) {
  if (!rows.length) {
    return <Empty>No records are waiting in this workspace.</Empty>;
  }

  return (
    <div className="source-table admin-table">
      <table>
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function renderWorkspace(section: string, db: any) {
  if (section === "works") {
    const [{ data: works }, { data: editions }, { data: sources }] = await Promise.all([
      db.from("works").select("id,title,slug,status,updated_at").order("title"),
      db
        .from("editions")
        .select("id,edition_title,translator,editor,status,publication_year")
        .order("publication_year"),
      db
        .from("source_records")
        .select("id,title,provider,enabled,date_last_verified")
        .order("title"),
    ]);

    return (
      <div className="admin-workspace-stack">
        <section>
          <h2 className="rule-heading">Works</h2>
          <SectionTable
            headings={["Work", "Slug", "Status", "Action"]}
            rows={(works || []).map((row: Row) => [
              row.title,
              <code key="slug">{row.slug}</code>,
              row.status,
              <StatusControl key="action" table="works" id={row.id} current={row.status} />,
            ])}
          />
        </section>

        <section>
          <h2 className="rule-heading">Editions</h2>
          <SectionTable
            headings={["Edition", "Translator/editor", "Year", "Status", "Action"]}
            rows={(editions || []).map((row: Row) => [
              row.edition_title,
              row.translator || row.editor || "Not recorded",
              row.publication_year,
              row.status,
              <StatusControl key="action" table="editions" id={row.id} current={row.status} />,
            ])}
          />
        </section>

        <section>
          <h2 className="rule-heading">Source registry</h2>
          <SectionTable
            headings={["Source", "Provider", "Verified", "Enabled", "Action"]}
            rows={(sources || []).map((row: Row) => [
              row.title,
              row.provider,
              row.date_last_verified || "Not verified",
              row.enabled ? "Yes" : "No",
              <AdminActionForm
                key="action"
                payload={{
                  action: "source_enabled",
                  sourceId: row.id,
                  enabled: !row.enabled,
                }}
                label={row.enabled ? "Disable" : "Enable"}
                confirmText={
                  row.enabled
                    ? "Disable this source from public use?"
                    : "Enable this source only if its rights and transcription have been verified. Continue?"
                }
                className="admin-inline-form"
              />,
            ])}
          />
        </section>
      </div>
    );
  }

  if (section === "passages") {
    const [{ data: canonical }, { data: editionPassages }] = await Promise.all([
      db
        .from("canonical_passages")
        .select("id,slug,internal_reference,section_label,status,updated_at")
        .order("printed_order")
        .limit(250),
      db
        .from("edition_passages")
        .select(
          "id,source_stanza_number,section_heading,review_status,source_page,editions(edition_title,translator)",
        )
        .order("printed_order")
        .limit(250),
    ]);

    return (
      <div className="admin-workspace-stack">
        <section>
          <h2 className="rule-heading">Canonical alignment records</h2>
          <SectionTable
            headings={["Reference", "Section", "Slug", "Status", "Action"]}
            rows={(canonical || []).map((row: Row) => [
              row.internal_reference,
              row.section_label || "Unassigned",
              <code key="slug">{row.slug}</code>,
              row.status,
              <StatusControl
                key="action"
                table="canonical_passages"
                id={row.id}
                current={row.status}
              />,
            ])}
          />
        </section>

        <section>
          <h2 className="rule-heading">Edition passages</h2>
          <SectionTable
            headings={["Edition", "Printed number", "Source page", "Review status", "Action"]}
            rows={(editionPassages || []).map((row: Row) => {
              const edition = Array.isArray(row.editions) ? row.editions[0] : row.editions;
              return [
                edition?.translator || edition?.edition_title || "Edition",
                row.source_stanza_number,
                row.source_page || "Not recorded",
                row.review_status,
                <StatusControl
                  key="action"
                  table="edition_passages"
                  id={row.id}
                  current={row.review_status}
                />,
              ];
            })}
          />
        </section>
      </div>
    );
  }

  if (section === "themes") {
    const { data } = await db
      .from("themes")
      .select("id,title,slug,description,status")
      .order("title");

    return (
      <SectionTable
        headings={["Theme", "Description", "Status", "Action"]}
        rows={(data || []).map((row: Row) => [
          row.title,
          row.description || "No description",
          row.status,
          <StatusControl key="action" table="themes" id={row.id} current={row.status} />,
        ])}
      />
    );
  }

  if (section === "commentary") {
    const { data } = await db
      .from("commentary_entries")
      .select(
        "id,entry_type,body,status,created_at,commentary_sources(author,work_title,publication_year,page_location)",
      )
      .order("created_at", { ascending: false });

    return (
      <SectionTable
        headings={["Source", "Type", "Excerpt", "Status", "Action"]}
        rows={(data || []).map((row: Row) => {
          const source = Array.isArray(row.commentary_sources)
            ? row.commentary_sources[0]
            : row.commentary_sources;
          return [
            source
              ? `${source.author}, ${source.work_title}${source.publication_year ? ` (${source.publication_year})` : ""}`
              : "Source missing",
            row.entry_type.replaceAll("_", " "),
            `${row.body.slice(0, 180)}${row.body.length > 180 ? "…" : ""}`,
            row.status,
            <StatusControl
              key="action"
              table="commentary_entries"
              id={row.id}
              current={row.status}
            />,
          ];
        })}
      />
    );
  }

  if (section === "licenses") {
    const [{ data: licenses }, { data: sources }] = await Promise.all([
      db
        .from("license_records")
        .select(
          "name,status,public_display_allowed,noncommercial_reuse_allowed,commercial_reuse_allowed,full_text_display_allowed,quote_card_export_allowed,verified_at,verified_by",
        )
        .order("name"),
      db
        .from("source_records")
        .select("id,title,enabled,license_records(name,commercial_reuse_allowed,full_text_display_allowed)")
        .order("title"),
    ]);

    return (
      <div className="admin-workspace-stack">
        <section>
          <h2 className="rule-heading">License records</h2>
          <SectionTable
            headings={[
              "License",
              "Display",
              "Noncommercial",
              "Commercial",
              "Full text",
              "Quote export",
              "Verified",
            ]}
            rows={(licenses || []).map((row: Row) => [
              row.name,
              row.public_display_allowed ? "Yes" : "No",
              row.noncommercial_reuse_allowed ? "Yes" : "No",
              row.commercial_reuse_allowed ? "Yes" : "No",
              row.full_text_display_allowed ? "Yes" : "No",
              row.quote_card_export_allowed ? "Yes" : "No",
              row.verified_at ? `${row.verified_at} · ${row.verified_by || "reviewer not recorded"}` : "No",
            ])}
          />
        </section>

        <section>
          <h2 className="rule-heading">Source availability</h2>
          <SectionTable
            headings={["Source", "License", "Commercial", "Full text", "Enabled", "Action"]}
            rows={(sources || []).map((row: Row) => {
              const license = Array.isArray(row.license_records)
                ? row.license_records[0]
                : row.license_records;
              return [
                row.title,
                license?.name || "Missing",
                license?.commercial_reuse_allowed ? "Yes" : "No",
                license?.full_text_display_allowed ? "Yes" : "No",
                row.enabled ? "Yes" : "No",
                <AdminActionForm
                  key="action"
                  payload={{ action: "source_enabled", sourceId: row.id, enabled: !row.enabled }}
                  label={row.enabled ? "Disable" : "Enable"}
                  confirmText="Confirm that the source registry and license record support this availability change."
                  className="admin-inline-form"
                />,
              ];
            })}
          />
        </section>
      </div>
    );
  }

  if (section === "imports") {
    const [{ data: jobs }, { data: errors }] = await Promise.all([
      db
        .from("import_jobs")
        .select("id,filename,status,started_at,completed_at,validation_report")
        .order("started_at", { ascending: false })
        .limit(100),
      db
        .from("import_errors")
        .select("severity,record_reference,message,created_at,import_jobs(filename)")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    return (
      <div className="admin-workspace-stack">
        <section>
          <h2 className="rule-heading">Import jobs</h2>
          <SectionTable
            headings={["File", "Status", "Started", "Completed", "Validation"]}
            rows={(jobs || []).map((row: Row) => [
              row.filename,
              row.status,
              new Date(row.started_at).toLocaleString(),
              row.completed_at ? new Date(row.completed_at).toLocaleString() : "Not completed",
              <code key="report">{JSON.stringify(row.validation_report)}</code>,
            ])}
          />
        </section>

        <section>
          <h2 className="rule-heading">Import errors</h2>
          <SectionTable
            headings={["File", "Severity", "Record", "Message", "Date"]}
            rows={(errors || []).map((row: Row) => {
              const job = Array.isArray(row.import_jobs) ? row.import_jobs[0] : row.import_jobs;
              return [
                job?.filename || "Unknown import",
                row.severity,
                row.record_reference || "General",
                row.message,
                new Date(row.created_at).toLocaleString(),
              ];
            })}
          />
        </section>
      </div>
    );
  }

  if (section === "quote-templates") {
    const { data } = await db
      .from("quote_templates")
      .select("id,title,slug,approved,approved_at,configuration")
      .order("title");

    return (
      <SectionTable
        headings={["Template", "Slug", "Status", "Configuration", "Action"]}
        rows={(data || []).map((row: Row) => [
          row.title,
          <code key="slug">{row.slug}</code>,
          row.approved ? "Approved" : "Not approved",
          <code key="configuration">{JSON.stringify(row.configuration)}</code>,
          <AdminActionForm
            key="action"
            payload={{
              action: "quote_template_approval",
              templateId: row.id,
              approved: !row.approved,
            }}
            label={row.approved ? "Withdraw" : "Approve"}
            confirmText="Confirm this template has been reviewed for attribution, accessibility, and historically responsible imagery."
            className="admin-inline-form"
          />,
        ])}
      />
    );
  }

  if (section === "discussions") {
    const [{ data: reports }, { data: pendingPosts }, { data: threads }] = await Promise.all([
      db
        .from("forum_reports")
        .select(
          "id,reason,details,status,created_at,forum_posts(id,body_text,author_id,forum_threads(title,slug))",
        )
        .order("created_at", { ascending: false })
        .limit(100),
      db
        .from("forum_posts")
        .select("id,body_text,created_at,author_id,forum_threads(title,slug)")
        .eq("status", "pending")
        .order("created_at")
        .limit(100),
      db
        .from("forum_threads")
        .select("id,title,slug,status,is_locked,created_at")
        .in("status", ["open", "locked"])
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    return (
      <div className="admin-workspace-stack">
        <section>
          <h2 className="rule-heading">Pending first posts</h2>
          <SectionTable
            headings={["Thread", "Post", "Date", "Decision"]}
            rows={(pendingPosts || []).map((row: Row) => {
              const thread = Array.isArray(row.forum_threads)
                ? row.forum_threads[0]
                : row.forum_threads;
              return [
                thread?.title || "Thread",
                row.body_text,
                new Date(row.created_at).toLocaleString(),
                <div className="admin-action-cluster" key="actions">
                  <AdminActionForm
                    payload={{ action: "forum_post_status", postId: row.id }}
                    label="Approve"
                    className="admin-inline-form"
                  >
                    <input type="hidden" name="status" value="published" />
                    <input type="hidden" name="reason" value="Approved after first-post review" />
                  </AdminActionForm>
                  <AdminActionForm
                    payload={{ action: "forum_post_status", postId: row.id }}
                    label="Reject"
                    confirmText="Hide this pending post?"
                    className="admin-inline-form"
                  >
                    <input type="hidden" name="status" value="hidden" />
                    <label>
                      Reason
                      <input name="reason" minLength={3} required />
                    </label>
                  </AdminActionForm>
                </div>,
              ];
            })}
          />
        </section>

        <section>
          <h2 className="rule-heading">Reports</h2>
          <SectionTable
            headings={["Reason", "Reported post", "Details", "Date", "Moderation"]}
            rows={(reports || []).map((row: Row) => {
              const post = Array.isArray(row.forum_posts) ? row.forum_posts[0] : row.forum_posts;
              return [
                row.reason.replaceAll("_", " "),
                post?.body_text || "Post unavailable",
                row.details || "No additional detail",
                new Date(row.created_at).toLocaleString(),
                post ? (
                  <AdminActionForm
                    key="action"
                    payload={{ action: "forum_post_status", postId: post.id }}
                    label="Hide post"
                    confirmText="Hide this post and record a moderation action?"
                    className="admin-inline-form"
                  >
                    <input type="hidden" name="status" value="hidden" />
                    <label>
                      Reason
                      <input name="reason" defaultValue={row.reason.replaceAll("_", " ")} required />
                    </label>
                  </AdminActionForm>
                ) : (
                  "No action available"
                ),
              ];
            })}
          />
        </section>

        <section>
          <h2 className="rule-heading">Thread locks</h2>
          <SectionTable
            headings={["Thread", "Slug", "State", "Action"]}
            rows={(threads || []).map((row: Row) => [
              row.title,
              <code key="slug">{row.slug}</code>,
              row.is_locked || row.status === "locked" ? "Locked" : "Open",
              <AdminActionForm
                key="action"
                payload={{
                  action: "thread_lock",
                  threadId: row.id,
                  locked: !(row.is_locked || row.status === "locked"),
                }}
                label={row.is_locked || row.status === "locked" ? "Unlock" : "Lock"}
                className="admin-inline-form"
              >
                <label>
                  Reason
                  <input name="reason" minLength={3} required />
                </label>
              </AdminActionForm>,
            ])}
          />
        </section>
      </div>
    );
  }

  if (section === "users") {
    const [{ data: profiles }, { data: roles }, { data: sanctions }] = await Promise.all([
      db
        .from("profiles")
        .select("id,display_name,bio,created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      db.from("user_roles").select("user_id,role"),
      db
        .from("user_sanctions")
        .select("id,user_id,action,reason,starts_at,ends_at,active")
        .order("starts_at", { ascending: false })
        .limit(100),
    ]);
    const profileNames = new Map(
      (profiles || []).map((profile: Row) => [profile.id, profile.display_name || "Unnamed account"]),
    );

    return (
      <div className="admin-workspace-stack">
        <section>
          <h2 className="rule-heading">Profiles and roles</h2>
          <SectionTable
            headings={["Display name", "Roles", "Role control", "Sanction"]}
            rows={(profiles || []).map((row: Row) => {
              const roleNames = (roles || [])
                .filter((item: Row) => item.user_id === row.id)
                .map((item: Row) => item.role);
              return [
                row.display_name || "Unnamed account",
                roleNames.length ? roleNames.join(", ") : "reader",
                <div className="admin-action-cluster" key="roles">
                  {(["moderator", "admin"] as const).map((role) => {
                    const enabled = roleNames.includes(role);
                    return (
                      <AdminActionForm
                        key={role}
                        payload={{
                          action: "user_role",
                          userId: row.id,
                          role,
                          enabled: !enabled,
                        }}
                        label={enabled ? `Remove ${role}` : `Make ${role}`}
                        confirmText={`${enabled ? "Remove" : "Grant"} the ${role} role?`}
                        className="admin-inline-form"
                      />
                    );
                  })}
                </div>,
                <AdminActionForm
                  key="sanction"
                  payload={{ action: "sanction", userId: row.id }}
                  label="Record sanction"
                  className="admin-inline-form admin-stacked-form"
                >
                  <label>
                    Type
                    <select name="sanction" defaultValue="warning">
                      <option value="warning">Warning</option>
                      <option value="posting_restriction">Posting restriction</option>
                      <option value="suspension">Suspension</option>
                      <option value="ban">Permanent ban</option>
                    </select>
                  </label>
                  <label>
                    Hours (blank for indefinite)
                    <input name="hours" type="number" min="1" max="8760" />
                  </label>
                  <label>
                    Reason
                    <input name="reason" minLength={3} required />
                  </label>
                </AdminActionForm>,
              ];
            })}
          />
        </section>

        <section>
          <h2 className="rule-heading">Sanction history</h2>
          <SectionTable
            headings={["User", "Action", "Reason", "Starts", "Ends", "Active"]}
            rows={(sanctions || []).map((row: Row) => {
              return [
                profileNames.get(row.user_id) || row.user_id,
                row.action.replaceAll("_", " "),
                row.reason,
                new Date(row.starts_at).toLocaleString(),
                row.ends_at ? new Date(row.ends_at).toLocaleString() : "Indefinite",
                row.active ? "Yes" : "No",
              ];
            })}
          />
        </section>
      </div>
    );
  }

  if (section === "corrections") {
    const { data } = await db
      .from("correction_reports")
      .select(
        "id,category,affected_source,affected_passage,description,suggested_correction,supporting_source,status,review_notes,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    return (
      <SectionTable
        headings={["Issue", "Description", "Evidence", "Status", "Review"]}
        rows={(data || []).map((row: Row) => [
          <div key="issue">
            <strong>{row.category.replaceAll("_", " ")}</strong>
            <div>{row.affected_source}</div>
            <div>{row.affected_passage || "Passage not specified"}</div>
          </div>,
          <div key="description">
            <p>{row.description}</p>
            {row.suggested_correction && (
              <p>
                <strong>Suggested:</strong> {row.suggested_correction}
              </p>
            )}
          </div>,
          <a key="evidence" href={row.supporting_source} rel="noreferrer" target="_blank">
            Open supporting source
          </a>,
          row.status.replaceAll("_", " "),
          <AdminActionForm
            key="action"
            payload={{ action: "correction_status", reportId: row.id }}
            label="Save review"
            className="admin-inline-form admin-stacked-form"
          >
            <label>
              Status
              <select name="status" defaultValue={row.status}>
                {[
                  "new",
                  "under_review",
                  "needs_source",
                  "accepted",
                  "rejected",
                  "published",
                ].map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Review notes
              <textarea name="notes" defaultValue={row.review_notes || ""} />
            </label>
          </AdminActionForm>,
        ])}
      />
    );
  }

  if (section === "settings") {
    const [{ data: settings }, { data: logs }, { data: actors }] = await Promise.all([
      db.from("site_settings").select("key,value,description,updated_at").order("key"),
      db
        .from("audit_logs")
        .select("actor_id,action,entity_type,entity_id,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      db.from("profiles").select("id,display_name"),
    ]);
    const actorNames = new Map(
      (actors || []).map((profile: Row) => [profile.id, profile.display_name || "Administrator"]),
    );

    return (
      <div className="admin-workspace-stack">
        <section>
          <h2 className="rule-heading">Application settings</h2>
          <SectionTable
            headings={["Setting", "Description", "Current value", "Action"]}
            rows={(settings || []).map((row: Row) => {
              const booleanSetting = [
                "project_commercial_mode",
                "first_post_requires_approval",
              ].includes(row.key);
              const currentValue =
                typeof row.value === "boolean" ? row.value : String(row.value) === "true";
              return [
                <code key="key">{row.key}</code>,
                row.description || "No description",
                <code key="value">{JSON.stringify(row.value)}</code>,
                booleanSetting ? (
                  <AdminActionForm
                    key="action"
                    payload={{
                      action: "boolean_setting",
                      key: row.key,
                      value: !currentValue,
                    }}
                    label={currentValue ? "Turn off" : "Turn on"}
                    confirmText={`Change ${row.key}?`}
                    className="admin-inline-form"
                  />
                ) : (
                  "Managed through migration or protected configuration"
                ),
              ];
            })}
          />
        </section>

        <section>
          <h2 className="rule-heading">Audit log</h2>
          <SectionTable
            headings={["Actor", "Action", "Entity", "Metadata", "Date"]}
            rows={(logs || []).map((row: Row) => {
              return [
                actorNames.get(row.actor_id) || "Administrator",
                row.action.replaceAll("_", " "),
                `${row.entity_type}${row.entity_id ? ` · ${row.entity_id}` : ""}`,
                <code key="metadata">{JSON.stringify(row.metadata)}</code>,
                new Date(row.created_at).toLocaleString(),
              ];
            })}
          />
        </section>
      </div>
    );
  }

  return <Empty>This workspace has no records to display yet.</Empty>;
}

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const access = await getAdminAccess();
  if (access.configured && !access.allowed) {
    redirect("/account");
  }

  const { section } = await params;
  const item = adminSections.find((entry) => entry.slug === section);
  if (!item) {
    notFound();
  }

  const db = await createSupabaseServerClient();

  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Admin workspace</div>
          <h1>{item.title}</h1>
        </div>
        <p>{item.description}</p>
      </header>

      {!db ? (
        <Empty>
          Connect Supabase, apply the migration, seed the registry, and assign an administrator
          role to activate this workspace. Public client-side checks are not treated as
          authorization.
        </Empty>
      ) : (
        await renderWorkspace(section, db)
      )}
    </div>
  );
}
