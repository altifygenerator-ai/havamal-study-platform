# Corpus status

## Bundled and public in the local app

- Henry Adams Bellows, 1923: 24 line-reviewed sample passages.

This sample keeps browsing, search, stanza pages, themes, study guides, and quote export testable without Supabase or source-network access. It is not represented as the complete Hávamál.

## Registered full-edition targets

- Bellows, 1923: 165 printed stanzas; public-domain English.
- Benjamin Thorpe, 1866: 166 printed stanzas; public-domain English.
- Olive Bray, 1908: 164 printed stanzas; public-domain English and Old Norse; scan review required.
- Lee M. Hollander, original 1928 edition: 165 printed stanzas; public domain in the United States. The later revised edition is not imported.
- Edward Pettit, 2023: 164 printed stanzas; official English and Old Norse edition under CC BY-NC 4.0; noncommercial mode only.

At runtime, the public browser, compare tool, stanza pages, and quote maker load these registered editions through `/api/corpus`; each parser must pass its expected-count gate before the edition appears. The exact acquisition and verification locations are recorded in `data/source-manifests.json` and `data/editions.json`.

## Publication boundary

`npm run fetch:sources` writes complete parsed corpora into `data/source-staging/`. It never replaces `data/sources/`. Count checks, source review, and cross-edition alignment review must pass before `npm run review:source -- --edition=<slug> --approve-all --publish` copies an edition into the published local corpus.

Automated alignment is only a proposal aid. Printed stanza numbering is preserved, and split, merged, relocated, or uncertain passages must be explicitly represented as one-to-many, many-to-one, or uncertain relations rather than forced into a false match.

Modern copyrighted translations remain metadata-only without written permission.
