import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getAllPassages } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewThreadForm } from "@/components/new-thread-form";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const stanzaCategory = slug === "stanza-discussion";
  let threads: Array<{ slug: string; title: string; created_at: string }> = [];

  if (!stanzaCategory) {
    const db = await createSupabaseServerClient();
    if (db) {
      const { data: categoryRecord } = await db
        .from("forum_categories")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (categoryRecord) {
        const { data } = await db
          .from("forum_threads")
          .select("slug,title,created_at,forum_posts!inner(id)")
          .eq("category_id", categoryRecord.id)
          .is("canonical_passage_id", null)
          .in("status", ["open", "locked"])
          .eq("forum_posts.status", "published")
          .order("created_at", { ascending: false });
        threads = data ?? [];
      }
    }
  }

  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Discussion</div>
          <h1>{category.title}</h1>
        </div>
        <p>{category.description}</p>
      </header>

      {stanzaCategory ? (
        <div className="passage-index">
          {getAllPassages().map((passage) => {
            const primary = passage.editions[0];
            return (
              <Link
                className="passage-index-row"
                href={`/havamal/stanza/${passage.slug}#reader-discussion-heading`}
                key={passage.slug}
              >
                <span>{passage.internalReference}</span>
                <strong>
                  {primary.edition.translator} stanza {primary.passage.source_stanza_number}
                </strong>
                <span>Open discussion</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <>
          <div className="passage-index">
            {threads.map((thread) => (
              <Link
                className="passage-index-row"
                href={`/discuss/thread/${thread.slug}`}
                key={thread.slug}
              >
                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                <strong>{thread.title}</strong>
                <span>Open discussion</span>
              </Link>
            ))}
          </div>
          {!threads.length && (
            <div className="empty-state">No discussions have been started here yet.</div>
          )}
          <h2 className="rule-heading">Start a discussion</h2>
          <NewThreadForm categorySlug={slug} />
        </>
      )}
    </div>
  );
}
