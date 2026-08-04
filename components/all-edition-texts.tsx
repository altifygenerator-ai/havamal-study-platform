import { PassageText } from "@/components/passage-text";
import type { CanonicalPassage } from "@/lib/types";

export function AllEditionTexts({
  passage,
  excludeEditionSlug,
}: {
  passage: CanonicalPassage;
  excludeEditionSlug?: string;
}) {
  const editions = passage.editions.filter(
    ({ edition }) => edition.slug !== excludeEditionSlug,
  );

  if (!editions.length) return null;

  return (
    <section aria-labelledby="other-translations-heading">
      <h2 className="rule-heading" id="other-translations-heading">
        Other translations of this passage
      </h2>
      <div className="comparison-grid">
        {editions.map(({ edition, passage: editionPassage }) => (
          <PassageText
            edition={edition}
            headingLevel="h3"
            key={`${edition.slug}-${editionPassage.source_stanza_number}`}
            passage={editionPassage}
            showOldNorse={Boolean(editionPassage.old_norse_lines?.length)}
          />
        ))}
      </div>
    </section>
  );
}
