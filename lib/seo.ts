import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

const DEFAULT_OG_IMAGE = "/opengraph-image";

export function absoluteUrl(pathname = "/") {
  const base = siteConfig.url.replace(/\/+$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path === "/" ? "" : path}`;
}

export function cleanExcerpt(value: string, maxLength = 158) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).replace(/[\s,;:.-]+$/, "")}…`;
}

export function createMetadata({
  title,
  description,
  path,
  index = true,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  type?: "website" | "article";
}): Metadata {
  const canonical = absoluteUrl(path);

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          type: "article",
          title,
          description,
          url: canonical,
          siteName: siteConfig.name,
          locale: "en_US",
          images: [
            {
              url: absoluteUrl(DEFAULT_OG_IMAGE),
              width: 1200,
              height: 630,
              alt: siteConfig.name,
            },
          ],
        }
      : {
          type: "website",
          title,
          description,
          url: canonical,
          siteName: siteConfig.name,
          locale: "en_US",
          images: [
            {
              url: absoluteUrl(DEFAULT_OG_IMAGE),
              width: 1200,
              height: 630,
              alt: siteConfig.name,
            },
          ],
        };

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
