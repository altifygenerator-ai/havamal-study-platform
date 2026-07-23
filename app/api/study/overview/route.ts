import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const db = await createSupabaseServerClient();
  if (!db) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to view saved work." }, { status: 401 });
  }

  const [profile, bookmarks, notes, guides, quotes] = await Promise.all([
    db.from("profiles").select("display_name,bio").eq("id", user.id).maybeSingle(),
    db
      .from("bookmarks")
      .select("created_at,canonical_passages(slug,internal_reference,section_label)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    db
      .from("user_notes")
      .select(
        "id,body,study_question,personal_tags,updated_at,canonical_passages(slug,internal_reference,section_label)",
      )
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false }),
    db
      .from("user_study_guides")
      .select("id,title,slug,updated_at,user_study_items(count)")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false }),
    db
      .from("saved_quote_cards")
      .select(
        "id,created_at,configuration,edition_passages(source_stanza_number,editions(slug,edition_title,translator,editor))",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const firstError = [bookmarks.error, notes.error, guides.error, quotes.error].find(Boolean);
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      email: user.email,
      displayName: profile.data?.display_name || null,
    },
    bookmarks: bookmarks.data ?? [],
    notes: notes.data ?? [],
    guides: guides.data ?? [],
    savedQuotes: quotes.data ?? [],
  });
}
