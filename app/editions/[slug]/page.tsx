import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { editionRegistry, getEdition } from "@/lib/data";
import { getCompleteCorpus, getCompleteEditionSource } from "@/lib/complete-corpus";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";

export const revalidate = 86_400;
export const dynamicParams = false;

export function generateStaticParams() {
  return editionRegistry.map((edition) => ({ slug: edition.slug }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const edition = getEdition(slug);

  if (!edition) {
    return createMetadata({
      title: "Edition Not Found",
      description: "This Hávamál edition is not available.",
      path: `/editions/${slug}`,
      index: false,
    });
  }

  await getCompleteCorpus();
  const source = await getCompleteEditionSource(slug);
  const stanzaCount = source?.passages.length ?? 0;
  const name = edition.translator ?? edition.editor ?? edition.editionTitle;

  return createMetadata({
    title: `${name} Hávamál Translation (${edition.publicationYear})`,
    description: `Read about ${name}’s ${edition.publicationYear} Hávamál edition, including publication details, source information, license terms, and ${stanzaCount || "available"} stanzas.`,
    path: `/editions/${slug}`,
    index: edition.enabled && edition.fullTextDisplayAllowed && stanzaCount > 0,
  });
}

function availability(value: boolean, yes: string, no: string) {
  return value ? yes : no;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const edition = getEdition(slug);
  if (!edition) notFound();

  await getCompleteCorpus();
  const source = await getCompleteEditionSource(slug);
  const passages = source?.passages ?? [];

  const editionName = edition.translator ?? edition.editor ?? edition.editionTitle;

  return (
    <div className="page-shell">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Editions", path: "/editions" },
          { name: editionName, path: `/editions/${edition.slug}` },
        ])}
      />
      <header className="page-heading">
        <div>
          <div className="section-kicker">Edition</div>
          <h1>{edition.translator || edition.editor}</h1>
        </div>
        <p>
          <cite>{edition.editionTitle}</cite>, published {edition.publicationYear}.
        </p>
      </header>

      <div className="editorial-grid">
        <article className="span-7">
          <h2>Publication details</h2>
          <dl className="data-list">
            <dt>Work</dt>
            <dd>{edition.workTitle}</dd>
            <dt>Translator</dt>
            <dd>{edition.translator || "Not listed"}</dd>
            {edition.editor ? (
              <>
                <dt>Editor</dt>
                <dd>{edition.editor}</dd>
              </>
            ) : null}
            <dt>Year</dt>
            <dd>{edition.publicationYear}</dd>
            <dt>Language</dt>
            <dd>{edition.language}</dd>
            <dt>Text source</dt>
            <dd>
              <a href={edition.sourceLocation}>{edition.sourceProvider}</a>
            </dd>
          </dl>
        </article>

        <article className="span-5">
          <h2>Use and attribution</h2>
          <dl className="data-list">
            <dt>License</dt>
            <dd>{edition.licenseName}</dd>
            <dt>Read online</dt>
            <dd>{availability(edition.fullTextDisplayAllowed, "Available", "Unavailable")}</dd>
            <dt>Noncommercial reuse</dt>
            <dd>{availability(edition.noncommercialReuseAllowed, "Permitted", "Not confirmed")}</dd>
            <dt>Commercial reuse</dt>
            <dd>{availability(edition.commercialReuseAllowed, "Permitted", "Not confirmed")}</dd>
            <dt>Quote cards</dt>
            <dd>{availability(edition.quoteCardExportAllowed, "Available", "Unavailable")}</dd>
            <dt>Attribution</dt>
            <dd>{edition.attributionText}</dd>
          </dl>
        </article>
      </div>

      <h2 className="rule-heading">Stanzas in this edition</h2>
      {passages.length ? (
        <div className="passage-index">
          {passages.map((passage) => {
            const aligned =
              passage.review_status === "published" &&
              Boolean(passage.canonical_slug) &&
              passage.alignment_confidence !== "uncertain" &&
              passage.alignment_relation !== "uncertain";
            return (
              <Link
                href={`/editions/${slug}/stanza/${passage.source_stanza_number}`}
                className="passage-index-row"
                key={`${slug}-${passage.source_stanza_number}`}
              >
                <span>Stanza {passage.source_stanza_number}</span>
                <strong>{passage.text_lines[0] || "Open stanza"}</strong>
                <span>{aligned ? "Comparison available" : "Edition text"}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">The full text of this edition is not available here.</div>
      )}
    </div>
  );
}
