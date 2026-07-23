import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { PassageText } from "@/components/passage-text";
import { getStanzaOfTheDay } from "@/lib/data";

export default function HomePage() {
  const featured = getStanzaOfTheDay();

  return (
    <>
      <section className="home-opening">
        <div className="home-folio-label" aria-hidden="true">
          Folio I
        </div>
        <div className="home-title-block">
          <div className="section-kicker">The Hávamál Archive</div>
          <h1>Read the Hávamál across its translations.</h1>
          <p className="lead">
            Search the poem, compare how translators handle the same stanza, follow
            recurring themes, and keep your own notes as you read.
          </p>
          <p className="home-mission">
            Read the text. Compare the translations. Form your own understanding.
          </p>
        </div>
        <div className="home-search-panel">
          <div className="section-kicker">Find a passage</div>
          <SearchBox />
          <p className="muted">Try “cattle die,” hospitality, friendship, or Bellows 77.</p>
        </div>
        <nav className="home-index" aria-label="Archive entry points">
          <Link href="/havamal"><span>I</span>Browse the text</Link>
          <Link href="/compare"><span>II</span>Compare editions</Link>
          <Link href="/themes"><span>III</span>Follow a theme</Link>
          <Link href="/study"><span>IV</span>Open a study guide</Link>
          <Link href="/discuss"><span>V</span>Join the discussion</Link>
        </nav>
      </section>

      {featured && (
        <section className="home-feature">
          <aside>
            <div className="section-kicker">Today’s passage</div>
            <p className="folio-number">{featured.internalReference}</p>
            <h2>{featured.section}</h2>
            <div className="folio-actions">
              <Link href={`/havamal/stanza/${featured.slug}`}>Read the passage</Link>
              <Link href={`/compare?passage=${featured.slug}`}>Compare translations</Link>
              <Link href={`/quote-maker?passage=${featured.slug}`}>Make a quote card</Link>
            </div>
          </aside>
          <div className="home-feature-leaf">
            <PassageText
              edition={featured.editions[0].edition}
              passage={featured.editions[0].passage}
            />
          </div>
        </section>
      )}

      <section className="page-shell archive-principles">
        <header className="archive-principles-heading">
          <div className="section-kicker">A closer reading</div>
          <h2>Move between the words, the editions, and your own questions.</h2>
        </header>
        <div className="editorial-grid">
          <article className="span-7 manuscript-note">
            <span className="note-number">01</span>
            <h3>Compare the wording.</h3>
            <p>
              Place several translations beside one another without losing their line
              breaks or printed stanza numbers.
            </p>
            <Link href="/compare">Compare translations →</Link>
          </article>
          <article className="span-5 manuscript-note">
            <span className="note-number">02</span>
            <h3>Know which edition you are reading.</h3>
            <p>
              Translator, publication year, source, and attribution remain attached to
              every passage.
            </p>
            <Link href="/editions">Browse editions →</Link>
          </article>
          <article className="span-5 manuscript-note">
            <span className="note-number">03</span>
            <h3>Keep your own study notes.</h3>
            <p>
              Bookmark passages, save questions, and build private guides that stay with
              your account.
            </p>
            <Link href="/my-study">Open saved work →</Link>
          </article>
          <article className="span-7 manuscript-note">
            <span className="note-number">04</span>
            <h3>Talk through the difficult passages.</h3>
            <p>
              Ask questions, compare sources, and share personal readings without
              confusing discussion with the text itself.
            </p>
            <Link href="/discuss">Enter the discussion →</Link>
          </article>
        </div>
      </section>
    </>
  );
}
