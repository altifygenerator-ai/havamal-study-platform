import { CompareTool } from "@/components/compare-tool";
import { getCompleteCorpus } from "@/lib/complete-corpus";

export const metadata = { title: "Compare translations" };
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
        <h1>Compare translations</h1>
        <p>Choose a passage and place up to four editions beside one another.</p>
      </header>
      <CompareTool passages={corpus.passages} initialSlug={passage} />
    </div>
  );
}
