import Link from "next/link";
import { categories, getAllPassages } from "@/lib/data";

export const metadata = { title: "Reader discussion" };

export default function Page() {
  const passages = getAllPassages();

  return (
    <div className="page-shell">
      <header className="page-heading">
        <h1>Reader discussion</h1>
        <p>Ask questions, compare readings, and talk through the passages with other readers.</p>
      </header>

      <section className="notice">
        <strong>Keep the discussion tied to the text.</strong> Cite sources for factual claims,
        label personal reflection clearly, and challenge ideas without attacking people.
      </section>

      <h2 className="rule-heading">Categories</h2>
      <div className="card-list">
        {categories.map((category) => (
          <article className="flat-card" key={category.slug}>
            <h2>{category.title}</h2>
            <p>{category.description}</p>
            <Link href={`/discuss/category/${category.slug}`}>Open category</Link>
          </article>
        ))}
      </div>

      <h2 className="rule-heading">Passage discussions</h2>
      <div className="passage-index">
        {passages.map((passage) => {
          const primary = passage.editions[0];
          return (
            <Link
              className="passage-index-row"
              href={`/havamal/stanza/${passage.slug}#reader-discussion-heading`}
              key={passage.slug}
            >
              <span>{passage.internalReference}</span>
              <strong>
                {primary.edition.translator} stanza {primary.passage.source_stanza_number}
              </strong>
              <span>Read the discussion</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
