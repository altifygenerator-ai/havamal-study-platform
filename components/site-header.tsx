import Link from "next/link";
import { AccountUtility } from "@/components/account-utility";
import { SearchBox } from "@/components/search-box";
import { PrimaryNav } from "@/components/primary-nav";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <div className="utility-strip">
        <p>Free to read</p>
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
        <PrimaryNav />
      </div>
    </header>
  );
}
