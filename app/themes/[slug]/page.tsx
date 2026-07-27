import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { getTheme, themeRegistry } from "@/lib/data";
import { getCompleteCorpus } from "@/lib/complete-corpus";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";

export const revalidate = 86_400;
export const dynamicParams = false;

export function generateStaticParams() {
  return themeRegistry.map((theme) => ({ slug: theme.slug }));
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const theme = getTheme(slug);
  if (!theme) {
    return createMetadata({ title: "Theme Not Found", description: "This Hávamál theme is not available.", path: `/themes/${slug}`, index: false });
  }
  const corpus = await getCompleteCorpus();
  const count = corpus.passages.filter((passage) => passage.themes.includes(slug)).length;
  return createMetadata({
    title: `${theme.title} in the Hávamál`,
    description: `${theme.description} Read and compare ${count || "related"} Hávamál passages connected with ${theme.title.toLowerCase()}.`,
    path: `/themes/${slug}`,
    index: count > 0,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = getTheme(slug);
  if (!theme) notFound();
  const corpus = await getCompleteCorpus();
  const passages = corpus.passages.filter((passage) => passage.themes.includes(slug));

  return (
    <div className="page-shell">
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Themes", path: "/themes" },
        { name: theme.title, path: `/themes/${theme.slug}` },
      ])} />
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
