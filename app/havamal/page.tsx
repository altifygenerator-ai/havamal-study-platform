import { HavamalBrowser } from "@/components/havamal-browser";
import { themeRegistry } from "@/lib/data";
import { getCompleteCorpus } from "@/lib/complete-corpus";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({
  title: "Browse the Hávamál",
  description: "Browse and search the Hávamál by word, phrase, theme, translator, or printed stanza number.",
  path: "/havamal",
  index: true,
});


export const revalidate = 43_200;

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
