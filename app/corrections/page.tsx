import { CorrectionForm } from "@/components/correction-form";
export const metadata={title:"Corrections"};
export default function Page(){return <div className="narrow-shell"><header className="page-heading"><div><div className="section-kicker">Editorial transparency</div><h1>Report a correction</h1></div><p>Text is never silently changed. Accepted corrections create a revision record and appear in edition history.</p></header><CorrectionForm/></div>}
