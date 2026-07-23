export const metadata = { title: "Accessibility" };

export default function Page() {
  return (
    <article className="narrow-shell prose-page">
      <h1>Accessibility</h1>
      <p>
        The Hávamál Archive is intended to be readable and usable with a keyboard, screen
        reader, touch screen, or enlarged text.
      </p>
      <p>
        Navigation has visible focus states, controls use clear labels, poetry keeps its
        line breaks, and comparison views rearrange for smaller screens instead of shrinking
        into unreadable columns.
      </p>
      <p>
        Quote cards include the quotation as selectable text, and Old Norse characters are
        written as text rather than embedded in decorative images.
      </p>
      <p>
        Found an accessibility problem? Send the affected page and a description through
        the correction form so it can be investigated.
      </p>
    </article>
  );
}
