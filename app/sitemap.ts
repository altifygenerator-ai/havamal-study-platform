import type { MetadataRoute } from "next";

import { getCompleteCorpus } from "@/lib/complete-corpus";
import { editionRegistry, getAllPassages, themeRegistry } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { starterGuides } from "@/lib/study-guides";

export const revalidate = 86_400;

const STATIC_ROUTES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/havamal", changeFrequency: "weekly", priority: 0.95 },
  { path: "/compare", changeFrequency: "monthly", priority: 0.8 },
  { path: "/themes", changeFrequency: "monthly", priority: 0.75 },
  { path: "/editions", changeFrequency: "monthly", priority: 0.75 },
  { path: "/study", changeFrequency: "monthly", priority: 0.7 },
  { path: "/quote-maker", changeFrequency: "monthly", priority: 0.7 },
  { path: "/discuss", changeFrequency: "weekly", priority: 0.6 },
  { path: "/sources", changeFrequency: "monthly", priority: 0.7 },
  { path: "/methodology", changeFrequency: "yearly", priority: 0.65 },
  { path: "/licensing", changeFrequency: "yearly", priority: 0.6 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
  { path: "/community-guidelines", changeFrequency: "yearly", priority: 0.4 },
  { path: "/accessibility", changeFrequency: "yearly", priority: 0.3 },
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
    ...STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      changeFrequency,
      priority,
    })),
    ...passages.map((passage) => ({
      url: absoluteUrl(`/havamal/stanza/${passage.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...themeRegistry
      .filter((theme) => themeSlugs.has(theme.slug))
      .map((theme) => ({
        url: absoluteUrl(`/themes/${theme.slug}`),
        changeFrequency: "monthly" as const,
        priority: 0.65,
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
        changeFrequency: "yearly" as const,
        priority: 0.65,
      })),
    ...starterGuides
      .filter((guide) => guide.passageSlugs.some((slug) => passageSlugs.has(slug)))
      .map((guide) => ({
        url: absoluteUrl(`/study/${guide.slug}`),
        changeFrequency: "monthly" as const,
        priority: 0.65,
      })),
  ];

  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());
}
