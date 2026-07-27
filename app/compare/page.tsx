import { CompareTool } from "@/components/compare-tool";
import { getCompleteCorpus } from "@/lib/complete-corpus";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({
  title: "Compare Hávamál Translations",
  description: "Compare Hávamál stanzas across available English translations and Old Norse texts while preserving each edition’s wording and numbering.",
  path: "/compare",
  index: true,
});


export const revalidate = 43_200;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ passage?: string }>;
}) {
  const [{ passage }, corpus] = await Promise.all([searchParams, getCompleteCorpus()]);
  return (
    <div className="page-shell">
      <header className="page-heading">
        <h1>Compare translations</h1>
        <p>Choose a passage and place up to four editions beside one another.</p>
      </header>
      <CompareTool passages={corpus.passages} initialSlug={passage} />
    </div>
  );
}
