import Link from "next/link";

import { editionRegistry } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Free Hávamál PDFs, Scans, and Public-Domain Editions",
  description:
    "Find legal free Hávamál editions from Project Gutenberg, Internet Archive, and Open Book Publishers, with clear public-domain and license information.",
  path: "/free-editions",
  index: true,
});

const sourceNotes: Record<string, string> = {
  "bellows-1923":
    "Project Gutenberg provides the public-domain Bellows edition in free ebook and text formats.",
  "thorpe-1866":
    "Project Gutenberg provides Thorpe’s public-domain Edda, including the Hávamál, in free ebook and text formats.",
  "bray-1908":
    "Internet Archive hosts a scan of Bray’s 1908 public-domain edition. Download formats, including scan-derived PDF options, are provided by Internet Archive.",
  "hollander-1928":
    "The archive records the original 1928 Hollander edition as public domain in the United States. Use the edition page below for source and rights details.",
  "pettit-2023":
    "Open Book Publishers provides Pettit’s modern dual-language edition under CC BY-NC 4.0. It is free to read and reuse noncommercially with attribution.",
};

const slugs = [
  "bellows-1923",
  "thorpe-1866",
  "bray-1908",
  "hollander-1928",
  "pettit-2023",
];

export default function Page() {
  const editions = slugs
    .map((slug) => editionRegistry.find((edition) => edition.slug === slug))
    .filter((edition): edition is NonNullable<typeof edition> => Boolean(edition));

  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Free and legal sources</div>
          <h1>Hávamál PDFs, scans, and free editions</h1>
        </div>
        <p>
          If you are looking for a free Hávamál PDF or ebook, start with editions whose
          reuse status is clear. Not every source is a PDF, so each entry below names the
          format and rights that are actually available.
        </p>
      </header>

      <section className="manuscript-note">
        <h2>Use the edition, not an unattributed repost.</h2>
        <p>
          Translator, publication year, and source matter when quoting or comparing the
          Hávamál. These links point to established archives or the publisher rather than
          anonymous copies.
        </p>
      </section>

      <div className="card-list">
        {editions.map((edition) => {
          const name = edition.translator ?? edition.editor ?? edition.editionTitle;
          return (
            <article className="flat-card" key={edition.slug}>
              <div className="section-kicker">{edition.publicationYear}</div>
              <h2>{name}</h2>
              <p>
                <cite>{edition.editionTitle}</cite>
              </p>
              <p>{sourceNotes[edition.slug]}</p>
              <p>
                <strong>{edition.licenseName}</strong>
              </p>
              <p>
                <a href={edition.sourceLocation}>Open the source →</a>
              </p>
              <Link href={`/editions/${edition.slug}`}>Edition details →</Link>
            </article>
          );
        })}
      </div>

      <section className="manuscript-note">
        <h2>Want to compare the wording instead?</h2>
        <p>
          Use the archive’s aligned passage pages or the comparison tool rather than
          switching back and forth between separate books.
        </p>
        <p>
          <Link href="/translations">Choose a translation →</Link>
          <br />
          <Link href="/compare">Compare translations →</Link>
        </p>
      </section>
    </div>
  );
}
