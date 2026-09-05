import Link from "next/link";
import { themeRegistry } from "@/lib/data";
import { getCompleteCorpus } from "@/lib/complete-corpus";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({
  title: "Hávamál Themes",
  description: "Browse Hávamál passages by themes such as hospitality, friendship, speech, wisdom, moderation, reputation, death, memory, and runes.",
  path: "/themes",
  index: true,
});



export const revalidate = 86_400;

export default async function Page() {
  const corpus = await getCompleteCorpus();
  const counts = new Map(
    themeRegistry.map((theme) => [
      theme.slug,
      corpus.passages.filter((passage) => passage.themes.includes(theme.slug)).length,
    ]),
  );

  return (
    <div className="page-shell">
      <header className="page-heading">
        <h1>Study by theme</h1>
        <p>Follow recurring ideas through passages that speak to one another.</p>
      </header>
      <div className="card-list">
        {themeRegistry.map((theme) => (
          <article className="flat-card" key={theme.slug}>
            <div className="section-kicker">
              {counts.get(theme.slug) ?? 0} passages
            </div>
            <h2>{theme.title}</h2>
            <p>{theme.description}</p>
            <Link href={`/themes/${theme.slug}`}>Read this theme</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
