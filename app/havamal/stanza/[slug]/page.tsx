import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiscussionThread } from "@/components/discussion-thread";
import { EditionTabs } from "@/components/edition-tabs";
import { StudyActions } from "@/components/study-actions";
import { getAllPassages } from "@/lib/data";
import { getCompleteCorpus, getCompletePassage } from "@/lib/complete-corpus";

export function generateStaticParams() {
  return getAllPassages().map((passage) => ({ slug: passage.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const passage = await getCompletePassage(slug);
  if (!passage) return { title: "Passage not found" };
  const primary = passage.editions[0];
  return {
    title: `Hávamál ${primary.passage.source_stanza_number} in ${primary.edition.translator}`,
    description: `Read, compare, cite, and discuss ${primary.edition.translator} stanza ${primary.passage.source_stanza_number}.`,
    alternates: { canonical: `/havamal/stanza/${slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const corpus = await getCompleteCorpus();
  const passage = corpus.passages.find((item) => item.slug === slug);
  if (!passage) notFound();

  const index = corpus.passages.findIndex((item) => item.slug === passage.slug);
  const previous = index > 0 ? corpus.passages[index - 1] : null;
  const next = index < corpus.passages.length - 1 ? corpus.passages[index + 1] : null;
  const primary = passage.editions[0];

  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Hávamál · {passage.section}</div>
          <h1>
            {primary.edition.translator} stanza {primary.passage.source_stanza_number}
          </h1>
        </div>
        <p>
          Stanza divisions and numbering vary between editions. This page aligns related
          passages while preserving each edition’s original numbering.
        </p>
      </header>

      <div className="stanza-layout">
        <section>
          <EditionTabs passage={passage} />

          <section className="source-panel">
            <div className="section-kicker">Source notes</div>
            <h2>{primary.edition.editionTitle}</h2>
            <p>{primary.edition.attributionText}</p>
            <dl>
              <dt>License</dt>
              <dd>{primary.edition.licenseName}</dd>
              <dt>Transcription source</dt>
              <dd>
                <a href={primary.passage.source_reference}>{primary.edition.sourceProvider}</a>
              </dd>
              <dt>Alignment</dt>
              <dd>
                {primary.passage.alignment_confidence ?? "not recorded"}
                {primary.passage.alignment_note ? ` · ${primary.passage.alignment_note}` : ""}
              </dd>
            </dl>
          </section>

          <section>
            <h2 className="rule-heading">Published commentary</h2>
            <p className="notice">
              These readings are presented for comparison. Inclusion does not mean the
              project declares one reading correct.
            </p>
            <div className="empty-state">
              No reviewed published commentary has been added for this passage.
            </div>
          </section>

          <StudyActions canonicalSlug={passage.slug} />
        </section>

        <aside className="stanza-meta">
          <div className="section-kicker">Reference rail</div>
          <dl>
            <dt>Aligned reference</dt>
            <dd>{passage.internalReference}</dd>
            <dt>Available editions</dt>
            <dd>
              {passage.editions.map(({ edition, passage: editionPassage }) => (
                <span className="edition-reference-line" key={edition.slug}>
                  {edition.translator ?? edition.editor} {editionPassage.source_stanza_number}
                </span>
              ))}
            </dd>
            <dt>Themes</dt>
            <dd className="theme-tags">
              {passage.themes.map((theme) => (
                <Link className="theme-tag" href={`/themes/${theme}`} key={theme}>
                  {theme}
                </Link>
              ))}
            </dd>
            <dt>Actions</dt>
            <dd>
              <Link href={`/compare?passage=${passage.slug}`}>Compare</Link>
              <br />
              <Link href={`/quote-maker?passage=${passage.slug}`}>Make quote card</Link>
              <br />
              <Link href="/corrections">Report a correction</Link>
            </dd>
          </dl>
          <nav aria-label="Adjacent passages">
            <p>
              {previous ? (
                <Link href={`/havamal/stanza/${previous.slug}`}>← Previous</Link>
              ) : (
                "Beginning"
              )}
            </p>
            <p>
              {next ? <Link href={`/havamal/stanza/${next.slug}`}>Next →</Link> : "End"}
            </p>
          </nav>
        </aside>
      </div>

      <DiscussionThread canonicalSlug={passage.slug} />
    </div>
  );
}
