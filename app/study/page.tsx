import Link from "next/link";
import { starterGuides } from "@/lib/study-guides";

export const metadata = { title: "Study guides" };

export default function Page() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <h1>Study guides</h1>
        <p>Read connected passages together and carry a few good questions with you.</p>
      </header>
      <div className="card-list">
        {starterGuides.map((guide) => (
          <article className="flat-card" key={guide.slug}>
            <div className="section-kicker">{guide.passageSlugs.length} passages</div>
            <h2>{guide.title}</h2>
            <p>{guide.description}</p>
            <Link href={`/study/${guide.slug}`}>Begin this guide</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
