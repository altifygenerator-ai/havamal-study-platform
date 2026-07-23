import type { MetadataRoute } from "next";

import { getCompleteCorpus } from "@/lib/complete-corpus";
import { editionRegistry, getAllPassages, themeRegistry } from "@/lib/data";
import { starterGuides } from "@/lib/study-guides";

export const revalidate = 43_200;

const STATIC_ROUTES = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/havamal", changeFrequency: "weekly", priority: 0.9 },
  { path: "/compare", changeFrequency: "monthly", priority: 0.8 },
  { path: "/themes", changeFrequency: "monthly", priority: 0.7 },
  { path: "/editions", changeFrequency: "monthly", priority: 0.7 },
  { path: "/study", changeFrequency: "monthly", priority: 0.7 },
  { path: "/quote-maker", changeFrequency: "monthly", priority: 0.7 },
  { path: "/discuss", changeFrequency: "weekly", priority: 0.7 },
  { path: "/sources", changeFrequency: "monthly", priority: 0.7 },
  { path: "/methodology", changeFrequency: "yearly", priority: 0.6 },
  { path: "/licensing", changeFrequency: "yearly", priority: 0.6 },
  { path: "/corrections", changeFrequency: "monthly", priority: 0.5 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
  { path: "/community-guidelines", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/accessibility", changeFrequency: "yearly", priority: 0.3 },
] as const;

function absoluteUrl(pathname: string) {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://thehavamalarchive.org"
  ).replace(/\/+$/, "");

  return `${base}${pathname}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const bundledPassages = getAllPassages();

  let passages = bundledPassages;

  try {
    const completeCorpus = await getCompleteCorpus();

    if (completeCorpus.passages.length > bundledPassages.length) {
      passages = completeCorpus.passages;
    }
  } catch (error) {
    console.error("Could not load the complete corpus for sitemap generation:", error);
  }

  const publishedThemeSlugs = new Set(
    passages.flatMap((passage) => passage.themes),
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
      priority: 0.8,
    })),

    ...themeRegistry
      .filter((theme) => publishedThemeSlugs.has(theme.slug))
      .map((theme) => ({
        url: absoluteUrl(`/themes/${theme.slug}`),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),

    ...editionRegistry.map((edition) => ({
      url: absoluteUrl(`/editions/${edition.slug}`),
      changeFrequency: "yearly" as const,
      priority: edition.enabled ? 0.6 : 0.4,
    })),

    ...starterGuides.map((guide) => ({
      url: absoluteUrl(`/study/${guide.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return Array.from(
    new Map(entries.map((entry) => [entry.url, entry])).values(),
  );
}