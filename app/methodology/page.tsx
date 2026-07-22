export const metadata = { title: "Methodology" };

export default function Page() {
  return (
    <article className="narrow-shell prose-page">
      <div className="section-kicker">How the archive works</div>
      <h1>Methodology</h1>
      <p>
        The archive presents editions rather than silently blending them. Every passage keeps
        its printed stanza number, wording, line divisions, notes, source reference, license
        record, and review status.
      </p>

      <h2>Source acquisition</h2>
      <p>
        Text is acquired from a named edition through a documented manifest. Public-domain
        Bellows and Thorpe transcriptions can be staged from traceable repositories. Bray is
        checked against the 1908 scan. Pettit is acquired only from the official CC BY-NC 4.0
        release while the project remains noncommercial. A readable web mirror is never treated
        as automatic permission or as a distinct edition.
      </p>

      <h2>Alignment</h2>
      <p>
        Canonical passage references are internal finding aids. Bellows numbering supplies the
        initial anchor because its complete public-domain text is available, but that choice is
        administrative, not a claim that Bellows gives the single correct division.
      </p>
      <p>
        Other editions retain their own printed numbers. Alignment records support one-to-one,
        one-to-many, and many-to-one relationships, plus an explicit uncertainty state. The
        proposal script can flag likely matches, but it cannot publish them. Relocated material,
        merged stanzas, split stanzas, and edition-specific closing formulas require human review.
      </p>

      <h2>Publication states</h2>
      <p>
        Fetched records begin as <em>needs review</em>. Validation checks structure, numbering,
        Unicode, line content, and alignment metadata. Only an editor may approve and publish a
        corpus. Publishing also enables its edition record; an unreviewed file remains invisible
        in the public browser and comparison tool.
      </p>

      <h2>Editorial layers</h2>
      <p>
        Source text, translator notes, published commentary, editorial notes, personal notes,
        and reader discussion are stored and labeled separately. Community opinions never become
        scholarship merely because they are popular.
      </p>

      <h2>Corrections</h2>
      <p>
        Accepted textual corrections create revision records. The project does not silently
        modernize wording, normalize an edition to match another, or repair a source based on
        guesswork.
      </p>

      <h2>Limits</h2>
      <p>
        Where source rights, page references, alignment, or commentary are not verified, the
        interface shows the uncertainty or an honest empty state.
      </p>
    </article>
  );
}
