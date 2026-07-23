import Link from "next/link";
import { notFound } from "next/navigation";
import { editionRegistry, getEdition } from "@/lib/data";
import { getCompleteCorpus } from "@/lib/complete-corpus";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return editionRegistry.map((edition) => ({ slug: edition.slug }));
}

function availability(value: boolean, yes: string, no: string) {
  return value ? yes : no;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const edition = getEdition(slug);
  if (!edition) notFound();

  const corpus = await getCompleteCorpus();
  const passages = corpus.passages.filter((passage) =>
    passage.editions.some(({ edition: passageEdition }) => passageEdition.slug === slug),
  );

  return (
    <div className="page-shell">
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
            const match = passage.editions.find(
              ({ edition: passageEdition }) => passageEdition.slug === slug,
            );
            if (!match) return null;
            return (
              <Link
                href={`/havamal/stanza/${passage.slug}`}
                className="passage-index-row"
                key={passage.slug}
              >
                <span>{passage.internalReference}</span>
                <strong>Stanza {match.passage.source_stanza_number}</strong>
                <span>{match.passage.section}</span>
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
