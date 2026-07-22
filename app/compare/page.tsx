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
        <p>
          Select an aligned passage and view up to four available editions without
          compressing their line breaks.
        </p>
      </header>
      <CompareTool passages={corpus.passages} initialSlug={passage} />
    </div>
  );
}
