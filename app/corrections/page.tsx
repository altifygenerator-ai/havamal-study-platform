import { CorrectionForm } from "@/components/correction-form";

export const metadata = { title: "Corrections" };

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
