import { HavamalBrowser } from "@/components/havamal-browser";
import { JsonLd } from "@/components/json-ld";
import { getCompleteCorpus } from "@/lib/complete-corpus";
import { themeRegistry } from "@/lib/data";
import { absoluteUrl, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Browse the Hávamál",
  description:
    "Browse all Hávamál passages by word, phrase, theme, translator, or printed stanza number.",
  path: "/havamal",
  index: true,
});

export const dynamic = "force-static";
export const revalidate = 43_200;

export default async function Page() {
  const corpus = await getCompleteCorpus();

  return (
    <div className="page-shell">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Browse the Hávamál",
          url: absoluteUrl("/havamal"),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: corpus.passages.length,
            itemListElement: corpus.passages.map((passage, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: passage.internalReference,
              url: absoluteUrl(`/havamal/stanza/${passage.slug}`),
            })),
          },
        }}
      />
      <header className="page-heading">
        <h1>Browse the Hávamál</h1>
        <p>Search by word, phrase, theme, translator, or printed stanza number.</p>
      </header>
      <HavamalBrowser passages={corpus.passages} themes={themeRegistry} />
    </div>
  );
}
