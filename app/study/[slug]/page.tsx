import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { getCompleteCorpus } from "@/lib/complete-corpus";
import { getStarterGuide, starterGuides } from "@/lib/study-guides";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";

export const revalidate = 86_400;
export const dynamicParams = false;

export function generateStaticParams() {
  return starterGuides.map((guide) => ({ slug: guide.slug }));
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getStarterGuide(slug);
  if (!guide) {
    return createMetadata({ title: "Study Guide Not Found", description: "This Hávamál study guide is not available.", path: `/study/${slug}`, index: false });
  }
  return createMetadata({
    title: guide.title,
    description: `${guide.description} Compare selected Hávamál passages and carry the guide’s questions into your own reading.`,
    path: `/study/${slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getStarterGuide(slug);
  if (!guide) notFound();
  const corpus = await getCompleteCorpus();
  const passageMap = new Map(corpus.passages.map((passage) => [passage.slug, passage]));
  const passages = guide.passageSlugs.map((passageSlug) => passageMap.get(passageSlug)).filter(Boolean);

  return (
    <div className="page-shell">
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Study Guides", path: "/study" },
        { name: guide.title, path: `/study/${guide.slug}` },
      ])} />
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
