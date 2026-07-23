import Link from "next/link";
import { notFound } from "next/navigation";
import { getPassage } from "@/lib/data";
import { getStarterGuide, starterGuides } from "@/lib/study-guides";

export function generateStaticParams() {
  return starterGuides.map((guide) => ({ slug: guide.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getStarterGuide(slug);
  if (!guide) notFound();
  const passages = guide.passageSlugs.map(getPassage).filter(Boolean);

  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Study guide</div>
          <h1>{guide.title}</h1>
        </div>
        <p>{guide.description}</p>
      </header>
      <div className="guide-grid">
        <aside>
          <h2>Questions to carry</h2>
          <ol>
            {guide.prompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ol>
          <Link className="button" href="/account">
            Sign in to save notes
          </Link>
        </aside>
        <div className="passage-index">
          {passages.map((passage) => {
            if (!passage) return null;
            const primary = passage.editions[0];
            return (
              <Link
                className="passage-index-row"
                href={`/havamal/stanza/${passage.slug}`}
                key={passage.slug}
              >
                <span>{passage.internalReference}</span>
                <strong>
                  {primary.edition.translator} stanza {primary.passage.source_stanza_number}
                </strong>
                <span>{passage.themes.join(", ")}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
