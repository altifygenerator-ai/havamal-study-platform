import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AllEditionTexts } from "@/components/all-edition-texts";
import { DiscussionThread } from "@/components/discussion-thread";
import { EditionTabs } from "@/components/edition-tabs";
import { JsonLd } from "@/components/json-ld";
import { StudyActions } from "@/components/study-actions";
import { getCompleteCorpus, getCompletePassage } from "@/lib/complete-corpus";
import { getAllPassages } from "@/lib/data";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  cleanExcerpt,
  createMetadata,
} from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 86_400;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const corpus = await getCompleteCorpus();
    return corpus.passages.map((passage) => ({ slug: passage.slug }));
  } catch {
    return getAllPassages().map((passage) => ({ slug: passage.slug }));
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const passage = await getCompletePassage(slug);

  if (!passage?.editions.length) {
    return createMetadata({
      title: "Hávamál Passage Not Found",
      description: "This Hávamál passage is not available.",
      path: `/havamal/stanza/${slug}`,
      index: false,
    });
  }

  const primary = passage.editions[0];
  const stanzaNumber = primary.passage.source_stanza_number;
  const translator =
    primary.edition.translator ?? primary.edition.editor ?? "this edition";
  const translators = passage.editions
    .map(({ edition }) => edition.translator ?? edition.editor)
    .filter((name): name is string => Boolean(name));
  const excerpt = cleanExcerpt(primary.passage.text_lines.join(" "), 112);
  const comparison =
    translators.length > 1
      ? ` Compare ${translators.slice(0, 4).join(", ")}.`
      : "";

  return createMetadata({
    title: `Hávamál Stanza ${stanzaNumber} — ${translator}`,
    description: `Read Hávamál stanza ${stanzaNumber} in ${translator}.${comparison} ${excerpt}`,
    path: `/havamal/stanza/${slug}`,
    type: "article",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const corpus = await getCompleteCorpus();
  const passage = corpus.passages.find((item) => item.slug === slug);
  if (!passage) notFound();

  const index = corpus.passages.findIndex((item) => item.slug === passage.slug);
  const previous = index > 0 ? corpus.passages[index - 1] : null;
  const next =
    index < corpus.passages.length - 1 ? corpus.passages[index + 1] : null;
  const primary = passage.editions[0];
  const pagePath = `/havamal/stanza/${passage.slug}`;
  const translator =
    primary.edition.translator ?? primary.edition.editor ?? "Unknown translator";
  const stanzaNumber = primary.passage.source_stanza_number;

  const related = corpus.passages
    .filter((candidate) => candidate.slug !== passage.slug)
    .map((candidate) => ({
      passage: candidate,
      sharedThemes: candidate.themes.filter((theme) =>
        passage.themes.includes(theme),
      ).length,
    }))
    .filter(({ sharedThemes }) => sharedThemes > 0)
    .sort(
      (left, right) =>
        right.sharedThemes - left.sharedThemes ||
        left.passage.slug.localeCompare(right.passage.slug, undefined, {
          numeric: true,
        }),
    )
    .slice(0, 4)
    .map(({ passage: relatedPassage }) => relatedPassage);

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Hávamál", path: "/havamal" },
      { name: `Stanza ${stanzaNumber}`, path: pagePath },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: `Hávamál stanza ${stanzaNumber}`,
      headline: `Hávamál stanza ${stanzaNumber}`,
      url: absoluteUrl(pagePath),
      isPartOf: {
        "@type": "CreativeWork",
        name: "Hávamál",
        url: absoluteUrl("/havamal"),
      },
      about: passage.themes,
      hasPart: passage.editions.map(({ edition, passage: editionPassage }) => ({
        "@type": "CreativeWork",
        name: `${edition.translator ?? edition.editor} stanza ${editionPassage.source_stanza_number}`,
        text: editionPassage.text_lines.join("\n"),
        inLanguage: edition.language.toLowerCase().includes("english")
          ? "en"
          : undefined,
        translator: edition.translator
          ? { "@type": "Person", name: edition.translator }
          : undefined,
        editor: edition.editor
          ? { "@type": "Person", name: edition.editor }
          : undefined,
        datePublished: String(edition.publicationYear),
        citation: editionPassage.source_reference,
      })),
    },
  ];

  return (
    <div className="page-shell">
      <JsonLd data={structuredData} />
      <header className="page-heading">
        <div>
          <div className="section-kicker">Hávamál · {passage.section}</div>
          <h1>
            {translator} stanza {stanzaNumber}
          </h1>
        </div>
        {passage.editions.length > 1 ? (
          <p>{passage.editions.length} translations are aligned to this passage.</p>
        ) : null}
      </header>

      <div className="stanza-layout">
        <section>
          <EditionTabs passage={passage} />

          <nav className="mobile-passage-actions" aria-label="Passage actions">
            {previous ? (
              <Link href={`/havamal/stanza/${previous.slug}`}>← Previous</Link>
            ) : (
              <span>Beginning</span>
            )}
            <Link href={`/compare?passage=${passage.slug}`}>Compare</Link>
            <Link href={`/quote-maker?passage=${passage.slug}`}>Quote</Link>
            {next ? (
              <Link href={`/havamal/stanza/${next.slug}`}>Next →</Link>
            ) : (
              <span>End</span>
            )}
          </nav>

          <AllEditionTexts
            excludeEditionSlug={primary.edition.slug}
            passage={passage}
          />

          <section className="source-panel">
            <div className="section-kicker">Source</div>
            <h2>{primary.edition.editionTitle}</h2>
            <p>{primary.edition.attributionText}</p>
            <dl>
              <dt>Translator or editor</dt>
              <dd>{translator}</dd>
              <dt>Published</dt>
              <dd>{primary.edition.publicationYear}</dd>
              <dt>License</dt>
              <dd>{primary.edition.licenseName}</dd>
              <dt>Text source</dt>
              <dd>
                <a href={primary.passage.source_reference}>
                  {primary.edition.sourceProvider}
                </a>
              </dd>
            </dl>
          </section>

          {related.length ? (
            <section>
              <h2 className="rule-heading">Related passages</h2>
              <div className="editorial-grid">
                {related.map((relatedPassage) => {
                  const relatedPrimary = relatedPassage.editions[0];
                  return (
                    <article className="span-6 manuscript-note" key={relatedPassage.slug}>
                      <div className="section-kicker">
                        {relatedPassage.internalReference}
                      </div>
                      <h3>
                        {relatedPrimary.edition.translator ??
                          relatedPrimary.edition.editor}{" "}
                        stanza {relatedPrimary.passage.source_stanza_number}
                      </h3>
                      <p>
                        {cleanExcerpt(
                          relatedPrimary.passage.text_lines.join(" "),
                          140,
                        )}
                      </p>
                      <Link href={`/havamal/stanza/${relatedPassage.slug}`}>
                        Read passage →
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          <StudyActions canonicalSlug={passage.slug} />
        </section>

        <aside className="stanza-meta">
          <div className="section-kicker">Passage details</div>
          <dl>
            <dt>Passage</dt>
            <dd>{passage.internalReference}</dd>
            <dt>Edition numbers</dt>
            <dd>
              {passage.editions.map(({ edition, passage: editionPassage }) => (
                <span className="edition-reference-line" key={edition.slug}>
                  {edition.translator ?? edition.editor}{" "}
                  {editionPassage.source_stanza_number}
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
              <Link href={`/compare?passage=${passage.slug}`}>
                Compare translations
              </Link>
              <br />
              <Link href={`/quote-maker?passage=${passage.slug}`}>
                Make a quote card
              </Link>
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
              {next ? (
                <Link href={`/havamal/stanza/${next.slug}`}>Next →</Link>
              ) : (
                "End"
              )}
            </p>
          </nav>
        </aside>
      </div>

      <div data-nosnippet>
        <DiscussionThread canonicalSlug={passage.slug} />
      </div>
    </div>
  );
}
