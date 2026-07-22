import { QuoteMaker } from "@/components/quote-maker";
import { getCompleteCorpus } from "@/lib/complete-corpus";

export const metadata = { title: "Quote-card maker" };
export const dynamic = "force-dynamic";

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
        <p>
          Export exact text with mandatory edition-specific attribution. Text-first
          layouts are the default.
        </p>
      </header>
      <QuoteMaker passages={corpus.passages} initialSlug={passage} />
    </div>
  );
}
