import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { getAllPassages, searchLocal } from "@/lib/data";
import { excerptAround, normalizeSearchText } from "@/lib/normalize";
import { starterGuides } from "@/lib/study-guides";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Search" };

type SearchType = "texts" | "commentary" | "discussions" | "guides";
const searchTypes: Array<{ slug: SearchType; title: string }> = [
  { slug: "texts", title: "Texts" },
  { slug: "commentary", title: "Commentary" },
  { slug: "discussions", title: "Discussions" },
  { slug: "guides", title: "Study guides" },
];

function resultTabs(query: string, current: SearchType) {
  return (
    <nav className="archive-tabs search-tabs" aria-label="Search result type">
      {searchTypes.map((item) => (
        <Link
          key={item.slug}
          aria-current={current === item.slug ? "page" : undefined}
          href={`/search?q=${encodeURIComponent(query)}&type=${item.slug}`}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = "", type: requestedType = "texts" } = await searchParams;
  const type = searchTypes.some((item) => item.slug === requestedType)
    ? (requestedType as SearchType)
    : "texts";
  const db = await createSupabaseServerClient();

  let databaseTextResults: any[] = [];
  let usedDatabaseSearch = false;
  if (q && type === "texts" && db) {
    const { data, error } = await db.rpc("search_havamal", {
      query_text: q,
      max_results: 50,
    });
    if (!error) {
      databaseTextResults = data || [];
      usedDatabaseSearch = true;
    }
  }

  const localTextResults = q && type === "texts" && !usedDatabaseSearch ? searchLocal(q) : [];

  const safePatternQuery = q.replaceAll("%", "").replaceAll("_", "");

  let commentaryResults: any[] = [];
  if (safePatternQuery && type === "commentary" && db) {
    const { data } = await db
      .from("commentary_entries")
      .select(
        "id,entry_type,body,commentary_sources(author,work_title,publication_year),commentary_passages(canonical_passages(slug,internal_reference))",
      )
      .eq("status", "published")
      .ilike("body", `%${safePatternQuery}%`)
      .limit(50);
    commentaryResults = data || [];
  }

  let discussionResults: any[] = [];
  if (safePatternQuery && type === "discussions" && db) {
    const { data } = await db
      .from("public_forum_posts")
      .select("id,body_text,created_at,author_name,canonical_slug,thread_slug")
      .ilike("body_text", `%${safePatternQuery}%`)
      .order("created_at", { ascending: false })
      .limit(50);
    discussionResults = data || [];
  }

  const normalizedQuery = normalizeSearchText(q);
  const guideResults =
    q && type === "guides"
      ? starterGuides.filter((guide) =>
          normalizeSearchText(
            [
              guide.title,
              guide.description,
              ...guide.prompts,
              ...guide.passageSlugs,
            ].join(" "),
          ).includes(normalizedQuery),
        )
      : [];

  const count =
    type === "texts"
      ? usedDatabaseSearch
        ? databaseTextResults.length
        : localTextResults.length
      : type === "commentary"
        ? commentaryResults.length
        : type === "discussions"
          ? discussionResults.length
          : guideResults.length;

  return (
    <div className="page-shell">
      <header className="page-heading">
        <h1>Search</h1>
        <p>Primary-source text, reviewed commentary, community discussion, and study guides remain visibly separate.</p>
      </header>
      <SearchBox initialQuery={q} />

      {q && (
        <>
          {resultTabs(q, type)}
          <h2 className="rule-heading">
            {searchTypes.find((item) => item.slug === type)?.title} · {count} result
            {count === 1 ? "" : "s"}
          </h2>

          {type === "texts" && usedDatabaseSearch && (
            <div className="passage-index">
              {databaseTextResults.map((result) => (
                <Link
                  key={`${result.canonical_slug}-${result.edition_slug}`}
                  href={`/havamal/stanza/${result.canonical_slug}`}
                  className="passage-index-row"
                >
                  <span>
                    {result.translator || result.editor} {result.source_stanza_number}
                  </span>
                  <strong>{excerptAround((result.text_lines || []).join(" "), q)}</strong>
                  <span>{result.section_heading || result.internal_reference}</span>
                </Link>
              ))}
            </div>
          )}

          {type === "texts" && !usedDatabaseSearch && (
            <div className="passage-index">
              {localTextResults.map(({ canonical, edition, passage }) => (
                <Link
                  key={`${canonical.slug}-${edition.slug}`}
                  href={`/havamal/stanza/${canonical.slug}`}
                  className="passage-index-row"
                >
                  <span>
                    {edition.translator || edition.editor} {passage.source_stanza_number}
                  </span>
                  <strong>{excerptAround(passage.text_lines.join(" "), q)}</strong>
                  <span>{passage.section}</span>
                </Link>
              ))}
            </div>
          )}

          {type === "commentary" && (
            <div className="passage-index">
              {commentaryResults.map((result) => {
                const source = Array.isArray(result.commentary_sources)
                  ? result.commentary_sources[0]
                  : result.commentary_sources;
                const linkRow = result.commentary_passages?.[0];
                const canonical = Array.isArray(linkRow?.canonical_passages)
                  ? linkRow.canonical_passages[0]
                  : linkRow?.canonical_passages;
                return (
                  <Link
                    key={result.id}
                    href={canonical ? `/havamal/stanza/${canonical.slug}` : "/sources"}
                    className="passage-index-row"
                  >
                    <span>{result.entry_type.replaceAll("_", " ")}</span>
                    <strong>{excerptAround(result.body, q)}</strong>
                    <span>
                      {source
                        ? `${source.author}, ${source.work_title}`
                        : canonical?.internal_reference || "Reviewed commentary"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {type === "discussions" && (
            <div className="passage-index">
              {discussionResults.map((result) => (
                <Link
                  key={result.id}
                  href={
                    result.canonical_slug
                      ? `/havamal/stanza/${result.canonical_slug}#post-${result.id}`
                      : `/discuss/thread/${result.thread_slug}#post-${result.id}`
                  }
                  className="passage-index-row"
                >
                  <span>{result.author_name || "Community member"}</span>
                  <strong>{excerptAround(result.body_text, q)}</strong>
                  <span>{new Date(result.created_at).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          )}

          {type === "guides" && (
            <div className="card-list">
              {guideResults.map((guide) => (
                <article className="flat-card" key={guide.slug}>
                  <h2>{guide.title}</h2>
                  <p>{guide.description}</p>
                  <Link href={`/study/${guide.slug}`}>Open guide</Link>
                </article>
              ))}
            </div>
          )}

          {!count && (
            <div className="empty-state">
              {type === "commentary" && !db
                ? "Connect Supabase to search reviewed commentary."
                : type === "discussions" && !db
                  ? "Connect Supabase to search reader discussion."
                  : `No published ${searchTypes.find((item) => item.slug === type)?.title.toLowerCase()} matched this search.`}
            </div>
          )}
        </>
      )}
    </div>
  );
}
