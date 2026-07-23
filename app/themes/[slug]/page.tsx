import Link from "next/link";
import { notFound } from "next/navigation";
import { getPassagesForTheme, getTheme, themeRegistry } from "@/lib/data";

export function generateStaticParams() {
  return themeRegistry.map((theme) => ({ slug: theme.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = getTheme(slug);
  if (!theme) notFound();
  const passages = getPassagesForTheme(slug);

  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Theme</div>
          <h1>{theme.title}</h1>
        </div>
        <p>{theme.description}</p>
      </header>
      {passages.length ? (
        <div className="passage-index">
          {passages.map((item) => {
            const primary = item.editions[0];
            return (
              <Link
                className="passage-index-row"
                href={`/havamal/stanza/${item.slug}`}
                key={item.slug}
              >
                <span>{item.internalReference}</span>
                <strong>
                  {primary.edition.translator} stanza {primary.passage.source_stanza_number}
                </strong>
                <span>{primary.passage.text_lines[0]}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">No passages are listed under this theme yet.</div>
      )}
    </div>
  );
}
