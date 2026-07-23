import type { CanonicalPassage, EditionRegistryEntry, SourcePassage } from "@/lib/types";
import { normalizeSearchText } from "@/lib/normalize";

export type CorpusSearchResult = {
  canonical: CanonicalPassage;
  edition: EditionRegistryEntry;
  passage: SourcePassage;
  score: number;
};

export type SearchSuggestion = {
  id: string;
  type: "passage" | "theme" | "edition";
  label: string;
  meta: string;
  href: string;
};

function searchableText(
  canonical: CanonicalPassage,
  edition: EditionRegistryEntry,
  passage: SourcePassage,
) {
  return normalizeSearchText(
    [
      canonical.slug,
      canonical.internalReference,
      passage.source_stanza_number,
      edition.slug,
      edition.translator ?? "",
      edition.editor ?? "",
      edition.editionTitle,
      passage.section,
      ...canonical.themes,
      ...passage.themes,
      ...passage.text_lines,
      ...(passage.old_norse_lines ?? []),
    ].join(" "),
  );
}

function scoreResult(
  canonical: CanonicalPassage,
  edition: EditionRegistryEntry,
  passage: SourcePassage,
  normalizedQuery: string,
  tokens: string[],
) {
  const text = searchableText(canonical, edition, passage);
  const stanza = normalizeSearchText(passage.source_stanza_number);
  const translator = normalizeSearchText(edition.translator ?? edition.editor ?? "");
  const editionText = normalizeSearchText(`${edition.editionTitle} ${edition.slug}`);
  const themes = normalizeSearchText([...canonical.themes, ...passage.themes].join(" "));

  let score = 0;

  if (stanza === normalizedQuery) score += 300;
  if (canonical.slug === `passage-${normalizedQuery.padStart(3, "0")}`) score += 260;
  if (translator === normalizedQuery) score += 180;
  if (translator.startsWith(normalizedQuery)) score += 110;
  if (editionText.includes(normalizedQuery)) score += 90;
  if (themes.split(" ").includes(normalizedQuery)) score += 100;
  if (text.includes(normalizedQuery)) score += 80;

  const matchingTokens = tokens.filter((token) => text.includes(token));
  score += matchingTokens.length * 12;
  if (tokens.length > 1 && matchingTokens.length === tokens.length) score += 55;

  const numberToken = tokens.find((token) => /^\d{1,3}[a-z]?$/.test(token));
  if (numberToken && stanza === numberToken) score += 170;

  const translatorToken = tokens.find((token) => translator.includes(token));
  if (translatorToken) score += 35;

  return score;
}

export function searchCorpus(
  passages: CanonicalPassage[],
  query: string,
  maxResults = 50,
): CorpusSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return passages
    .flatMap((canonical) =>
      canonical.editions.map(({ edition, passage }) => ({
        canonical,
        edition,
        passage,
        score: scoreResult(canonical, edition, passage, normalizedQuery, tokens),
      })),
    )
    .filter((result) => result.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const passageOrder = left.canonical.slug.localeCompare(right.canonical.slug, undefined, {
        numeric: true,
      });
      if (passageOrder) return passageOrder;
      return left.edition.publicationYear - right.edition.publicationYear;
    })
    .slice(0, maxResults);
}

function excerpt(lines: string[], query: string, maxLength = 118) {
  const full = lines.join(" ").replace(/\s+/g, " ").trim();
  if (full.length <= maxLength) return full;
  const normalizedFull = normalizeSearchText(full);
  const normalizedQuery = normalizeSearchText(query);
  const index = normalizedFull.indexOf(normalizedQuery);
  const start = Math.max(0, index > -1 ? index - 34 : 0);
  const clipped = full.slice(start, start + maxLength).trim();
  return `${start > 0 ? "…" : ""}${clipped}${start + maxLength < full.length ? "…" : ""}`;
}

export function getSearchSuggestions(
  passages: CanonicalPassage[],
  query: string,
  themes: Array<{ slug: string; title: string; description: string }>,
  editions: EditionRegistryEntry[],
  maxResults = 8,
): SearchSuggestion[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const suggestions: SearchSuggestion[] = [];

  for (const theme of themes) {
    const haystack = normalizeSearchText(`${theme.title} ${theme.description} ${theme.slug}`);
    if (haystack.includes(normalizedQuery)) {
      suggestions.push({
        id: `theme-${theme.slug}`,
        type: "theme",
        label: theme.title,
        meta: "Browse passages assigned to this study theme",
        href: `/themes/${theme.slug}`,
      });
    }
  }

  for (const edition of editions) {
    if (!edition.enabled || !edition.fullTextDisplayAllowed) continue;
    const person = edition.translator ?? edition.editor ?? edition.editionTitle;
    const haystack = normalizeSearchText(
      `${person} ${edition.editionTitle} ${edition.publicationYear} ${edition.slug}`,
    );
    if (haystack.includes(normalizedQuery)) {
      suggestions.push({
        id: `edition-${edition.slug}`,
        type: "edition",
        label: person,
        meta: `${edition.editionTitle}, ${edition.publicationYear}`,
        href: `/editions/${edition.slug}`,
      });
    }
  }

  const seenPassages = new Set<string>();
  for (const result of searchCorpus(passages, query, 24)) {
    if (seenPassages.has(result.canonical.slug)) continue;
    seenPassages.add(result.canonical.slug);
    const person = result.edition.translator ?? result.edition.editor ?? result.edition.editionTitle;
    suggestions.push({
      id: `passage-${result.canonical.slug}-${result.edition.slug}`,
      type: "passage",
      label: `${person} · stanza ${result.passage.source_stanza_number}`,
      meta: excerpt(result.passage.text_lines, query),
      href: `/havamal/stanza/${result.canonical.slug}`,
    });
    if (suggestions.length >= maxResults) break;
  }

  const deduplicated = new Map<string, SearchSuggestion>();
  for (const suggestion of suggestions) {
    const key = `${suggestion.type}:${suggestion.href}`;
    if (!deduplicated.has(key)) deduplicated.set(key, suggestion);
  }

  return Array.from(deduplicated.values()).slice(0, maxResults);
}
