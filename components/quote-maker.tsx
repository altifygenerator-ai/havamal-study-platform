"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CanonicalPassage } from "@/lib/types";
import { useCompleteCorpus } from "@/lib/use-complete-corpus";

const formats = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  landscape: [1600, 900],
} as const;

const templates = {
  folio: {
    label: "Plain folio",
    bg: "#e5d6b4",
    fg: "#211a14",
    accent: "#7b3027",
    rule: "#8a7251",
    dark: false,
  },
  readingRoom: {
    label: "Dark reading room",
    bg: "#181411",
    fg: "#e7dcc5",
    accent: "#7b3027",
    rule: "#8a7251",
    dark: true,
  },
  marginal: {
    label: "Marginal notes",
    bg: "#eee3cb",
    fg: "#2d251f",
    accent: "#7b3027",
    rule: "#a88d63",
    dark: false,
  },
} as const;

type Format = keyof typeof formats;
type Template = keyof typeof templates;
type Alignment = "left" | "center";

export function QuoteMaker({
  passages,
  initialSlug,
}: {
  passages: CanonicalPassage[];
  initialSlug?: string;
}) {
  const corpus = useCompleteCorpus(passages);
  const allPassages = corpus.passages;
  const initial =
    initialSlug && passages.some((passage) => passage.slug === initialSlug)
      ? initialSlug
      : passages[0]?.slug || "";
  const [slug, setSlug] = useState(initial);
  const [editionSlug, setEditionSlug] = useState("");
  const [format, setFormat] = useState<Format>("square");
  const [template, setTemplate] = useState<Template>("folio");
  const [alignment, setAlignment] = useState<Alignment>("left");
  const [sizeScale, setSizeScale] = useState(1);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const passage = useMemo(
    () => allPassages.find((item) => item.slug === slug) ?? allPassages[0],
    [allPassages, slug],
  );
  const selected =
    passage?.editions.find((item) => item.edition.slug === editionSlug) ??
    passage?.editions[0];
  const chosenLines =
    selected?.passage.text_lines.filter(
      (_, index) => !selectedLines.length || selectedLines.includes(index),
    ) ?? [];

  useEffect(() => {
    if (initialSlug && allPassages.some((item) => item.slug === initialSlug)) {
      setSlug(initialSlug);
    } else if (!allPassages.some((item) => item.slug === slug)) {
      setSlug(allPassages[0]?.slug ?? "");
    }
  }, [allPassages, initialSlug, slug]);

  function choosePassage(value: string) {
    setSlug(value);
    const next = allPassages.find((item) => item.slug === value);
    setEditionSlug(next?.editions[0]?.edition.slug ?? "");
    setSelectedLines([]);
  }

  function toggleLine(index: number) {
    setSelectedLines((items) =>
      items.includes(index)
        ? items.filter((item) => item !== index)
        : [...items, index].sort((a, b) => a - b),
    );
  }

  function render(download = false) {
    if (!selected || !canvasRef.current) return;

    const [width, height] = formats[format];
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    const colors = templates[template];
    const margin = width * 0.085;
    const maxWidth = width - margin * 2;
    const accentX = template === "marginal" ? width * 0.11 : width * 0.075;

    context.fillStyle = colors.bg;
    context.fillRect(0, 0, width, height);

    // A restrained folio structure: one rubric line, one outer rule, no imagery.
    context.strokeStyle = colors.rule;
    context.lineWidth = Math.max(2, width * 0.0015);
    context.strokeRect(width * 0.035, height * 0.035, width * 0.93, height * 0.93);
    context.fillStyle = colors.accent;
    context.fillRect(accentX, height * 0.075, Math.max(6, width * 0.006), height * 0.75);

    context.fillStyle = colors.fg;
    context.textBaseline = "top";
    context.textAlign = alignment;

    let size = Math.round(width * 0.052 * sizeScale);
    const textX = alignment === "center" ? width / 2 : margin + width * 0.025;
    const textWidth = maxWidth - width * 0.03;
    context.font = `${size}px Georgia`;

    const wrappedLines: string[] = [];
    for (const sourceLine of chosenLines) {
      const words = sourceLine.split(" ");
      let row = "";
      for (const word of words) {
        const candidate = row ? `${row} ${word}` : word;
        if (context.measureText(candidate).width > textWidth && row) {
          wrappedLines.push(row);
          row = word;
        } else {
          row = candidate;
        }
      }
      if (row) wrappedLines.push(row);
      wrappedLines.push("");
    }

    while (wrappedLines.length * size * 1.34 > height * 0.62 && size > 26) {
      size -= 2;
      context.font = `${size}px Georgia`;
    }

    let y = height * 0.14;
    for (const line of wrappedLines) {
      if (line) context.fillText(line, textX, y, textWidth);
      y += size * 1.34;
    }

    const metaSize = Math.round(width * 0.021);
    context.textAlign = "left";
    context.font = `600 ${metaSize}px Georgia`;
    context.fillStyle = colors.accent;
    context.fillText(
      `HÁVAMÁL · STANZA ${selected.passage.source_stanza_number}`,
      margin,
      height * 0.835,
      maxWidth,
    );

    context.fillStyle = colors.fg;
    context.font = `${Math.round(width * 0.017)}px Georgia`;
    context.fillText(
      `${selected.edition.translator ?? selected.edition.editor} · ${selected.edition.editionTitle} (${selected.edition.publicationYear})`,
      margin,
      height * 0.88,
      maxWidth,
    );
    context.font = `${Math.round(width * 0.014)}px Georgia`;
    context.fillText(
      `${selected.edition.licenseName} · The Hávamál Archive`,
      margin,
      height * 0.915,
      maxWidth,
    );

    if (download) {
      const link = document.createElement("a");
      link.download = `havamal-${selected.edition.slug}-${selected.passage.source_stanza_number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  }

  useEffect(() => {
    if (selected) render(false);
    // Canvas rendering is intentionally driven by the complete control state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, editionSlug, format, template, alignment, sizeScale, selectedLines.join(",")]);

  return (
    <>
      {corpus.state !== "ready" ? (
        <div className={`corpus-load-state quote-corpus-state ${corpus.state}`} role="status">
          <strong>{corpus.message}</strong>
        </div>
      ) : null}
      <div className="quote-maker-grid">
      <form className="quote-controls" onSubmit={(event) => event.preventDefault()}>
        <label>
          Passage
          <select value={slug} onChange={(event) => choosePassage(event.target.value)}>
            {allPassages.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.internalReference}
              </option>
            ))}
          </select>
        </label>

        <label>
          Translation
          <select
            value={selected?.edition.slug || ""}
            onChange={(event) => {
              setEditionSlug(event.target.value);
              setSelectedLines([]);
            }}
          >
            {passage?.editions
              .filter((item) => item.edition.quoteCardExportAllowed)
              .map(({ edition }) => (
                <option key={edition.slug} value={edition.slug}>
                  {edition.translator ?? edition.editor}
                </option>
              ))}
          </select>
        </label>

        <fieldset>
          <legend>Lines</legend>
          {selected?.passage.text_lines.map((line, index) => (
            <label className="quote-line-check" key={`${index}-${line}`}>
              <input
                type="checkbox"
                checked={!selectedLines.length || selectedLines.includes(index)}
                onChange={() => toggleLine(index)}
              />
              <span>{line}</span>
            </label>
          ))}
        </fieldset>

        <label>
          Format
          <select value={format} onChange={(event) => setFormat(event.target.value as Format)}>
            <option value="square">Square</option>
            <option value="portrait">Portrait / story</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>

        <label>
          Alignment
          <select
            value={alignment}
            onChange={(event) => setAlignment(event.target.value as Alignment)}
          >
            <option value="left">Left</option>
            <option value="center">Centered</option>
          </select>
        </label>

        <label>
          Type size
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.05"
            value={sizeScale}
            onChange={(event) => setSizeScale(Number(event.target.value))}
          />
        </label>

        <fieldset>
          <legend>Approved archive template</legend>
          {(Object.entries(templates) as Array<[Template, (typeof templates)[Template]]>).map(
            ([value, config]) => (
              <label className="check-row" key={value}>
                <input
                  type="radio"
                  name="template"
                  checked={template === value}
                  onChange={() => setTemplate(value)}
                />
                {config.label}
              </label>
            ),
          )}
        </fieldset>

        <button type="button" className="button-secondary" onClick={() => render(true)}>
          Export PNG
        </button>
        <p className="muted">
          Required attribution is always included. The text is never rewritten or sent to
          an image API.
        </p>
      </form>

      <div className="quote-preview">
        <canvas ref={canvasRef} aria-label="Quote-card preview" />
      </div>

      {selected && (
        <details className="plain-text-equivalent">
          <summary>Accessible plain-text equivalent</summary>
          <p>{chosenLines.join("\n")}</p>
          <p>
            Hávamál, {selected.edition.translator}, stanza{" "}
            {selected.passage.source_stanza_number}. {selected.edition.licenseName}.
          </p>
        </details>
      )}
      </div>
    </>
  );
}
