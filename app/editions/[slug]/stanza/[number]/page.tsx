import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PassageText } from "@/components/passage-text";
import { getCompleteEditionSource } from "@/lib/complete-corpus";
import { getEdition } from "@/lib/data";
import { cleanExcerpt, createMetadata } from "@/lib/seo";

export const revalidate = 86_400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; number: string }>;
}): Promise<Metadata> {
  const { slug, number } = await params;
  const edition = getEdition(slug);
  const source = edition ? await getCompleteEditionSource(slug) : null;
  const passage = source?.passages.find((item) => item.source_stanza_number === number);
  const name = edition?.translator ?? edition?.editor ?? edition?.editionTitle ?? "Hávamál";

  if (!edition || !passage) {
    return createMetadata({
      title: "Stanza Not Found",
      description: "This edition stanza is not available.",
      path: `/editions/${slug}/stanza/${number}`,
      index: false,
    });
  }

  return createMetadata({
    title: `${name} Hávamál stanza ${number}`,
    description: cleanExcerpt(passage.text_lines.join(" ")),
    path: `/editions/${slug}/stanza/${number}`,
    // Canonical comparison pages are the archive's primary search targets.  The
    // edition-native route exists so every printed stanza remains readable even
    // when its cross-edition alignment is not yet certain.
    index: false,
    type: "article",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; number: string }>;
}) {
  const { slug, number } = await params;
  const edition = getEdition(slug);
  if (!edition || !edition.enabled || !edition.fullTextDisplayAllowed) notFound();

  const source = await getCompleteEditionSource(slug);
  const passage = source?.passages.find((item) => item.source_stanza_number === number);
  if (!passage) notFound();

  const index = source!.passages.findIndex((item) => item.source_stanza_number === number);
  const previous = index > 0 ? source!.passages[index - 1] : null;
  const next = index >= 0 && index < source!.passages.length - 1 ? source!.passages[index + 1] : null;
  const aligned =
    passage.review_status === "published" &&
    passage.canonical_slug &&
    passage.alignment_confidence !== "uncertain" &&
    passage.alignment_relation !== "uncertain";

  return (
    <div className="page-shell edition-native-page">
      <nav className="breadcrumb-line" aria-label="Breadcrumb">
        <Link href="/editions">Editions</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/editions/${slug}`}>{edition.translator ?? edition.editor}</Link>
        <span aria-hidden="true">/</span>
        <span>Stanza {number}</span>
      </nav>

      <header className="page-heading compact-page-heading">
        <div>
          <div className="section-kicker">Printed edition</div>
          <h1>Stanza {number}</h1>
        </div>
        <p>
          <cite>{edition.editionTitle}</cite>, {edition.publicationYear}
        </p>
      </header>

      <PassageText
        edition={edition}
        passage={passage}
        showOldNorse={Boolean(passage.old_norse_lines?.length)}
      />

      <div className="edition-native-actions">
        {aligned ? (
          <Link href={`/havamal/stanza/${passage.canonical_slug}`}>
            Open aligned comparison →
          </Link>
        ) : (
          <span>This stanza is available in its printed edition without a claimed cross-edition match.</span>
        )}
      </div>

      <nav className="edition-stanza-nav" aria-label="Adjacent stanzas in this edition">
        {previous ? (
          <Link href={`/editions/${slug}/stanza/${previous.source_stanza_number}`}>
            ← Stanza {previous.source_stanza_number}
          </Link>
        ) : (
          <span />
        )}
        <Link href={`/editions/${slug}`}>Edition index</Link>
        {next ? (
          <Link href={`/editions/${slug}/stanza/${next.source_stanza_number}`}>
            Stanza {next.source_stanza_number} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
