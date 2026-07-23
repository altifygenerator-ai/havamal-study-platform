import Link from "next/link";

export default function NotFound() {
  return (
    <div className="narrow-shell">
      <div className="section-kicker">Not found</div>
      <h1>This page is not available.</h1>
      <p>The address may have changed, or the requested text may not be part of the archive.</p>
      <Link className="button" href="/havamal">
        Browse the Hávamál
      </Link>
    </div>
  );
}
