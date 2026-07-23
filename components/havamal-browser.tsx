"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { normalizeSearchText } from "@/lib/normalize";
import type { CanonicalPassage } from "@/lib/types";
import { useCompleteCorpus } from "@/lib/use-complete-corpus";

type ThemeOption = {
  slug: string;
  title: string;
};

export function HavamalBrowser({
  passages,
  themes,
}: {
  passages: CanonicalPassage[];
  themes: ThemeOption[];
}) {
  const corpus = useCompleteCorpus(passages);
  const allPassages = corpus.passages;
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("");
  const [view, setView] = useState<"compact" | "reading">("compact");
  const [message, setMessage] = useState("");

  const visible = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);

    return allPassages.filter((item) => {
      if (theme && !item.themes.includes(theme)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return item.editions.some(({ edition, passage }) =>
        normalizeSearchText(
          [
            passage.source_stanza_number,
            edition.translator,
            passage.section,
            ...passage.text_lines,
          ].join(" "),
        ).includes(normalizedQuery),
      );
    });
  }, [allPassages, query, theme]);

  function jumpToPrintedNumber(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget)
      .get("number")
      ?.toString()
      .trim();

    const match = allPassages.find((passage) =>
      passage.editions.some(
        ({ passage: editionPassage }) =>
          editionPassage.source_stanza_number === value,
      ),
    );

    if (match) {
      window.location.assign(`/havamal/stanza/${match.slug}`);
      return;
    }

    setMessage("That printed stanza number is not available in the loaded editions.");
  }

  return (
    <>
      {corpus.state !== "ready" ? (
        <div className={`corpus-load-state browser-corpus-state ${corpus.state}`} role="status">
          <strong>{corpus.message}</strong>
        </div>
      ) : null}
      <section className="browser-tools" aria-label="Hávamál browser controls">
        <label>
          Filter text
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="word, phrase, translator, or stanza"
          />
        </label>

        <label>
          Theme
          <select value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="">All themes</option>
            {themes.map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>View</legend>
          <label>
            <input
              type="radio"
              name="browser-view"
              checked={view === "compact"}
              onChange={() => setView("compact")}
            />
            Compact
          </label>
          <label>
            <input
              type="radio"
              name="browser-view"
              checked={view === "reading"}
              onChange={() => setView("reading")}
            />
            Reading
          </label>
        </fieldset>

        <form onSubmit={jumpToPrintedNumber}>
          <label>
            Go to printed number
            <input name="number" inputMode="numeric" />
          </label>
          <button type="submit">Open</button>
        </form>
      </section>

      <p aria-live="polite" className="muted">
        {message ||
          `${visible.length} passage${visible.length === 1 ? "" : "s"}`}
      </p>

      <div className={view === "reading" ? "browser-reading" : "passage-index"}>
        {visible.map((item) => {
          const primary = item.editions[0];
          if (!primary) {
            return null;
          }

          if (view === "compact") {
            return (
              <Link
                key={item.slug}
                href={`/havamal/stanza/${item.slug}`}
                className="passage-index-row"
              >
                <span>{item.internalReference}</span>
                <strong>
                  {primary.edition.translator} stanza {primary.passage.source_stanza_number}
                </strong>
                <span className="theme-tags">
                  {item.themes.slice(0, 3).map((itemTheme) => (
                    <span className="theme-tag" key={itemTheme}>
                      {itemTheme}
                    </span>
                  ))}
                </span>
              </Link>
            );
          }

          return (
            <article className="browser-reading-item" key={item.slug}>
              <div>
                <span className="section-kicker">{item.internalReference}</span>
                <h2>
                  {primary.edition.translator} stanza {primary.passage.source_stanza_number}
                </h2>
                <p>{primary.passage.section}</p>
              </div>
              <blockquote>
                {primary.passage.text_lines.map((line, index) => (
                  <span key={`${item.slug}-${index}`}>
                    {line}
                    <br />
                  </span>
                ))}
              </blockquote>
              <Link href={`/havamal/stanza/${item.slug}`}>Open study page</Link>
            </article>
          );
        })}
      </div>

      {!visible.length && (
        <div className="empty-state">No passages match these filters.</div>
      )}
    </>
  );
}
