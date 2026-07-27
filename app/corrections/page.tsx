import { CorrectionForm } from "@/components/correction-form";
import { createMetadata } from "@/lib/seo";
export const metadata = createMetadata({
  title: "Report a Text or Source Correction",
  description: "Report a transcription error, stanza-number mismatch, missing line, attribution problem, or licensing concern in The Hávamál Archive.",
  path: "/corrections",
  index: true,
});



export default function Page() {
  return (
    <div className="narrow-shell">
      <header className="page-heading">
        <div>
          <div className="section-kicker">Found a problem?</div>
          <h1>Report a correction</h1>
        </div>
        <p>
          Send the passage, edition, and a supporting source so the issue can be checked.
        </p>
      </header>
      <CorrectionForm />
    </div>
  );
}
