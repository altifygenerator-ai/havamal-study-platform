import { HavamalBrowser } from "@/components/havamal-browser";
import { themeRegistry } from "@/lib/data";
import { getCompleteCorpus } from "@/lib/complete-corpus";

export const metadata = { title: "Browse the Hávamál" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const corpus = await getCompleteCorpus();
  return (
    <div className="page-shell">
      <header className="page-heading">
        <h1>Browse the Hávamál</h1>
        <p>Search by word, phrase, theme, translator, or printed stanza number.</p>
      </header>
      <HavamalBrowser passages={corpus.passages} themes={themeRegistry} />
    </div>
  );
}
