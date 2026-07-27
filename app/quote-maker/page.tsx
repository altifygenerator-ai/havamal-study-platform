import { QuoteMaker } from "@/components/quote-maker";
import { getCompleteCorpus } from "@/lib/complete-corpus";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({
  title: "Hávamál Quote-Card Maker",
  description: "Create a text-first Hávamál quote card using exact stanza wording and required edition-specific attribution.",
  path: "/quote-maker",
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
        <h1>Quote-card maker</h1>
        <p>Choose a stanza, select its lines, and create a properly credited image.</p>
      </header>
      <QuoteMaker passages={corpus.passages} initialSlug={passage} />
    </div>
  );
}
