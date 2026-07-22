import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-wordmark">
        <span aria-hidden="true">H</span>
        <div>
          <strong>The Hávamál Archive</strong>
          <p>Texts, translations, notes, and reader discussion.</p>
        </div>
      </div>
      <div>
        <p className="footer-note">
          A free reader-built resource. Source text, editorial material, and community
          discussion remain visibly separate.
        </p>
        <nav aria-label="Footer navigation">
          <Link href="/methodology">Methodology</Link>
          <Link href="/licensing">Licensing</Link>
          <Link href="/sources">Sources</Link>
          <Link href="/corrections">Corrections</Link>
          <Link href="/community-guidelines">Community guidelines</Link>
          <Link href="/accessibility">Accessibility</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
