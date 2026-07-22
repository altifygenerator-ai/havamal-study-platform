"use client";

import { useEffect, useState } from "react";
import type { CanonicalPassage } from "@/lib/types";
import { PassageText } from "@/components/passage-text";
import { useCompleteCorpus } from "@/lib/use-complete-corpus";

export function EditionTabs({ passage }: { passage: CanonicalPassage }) {
  const corpus = useCompleteCorpus([passage]);
  const completePassage = corpus.passages.find((item) => item.slug === passage.slug) ?? passage;
  const [selected, setSelected] = useState(passage.editions[0]?.edition.slug ?? "");
  const [showOldNorse, setShowOldNorse] = useState(false);
  const active = completePassage.editions.find((entry) => entry.edition.slug === selected) ?? completePassage.editions[0];

  useEffect(() => {
    if (!active?.passage.old_norse_lines?.length) setShowOldNorse(false);
  }, [active]);

  if (!active) return null;

  return (
    <div>
      <div className={`corpus-load-state stanza-corpus-state ${corpus.state}`} role="status">
        <strong>{corpus.message}</strong>
      </div>
      <div className="edition-control-row">
        <div className="archive-tabs" role="tablist" aria-label="Available translations">
          {completePassage.editions.map(({ edition, passage: editionPassage }) => (
            <button
              key={edition.slug}
              role="tab"
              aria-selected={edition.slug === active.edition.slug}
              onClick={() => setSelected(edition.slug)}
            >
              <span>{edition.translator ?? edition.editor}</span>
              <small>stanza {editionPassage.source_stanza_number}</small>
            </button>
          ))}
        </div>
        {active.passage.old_norse_lines?.length ? (
          <label className="old-norse-toggle">
            <input
              type="checkbox"
              checked={showOldNorse}
              onChange={(event) => setShowOldNorse(event.target.checked)}
            />
            Facing Old Norse
          </label>
        ) : null}
      </div>
      <PassageText edition={active.edition} passage={active.passage} showOldNorse={showOldNorse} />
    </div>
  );
}
