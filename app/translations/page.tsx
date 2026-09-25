import Link from "next/link";

import { editionRegistry } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Hávamál Translations: Bellows, Thorpe, Bray & More",
  description:
    "Compare major English Hávamál translations by publication year, language, availability, and source, with links to editions you can read in the archive.",
  path: "/translations",
  index: true,
});

const readingNotes: Record<string, string> = {
  "bellows-1923":
    "A public-domain English translation published in 1923. The archive uses Bellows as its internal comparison anchor while preserving every edition’s own printed numbering.",
  "thorpe-1866":
    "A public-domain English translation from 1866. Thorpe’s printed stanza divisions differ in places from later editions, so the archive keeps his numbering intact.",
  "bray-1908":
    "A public-domain 1908 edition with English translation and Old Norse text, useful for readers who want the translation beside the original language.",
  "hollander-1928":
    "The original 1928 English translation. This archive uses only that public-domain U.S. edition, not Hollander’s later revised text.",
  "pettit-2023":
    "A modern dual-language English and Old Norse edition released under CC BY-NC 4.0. It is available here only while the archive remains noncommercial.",
  "crawford-permission-pending":
    "A modern copyrighted English translation. The archive provides bibliographic information and an official source link but does not reproduce the text.",
};

function availabilityText(slug: string) {
  const edition = editionRegistry.find((item) => item.slug === slug);
  if (!edition) return "";
  if (edition.fullTextDisplayAllowed && edition.enabled) return "Read in the archive";
  return "Edition information";
}

export default function Page() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Choosing an edition</div>
          <h1>Hávamál translations</h1>
        </div>
        <p>
          The wording, stanza divisions, notes, and tone vary from edition to edition.
          Use this guide to identify what you are reading before comparing individual
          passages.
        </p>
      </header>

      <section className="manuscript-note">
        <h2>There is no single English Hávamál translation.</h2>
        <p>
          The poem survives in Old Norse, while English editions reflect different
          editorial choices and different periods of scholarship. The archive preserves
          each edition’s printed numbering instead of forcing every translation into the
          same sequence.
        </p>
        <p>
          <Link href="/compare">Open the translation comparison tool →</Link>
        </p>
      </section>

      <div className="card-list">
        {editionRegistry.map((edition) => {
          const name = edition.translator ?? edition.editor ?? edition.editionTitle;
          return (
            <article className="flat-card" key={edition.slug}>
              <div className="section-kicker">
                {edition.publicationYear} · {availabilityText(edition.slug)}
              </div>
              <h2>{name}</h2>
              <p>
                <cite>{edition.editionTitle}</cite>
              </p>
              <p>{readingNotes[edition.slug] ?? edition.language}</p>
              <dl className="data-list">
                <dt>Language</dt>
                <dd>{edition.language}</dd>
                <dt>Rights</dt>
                <dd>{edition.licenseName}</dd>
              </dl>
              <Link href={`/editions/${edition.slug}`}>View edition details →</Link>
            </article>
          );
        })}
      </div>

      <section className="manuscript-note">
        <h2>Looking for a free copy?</h2>
        <p>
          The archive also keeps a short guide to legal public-domain scans, ebooks, and
          openly licensed editions.
        </p>
        <Link href="/free-editions">Find free Hávamál editions →</Link>
      </section>
    </div>
  );
}
