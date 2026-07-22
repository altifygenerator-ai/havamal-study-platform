import Link from "next/link";
import manifests from "@/data/source-manifests.json";
import { editionRegistry, getSourceFiles } from "@/lib/data";
import type { SourceManifest } from "@/lib/types";

export const metadata = { title: "Sources" };

const statusLabels: Record<SourceManifest["acquisitionStatus"], string> = {
  bundled_partial: "Partial corpus bundled",
  ready_to_fetch: "Verified source ready",
  manual_review_required: "Scan review required",
  metadata_only: "Metadata only",
};

export default function Page() {
  const sourceFiles = getSourceFiles();
  const sourceManifests = manifests as SourceManifest[];

  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Source register</div>
          <h1>Texts are acquired by edition, not copied from mirrors.</h1>
        </div>
        <p>
          Public-domain or open-license status is only the beginning. Each local corpus also
          needs a traceable transcription, preserved numbering, validation, and editorial review.
        </p>
      </header>

      <div className="source-table" role="region" aria-label="Source registry" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th>Edition</th>
              <th>Local records</th>
              <th>Acquisition</th>
              <th>Rights</th>
              <th>Public display</th>
            </tr>
          </thead>
          <tbody>
            {editionRegistry.map((edition) => {
              const manifest = sourceManifests.find((entry) => entry.editionSlug === edition.slug);
              const source = sourceFiles.find((entry) => entry.edition.slug === edition.slug);
              const published = source?.passages.filter((passage) => passage.review_status === "published").length ?? 0;
              return (
                <tr key={edition.slug}>
                  <td>
                    <Link href={`/editions/${edition.slug}`}>
                      {edition.translator || edition.editor}: {edition.editionTitle}
                    </Link>
                    <small>{edition.publicationYear}</small>
                  </td>
                  <td>
                    {source?.passages.length ?? 0}
                    {source ? <small>{published} published</small> : <small>No text file</small>}
                  </td>
                  <td>{manifest ? statusLabels[manifest.acquisitionStatus] : "Unregistered"}</td>
                  <td>{edition.licenseName}</td>
                  <td>{edition.enabled && edition.fullTextDisplayAllowed ? "Enabled" : "Withheld"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="manuscript-notice">
        <div className="section-kicker">Editorial rule</div>
        <p>
          A fetched file is never published automatically. Imported stanzas begin in review,
          retain their printed edition number, and require a separate alignment decision before
          comparison. Copyrighted translations remain metadata-only without written permission.
        </p>
        <Link href="/methodology">How alignment works →</Link>
      </section>
    </div>
  );
}
