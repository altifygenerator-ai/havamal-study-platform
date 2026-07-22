import Link from "next/link";
import { editionRegistry } from "@/lib/data";
export const metadata={title:"Editions and translators"};
export default function Page(){return <div className="page-shell"><header className="page-heading"><h1>Editions & translators</h1><p>Registry entries distinguish verified display rights, permission status, attribution requirements, and edition-specific numbering.</p></header><div className="card-list">{editionRegistry.map(e=><article className="flat-card" key={e.slug}><div className="section-kicker">{e.enabled?"Available":"Registry only"}</div><h2>{e.translator||e.editor}</h2><p><cite>{e.editionTitle}</cite> ({e.publicationYear})</p><p>{e.licenseName}</p><Link href={`/editions/${e.slug}`}>Edition record</Link></article>)}</div></div>}
