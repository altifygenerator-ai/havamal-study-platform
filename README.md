# Hávamál indexing-quality patch

Copy these files over the matching paths in the current repository.

This patch does not promise or force Google indexing. It fixes the part of the site most likely to reduce crawl demand and page value:

- every available translation is now present in the server-rendered stanza HTML;
- the interactive translation tabs still work;
- empty commentary boilerplate is removed;
- related passages create stronger internal links;
- stanza structured data includes every available edition;
- `/havamal` includes an ItemList describing every passage URL;
- core public routes and substantive passage pages remain in the sitemap, while utility/legal/community pages are no longer pushed as crawl priorities;
- public corpus pages are explicitly statically rendered and revalidated.

Run before pushing:

```bash
npm run typecheck
npm run build
```

Then deploy and use Search Console URL Inspection on the homepage, `/havamal`, and three representative stanza URLs. Do not repeatedly request all stanza URLs individually.
