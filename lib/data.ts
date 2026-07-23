import fs from "node:fs";
import path from "node:path";
import editions from "@/data/editions.json";
import themes from "@/data/themes.json";
import forumCategories from "@/data/forum-categories.json";
import type {
  CanonicalPassage,
  EditionRegistryEntry,
  ForumCategory,
  SourceFile,
  SourcePassage,
} from "@/lib/types";
import { canDisplayEdition } from "@/lib/source-policy";
import { normalizeSearchText } from "@/lib/normalize";

function readSourceFiles(): SourceFile[] {
  const directory = path.join(process.cwd(), "data", "sources");
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory)
    .filter((filename) => filename.endsWith(".json") && !filename.startsWith("_"))
    .sort()
    .flatMap((filename) => {
      try {
        return [JSON.parse(fs.readFileSync(path.join(directory, filename), "utf8")) as SourceFile];
      } catch (error) {
        console.error(`Could not read source file ${filename}:`, error);
        return [];
      }
    });
}

const files = readSourceFiles();
export const editionRegistry = editions as EditionRegistryEntry[];
export const themeRegistry = themes as Array<{ slug: string; title: string; description: string }>;
export const categories = forumCategories as ForumCategory[];

export function getSourceFiles() {
  return files;
}

export function getAllPassages(): CanonicalPassage[] {
  const map = new Map<string, CanonicalPassage>();

  for (const file of files) {
    const edition = editionRegistry.find((entry) => entry.slug === file.edition.slug) ?? file.edition;
    if (!canDisplayEdition(edition)) continue;

    for (const passage of file.passages.filter((entry) => entry.review_status === "published")) {
      const canonicalSlugs = passage.canonical_span?.length
        ? passage.canonical_span
        : [passage.canonical_slug];

      for (const canonicalSlug of canonicalSlugs) {
        const current = map.get(canonicalSlug) ?? {
          slug: canonicalSlug,
          internalReference: canonicalSlug.replace("passage-", "Passage "),
          section: passage.section,
          themes: [],
          editions: [],
        };
        current.themes = Array.from(new Set([...current.themes, ...passage.themes]));
        current.editions.push({ edition, passage });
        map.set(canonicalSlug, current);
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.slug.localeCompare(b.slug, undefined, { numeric: true }),
  );
}

export const getPassage = (slug: string) => getAllPassages().find((entry) => entry.slug === slug);
export const getTheme = (slug: string) => themeRegistry.find((entry) => entry.slug === slug);
export const getPassagesForTheme = (slug: string) =>
  getAllPassages().filter((entry) => entry.themes.includes(slug));
export const getEdition = (slug: string) => editionRegistry.find((entry) => entry.slug === slug);

export function searchLocal(query: string) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  return getAllPassages()
    .flatMap((canonical) =>
      canonical.editions.map(({ edition, passage }) => {
        const text = normalizeSearchText(
          [
            passage.source_stanza_number,
            edition.translator ?? "",
            edition.editionTitle,
            passage.section,
            ...passage.themes,
            ...passage.text_lines,
            ...(passage.old_norse_lines ?? []),
          ].join(" "),
        );
        return text.includes(normalized) ? { canonical, edition, passage } : null;
      }),
    )
    .filter(
      (entry): entry is {
        canonical: CanonicalPassage;
        edition: EditionRegistryEntry;
        passage: SourcePassage;
      } => Boolean(entry),
    )
    .slice(0, 50);
}

export function getStanzaOfTheDay(date = new Date()) {
  const passages = getAllPassages();
  if (!passages.length) return undefined;
  const day = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000,
  );
  return passages[Math.abs(day) % passages.length];
}
