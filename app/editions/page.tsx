import Link from "next/link";
import { editionRegistry } from "@/lib/data";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({
  title: "Hávamál Editions and Translators",
  description: "Browse Hávamál editions and translators, including publication details, source information, license terms, and available stanzas.",
  path: "/editions",
  index: true,
});



export default function Page() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <h1>Editions & translators</h1>
        <p>
          Read the Hávamál through translators working in different periods, styles,
          and scholarly traditions.
        </p>
      </header>
      <nav className="folio-actions" aria-label="Edition guides">
        <Link href="/translations">Which translation should I read?</Link>
        <Link href="/free-editions">Free editions, scans, and PDFs</Link>
      </nav>
      <div className="card-list">
        {editionRegistry.map((edition) => (
          <article className="flat-card" key={edition.slug}>
            <div className="section-kicker">
              {edition.enabled ? "Read online" : "Edition overview"}
            </div>
            <h2>{edition.translator || edition.editor}</h2>
            <p>
              <cite>{edition.editionTitle}</cite> ({edition.publicationYear})
            </p>
            <p>{edition.licenseName}</p>
            <Link href={`/editions/${edition.slug}`}>
              {edition.enabled ? "Open this edition" : "About this edition"}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
