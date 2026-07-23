import Link from "next/link";
import { AccountUtility } from "@/components/account-utility";
import { SearchBox } from "@/components/search-box";

const navItems = [
  ["/havamal", "Texts"],
  ["/editions", "Editions"],
  ["/themes", "Themes"],
  ["/compare", "Compare"],
  ["/study", "Study"],
  ["/discuss", "Discussion"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className="utility-strip">
        <p>Free to read · Built for close study</p>
        <div className="utility-links">
          <Link href="/sources">Sources</Link>
          <AccountUtility />
        </div>
      </div>

      <div className="masthead">
        <Link className="masthead-mark" href="/" aria-label="The Hávamál Archive home">
          <span aria-hidden="true">H</span>
        </Link>

        <div className="masthead-title">
          <span className="masthead-overline">The</span>
          <Link href="/">Hávamál Archive</Link>
          <p>Texts, translations, notes, and reader discussion.</p>
        </div>

        <div className="masthead-search">
          <SearchBox compact />
          <p>Read the text. Compare the translations. Form your own understanding.</p>
        </div>
      </div>

      <div className="archive-index-bar">
        <span aria-hidden="true">Index</span>
        <nav className="archive-nav" aria-label="Primary navigation">
          {navItems.map(([href, label], index) => (
            <Link href={href} key={href}>
              <small>{String(index + 1).padStart(2, "0")}</small>
              {label}
            </Link>
          ))}
          <Link href="/quote-maker">
            <small>07</small>
            Quote maker
          </Link>
        </nav>
      </div>
    </header>
  );
}
