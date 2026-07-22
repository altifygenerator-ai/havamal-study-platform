import Link from "next/link";
import { starterGuides } from "@/lib/study-guides";
export const metadata={title:"Study guides"};
export default function Page(){return <div className="page-shell"><header className="page-heading"><h1>Study guides</h1><p>These guides arrange texts and questions for comparison. They are not lessons with required conclusions.</p></header><div className="card-list">{starterGuides.map(g=><article className="flat-card" key={g.slug}><div className="section-kicker">{g.passageSlugs.length} passages</div><h2>{g.title}</h2><p>{g.description}</p><Link href={`/study/${g.slug}`}>Open guide</Link></article>)}</div></div>}
