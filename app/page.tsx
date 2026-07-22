import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { PassageText } from "@/components/passage-text";
import { editionRegistry, getAllPassages, getStanzaOfTheDay } from "@/lib/data";

export default function HomePage() {
  const featured = getStanzaOfTheDay();
  const passages = getAllPassages();
  const availableEditions = editionRegistry.filter((edition) => edition.enabled).length;

  return (
    <>
      <section className="home-opening">
        <div className="home-folio-label" aria-hidden="true">
          Folio I
        </div>
        <div className="home-title-block">
          <div className="section-kicker">The Hávamál Archive</div>
          <h1>Texts, translations, notes, and reader discussion.</h1>
          <p className="lead">
            This archive does not rewrite the Hávamál or declare a final meaning. It
            preserves edition differences so readers can compare the words, the sources,
            and the questions for themselves.
          </p>
          <p className="home-mission">
            Read the text. Compare the translations. Form your own understanding.
          </p>
        </div>
        <div className="home-search-panel">
          <div className="section-kicker">Search the archive</div>
          <SearchBox />
          <p className="muted">Try “cattle die,” hospitality, or Bellows 77.</p>
          <div className="home-register-note">
            <strong>{passages.length}</strong>
            <span>aligned passages currently published</span>
            <strong>{availableEditions}</strong>
            <span>edition records currently enabled</span>
          </div>
        </div>
        <nav className="home-index" aria-label="Archive entry points">
          <Link href="/havamal"><span>I</span>Browse the text</Link>
          <Link href="/compare"><span>II</span>Compare editions</Link>
          <Link href="/themes"><span>III</span>Follow a theme</Link>
          <Link href="/study"><span>IV</span>Open a study path</Link>
          <Link href="/discuss"><span>V</span>Reader discussion</Link>
        </nav>
      </section>

      {featured && (
        <section className="home-feature">
          <aside>
            <div className="section-kicker">A passage from the archive</div>
            <p className="folio-number">{featured.internalReference}</p>
            <h2>{featured.section}</h2>
            <p>
              Today’s passage is selected deterministically from the published archive,
              not generated or chosen by popularity.
            </p>
            <div className="folio-actions">
              <Link href={`/havamal/stanza/${featured.slug}`}>Open study folio</Link>
              <Link href={`/compare?passage=${featured.slug}`}>Compare editions</Link>
              <Link href={`/quote-maker?passage=${featured.slug}`}>Create a quote</Link>
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
          <div className="section-kicker">How the archive is arranged</div>
          <h2>The source stays at the center.</h2>
          <p>
            Every layer is labeled so a translation, an editor’s note, published
            commentary, and a reader’s opinion cannot be mistaken for one another.
          </p>
        </header>
        <div className="editorial-grid">
          <article className="span-7 manuscript-note">
            <span className="note-number">01</span>
            <h3>Edition differences remain visible.</h3>
            <p>
              Printed stanza numbers, wording, punctuation, and divisions are preserved.
              Alignment helps comparison; it does not pretend every edition divides the
              poem in the same way.
            </p>
            <Link href="/methodology">Read the methodology →</Link>
          </article>
          <article className="span-5 manuscript-note">
            <span className="note-number">02</span>
            <h3>Reuse is recorded, not assumed.</h3>
            <p>
              Every edition carries a source and license record for display, attribution,
              exports, and commercial restrictions.
            </p>
            <Link href="/licensing">Review licensing →</Link>
          </article>
          <article className="span-5 manuscript-note">
            <span className="note-number">03</span>
            <h3>Study begins with questions.</h3>
            <p>
              Guides organize comparison and reflection without supplying a doctrinal or
              automated “correct meaning.”
            </p>
            <Link href="/study">Browse study paths →</Link>
          </article>
          <article className="span-7 manuscript-note">
            <span className="note-number">04</span>
            <h3>Reader discussion is a separate leaf.</h3>
            <p>
              Every passage can carry one attached discussion, clearly separated from
              original text and reviewed commentary.
            </p>
            <Link href="/community-guidelines">Read the community guidelines →</Link>
          </article>
        </div>
      </section>
    </>
  );
}
