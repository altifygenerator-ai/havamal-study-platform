import type { MetadataRoute } from "next";

import { getCompleteCorpus } from "@/lib/complete-corpus";
import { editionRegistry, getAllPassages, themeRegistry } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { starterGuides } from "@/lib/study-guides";

export const revalidate = 86_400;

// Google ignores sitemap priority and changeFrequency.  Keep lastModified tied
// to a real content release instead of replacing it with the current time on
// every request.
const CONTENT_RELEASE = new Date("2026-09-05T00:00:00.000Z");

const CORE_ROUTES = [
  "/",
  "/havamal",
  "/compare",
  "/themes",
  "/editions",
  "/study",
  "/sources",
  "/methodology",
  "/licensing",
  "/about",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let passages = getAllPassages();

  try {
    const corpus = await getCompleteCorpus();
    if (corpus.passages.length >= passages.length) passages = corpus.passages;
  } catch (error) {
    console.error("Complete corpus unavailable during sitemap generation:", error);
  }

  const passageSlugs = new Set(passages.map((passage) => passage.slug));
  const themeSlugs = new Set(passages.flatMap((passage) => passage.themes));
  const editionSlugs = new Set(
    passages.flatMap((passage) => passage.editions.map(({ edition }) => edition.slug)),
  );

  const entries: MetadataRoute.Sitemap = [
    ...CORE_ROUTES.map((path) => ({
      url: absoluteUrl(path),
      lastModified: CONTENT_RELEASE,
    })),
    ...passages.map((passage) => ({
      url: absoluteUrl(`/havamal/stanza/${passage.slug}`),
      lastModified: CONTENT_RELEASE,
    })),
    ...themeRegistry
      .filter((theme) => themeSlugs.has(theme.slug))
      .map((theme) => ({
        url: absoluteUrl(`/themes/${theme.slug}`),
        lastModified: CONTENT_RELEASE,
      })),
    ...editionRegistry
      .filter(
        (edition) =>
          edition.enabled &&
          edition.fullTextDisplayAllowed &&
          editionSlugs.has(edition.slug),
      )
      .map((edition) => ({
        url: absoluteUrl(`/editions/${edition.slug}`),
        lastModified: CONTENT_RELEASE,
      })),
    ...starterGuides
      .filter((guide) => guide.passageSlugs.some((slug) => passageSlugs.has(slug)))
      .map((guide) => ({
        url: absoluteUrl(`/study/${guide.slug}`),
        lastModified: CONTENT_RELEASE,
      })),
  ];

  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());
}
