import Link from "next/link";
import { getPassagesForTheme, themeRegistry } from "@/lib/data";

export const metadata = { title: "Themes" };

export default function Page() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <h1>Study by theme</h1>
        <p>Follow recurring ideas through passages that speak to one another.</p>
      </header>
      <div className="card-list">
        {themeRegistry.map((theme) => (
          <article className="flat-card" key={theme.slug}>
            <div className="section-kicker">
              {getPassagesForTheme(theme.slug).length} passages
            </div>
            <h2>{theme.title}</h2>
            <p>{theme.description}</p>
            <Link href={`/themes/${theme.slug}`}>Read this theme</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
