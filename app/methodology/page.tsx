export const metadata = { title: "Methodology" };

export default function Page() {
  return (
    <article className="narrow-shell prose-page">
      <div className="section-kicker">How the texts are handled</div>
      <h1>Methodology</h1>
      <p>
        The Hávamál survives through editions that do not always number, divide, or
        punctuate the poem in the same way. The archive keeps each edition intact and
        brings related passages together for comparison.
      </p>

      <h2>Choosing a text</h2>
      <p>
        Every translation is tied to a named publication and a traceable source. Public
        domain and openly licensed editions may be reproduced when their wording and
        attribution can be checked. Copyrighted translations are not copied without
        permission.
      </p>

      <h2>Keeping editions distinct</h2>
      <p>
        Spelling, punctuation, line breaks, notes, and printed stanza numbers remain with
        the edition in which they appeared. The archive does not modernize one translation
        or silently alter it to resemble another.
      </p>

      <h2>Comparing stanzas</h2>
      <p>
        Related passages are placed together even when their printed numbers differ. When
        one edition splits a passage that another keeps together, the comparison reflects
        that difference rather than forcing a false one-to-one match.
      </p>

      <h2>Old Norse text</h2>
      <p>
        Old Norse is shown only when it comes from an edition that may legally be displayed.
        Its spelling, punctuation, characters, and line divisions remain those of the
        chosen edition.
      </p>

      <h2>Notes and discussion</h2>
      <p>
        Translator notes, published commentary, personal notes, and reader discussion are
        presented separately. A reader’s interpretation is never presented as part of the
        original text or as scholarly consensus.
      </p>

      <h2>Corrections</h2>
      <p>
        Reported errors are checked against the cited edition before the text is changed.
        Accepted corrections remain part of the edition’s correction history.
      </p>
    </article>
  );
}
