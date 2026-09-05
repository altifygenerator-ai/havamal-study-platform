# Hávamál Archive SEO and Indexing Patch

Copy the contents of this patch over the current project, preserving the paths.

## What it changes

- Adds unique titles, descriptions, self-referencing canonical URLs, Open Graph metadata, Twitter metadata, and explicit robots directives.
- Adds unique metadata for stanza, edition, theme, study-guide, discussion-category, and discussion-thread routes.
- Adds `WebSite`, breadcrumb, and stanza `CreativeWork` JSON-LD.
- Generates the stanza list from the complete corpus during static generation when the registered sources are reachable.
- Changes core public corpus pages from request-time rendering to cached static/ISR rendering.
- Removes disabled editions, empty themes, empty guides, search results, accounts, admin pages, and other private/low-value routes from the sitemap.
- Adds noindex protection for search, account, saved-work, admin, empty edition/theme pages, and empty discussion pages.
- Adds a permanent non-www to www redirect.
- Adds an `X-Robots-Tag` header to API routes.
- Adds site icon, web manifest, and Open Graph image routes.
- Excludes metadata routes from the Supabase proxy matcher.

## Required packages

The layout uses the Vercel packages already added to this project:

```bash
npm install @vercel/analytics@latest @vercel/speed-insights@latest
```

## Validate before push

```bash
npm run typecheck
npm run build
```

After deployment, test these live URLs:

- `/robots.txt`
- `/sitemap.xml`
- `/manifest.webmanifest`
- `/opengraph-image`
- `/havamal/stanza/passage-077`

Then resubmit `/sitemap.xml` in Google Search Console and request indexing for the home page, `/havamal`, one stanza page, one edition page, and one theme page.
