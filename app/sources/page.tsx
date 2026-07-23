import Link from "next/link";
import manifests from "@/data/source-manifests.json";
import { editionRegistry } from "@/lib/data";
import { getCompleteCorpus } from "@/lib/complete-corpus";
import type { SourceManifest } from "@/lib/types";

export const metadata = { title: "Sources" };
export const dynamic = "force-dynamic";

const availabilityLabels: Record<SourceManifest["acquisitionStatus"], string> = {
  bundled_partial: "Selected text available",
  ready_to_fetch: "Full text available",
  manual_review_required: "Being checked against the printed edition",
  metadata_only: "Publication details only",
};

export default async function Page() {
  const corpus = await getCompleteCorpus();
  const sourceManifests = manifests as SourceManifest[];
  const stanzaCounts = new Map<string, number>();

  for (const passage of corpus.passages) {
    for (const { edition } of passage.editions) {
      stanzaCounts.set(edition.slug, (stanzaCounts.get(edition.slug) ?? 0) + 1);
    }
  }

  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Sources</div>
          <h1>Every translation begins with a named edition.</h1>
        </div>
        <p>
          The archive identifies where each text came from, who translated or edited it,
          when it was published, and how it may be shared.
        </p>
      </header>

      <div className="source-table" role="region" aria-label="Edition sources" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th>Edition</th>
              <th>Text on the archive</th>
              <th>Availability</th>
              <th>License</th>
              <th>Read online</th>
            </tr>
          </thead>
          <tbody>
            {editionRegistry.map((edition) => {
              const manifest = sourceManifests.find(
                (entry) => entry.editionSlug === edition.slug,
              );
              const stanzaCount = stanzaCounts.get(edition.slug) ?? 0;

              return (
                <tr key={edition.slug}>
                  <td>
                    <Link href={`/editions/${edition.slug}`}>
                      {edition.translator || edition.editor}: {edition.editionTitle}
                    </Link>
                    <small>{edition.publicationYear}</small>
                  </td>
                  <td>{stanzaCount ? `${stanzaCount} stanzas` : "Not included"}</td>
                  <td>
                    {stanzaCount
                      ? "Available now"
                      : manifest
                        ? availabilityLabels[manifest.acquisitionStatus]
                        : "Edition overview"}
                  </td>
                  <td>{edition.licenseName}</td>
                  <td>{stanzaCount ? "Yes" : "No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="manuscript-notice">
        <div className="section-kicker">Why editions stay separate</div>
        <p>
          Translators sometimes number, divide, or arrange the poem differently. The
          archive keeps those differences visible rather than quietly rewriting one text
          to match another.
        </p>
        <Link href="/methodology">Read how the texts are compared →</Link>
      </section>
    </div>
  );
}
