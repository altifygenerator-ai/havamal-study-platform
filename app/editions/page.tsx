import Link from "next/link";
import { editionRegistry } from "@/lib/data";

export const metadata = { title: "Editions and translators" };

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
