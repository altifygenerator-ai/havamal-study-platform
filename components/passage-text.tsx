import type { EditionRegistryEntry, SourcePassage } from "@/lib/types";

export function PassageText({
  edition,
  passage,
  headingLevel = "h2",
  showOldNorse = false,
}: {
  edition: EditionRegistryEntry;
  passage: SourcePassage;
  headingLevel?: "h2" | "h3";
  showOldNorse?: boolean;
}) {
  const Heading = headingLevel;

  return (
    <article className={`passage-text${showOldNorse && passage.old_norse_lines?.length ? " dual-text" : ""}`}>
      <div className="passage-label">
        <Heading>
          {edition.translator ?? edition.editor} · stanza {passage.source_stanza_number}
        </Heading>
        <span>{edition.publicationYear}</span>
      </div>

      {showOldNorse && passage.old_norse_lines?.length ? (
        <div className="parallel-text-leaves">
          <section>
            <div className="parallel-label">Old Norse</div>
            <blockquote lang="non">
              {passage.old_norse_lines.map((line, index) => (
                <span key={`non-${index}-${line}`}>{line}</span>
              ))}
            </blockquote>
          </section>
          <section>
            <div className="parallel-label">English translation</div>
            <blockquote lang="en">
              {passage.text_lines.map((line, index) => (
                <span key={`en-${index}-${line}`}>{line}</span>
              ))}
            </blockquote>
          </section>
        </div>
      ) : (
        <blockquote lang={edition.language === "Old Norse" ? "non" : "en"}>
          {passage.text_lines.map((line, index) => (
            <span key={`${index}-${line}`}>{line}</span>
          ))}
        </blockquote>
      )}

      <footer>
        <span>{edition.editionTitle}</span>
        <span>{edition.licenseName}</span>
      </footer>
    </article>
  );
}
