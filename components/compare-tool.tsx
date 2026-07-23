"use client";

import { useEffect, useMemo, useState } from "react";
import type { CanonicalPassage } from "@/lib/types";
import { PassageText } from "@/components/passage-text";
import { useCompleteCorpus } from "@/lib/use-complete-corpus";

export function CompareTool({
  passages,
  initialSlug,
}: {
  passages: CanonicalPassage[];
  initialSlug?: string;
}) {
  const corpus = useCompleteCorpus(passages);
  const allPassages = corpus.passages;
  const [slug, setSlug] = useState(
    initialSlug && passages.some((passage) => passage.slug === initialSlug)
      ? initialSlug
      : passages[0]?.slug ?? "",
  );
  useEffect(() => {
    if (initialSlug && allPassages.some((passage) => passage.slug === initialSlug)) {
      setSlug(initialSlug);
    } else if (!allPassages.some((passage) => passage.slug === slug)) {
      setSlug(allPassages[0]?.slug ?? "");
    }
  }, [allPassages, initialSlug, slug]);
  const current = useMemo(() => allPassages.find((passage) => passage.slug === slug), [allPassages, slug]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showOldNorse, setShowOldNorse] = useState(false);

  useEffect(() => {
    if (!current) {
      setSelected([]);
      return;
    }
    const available = current.editions.map(({ edition }) => edition.slug);
    setSelected((items) => {
      const stillAvailable = items.filter((item) => available.includes(item)).slice(0, 4);
      return stillAvailable.length ? stillAvailable : available.slice(0, 4);
    });
  }, [current]);

  const visible = current?.editions.filter(({ edition }) => selected.includes(edition.slug)) ?? [];
  const oldNorseAvailable = visible.some(({ passage }) => passage.old_norse_lines?.length);

  function toggle(value: string) {
    setSelected((items) =>
      items.includes(value)
        ? items.filter((item) => item !== value)
        : items.length >= 4
          ? items
          : [...items, value],
    );
  }

  return (
    <div className="compare-tool">
      <aside className="compare-controls">
        {corpus.state !== "ready" ? (
          <div className={`corpus-load-state ${corpus.state}`} role="status">
            <strong>{corpus.message}</strong>
          </div>
        ) : null}
        <label>
          Passage
          <select
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setShowOldNorse(false);
            }}
          >
            {allPassages.map((passage) => (
              <option key={passage.slug} value={passage.slug}>
                {passage.internalReference} · {passage.section}
              </option>
            ))}
          </select>
        </label>
        {current ? (
          <fieldset>
            <legend>Translations (up to four)</legend>
            {current.editions.map(({ edition, passage }) => (
              <label key={edition.slug} className="check-row">
                <input
                  type="checkbox"
                  checked={selected.includes(edition.slug)}
                  onChange={() => toggle(edition.slug)}
                />
                <span>
                  {edition.translator ?? edition.editor}
                  <small>stanza {passage.source_stanza_number}</small>
                </span>
              </label>
            ))}
          </fieldset>
        ) : null}
        {oldNorseAvailable ? (
          <label className="check-row">
            <input
              type="checkbox"
              checked={showOldNorse}
              onChange={(event) => setShowOldNorse(event.target.checked)}
            />
            Show facing Old Norse where supplied
          </label>
        ) : null}
      </aside>
      <section className="comparison-grid" aria-live="polite">
        {visible.map(({ edition, passage }) => (
          <PassageText
            key={edition.slug}
            edition={edition}
            passage={passage}
            headingLevel="h3"
            showOldNorse={showOldNorse}
          />
        ))}
      </section>
    </div>
  );
}
