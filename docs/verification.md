# Verification checklist

The repository provides these repeatable checks:

```bash
npm run validate:sources
npm run audit:corpus
npm test
npm run typecheck
npm run build
```

## Checks completed in this artifact environment

- Source validation passes all 24 bundled Bellows sample records.
- The corpus audit reports 24 published local records, the 165-stanza Bellows target, and no unresolved alignment metadata in the bundled sample.
- All Node tests pass.
- Every TypeScript and TSX file syntax-transpiles successfully with TypeScript 5.8.3.
- Every source/import/alignment script passes Node syntax checking.
- The legal source fetcher correctly fails without overwriting the sample corpus when external network access is unavailable.

## Checks not honestly completed here

A dependency-backed `npm run typecheck` and `npm run build` could not be completed because this environment could not install npm packages: the internal package gateway timed out and direct external network access was unavailable. The raw TypeScript compiler consequently could not resolve React, Next.js, Supabase, or Node declaration packages even though they are listed in `package.json`.

The complete Bellows, Thorpe, Bray, Hollander, and Pettit source fetches also could not be completed because the source repositories were unreachable from the container. The code does not claim that these corpora are bundled. It ships a review-gated acquisition workflow instead of fabricating text.

## Before deployment

- Run `npm install` on a normal network.
- Run `npm run typecheck` and `npm run build`.
- Run each legal source fetch separately and inspect its count gate.
- Compare every fetched stanza with the named edition or scan.
- Review all cross-edition alignment reports, including relocated and merged material.
- Apply the Supabase migration first in a clean or dedicated project.
- Run `npm run seed` and `npm run import:sources`.
- Test email confirmation, password reset, account deletion, and data export.
- Test first-post approval, sanctions, reports, thread locks, and commercial mode.
- Check quote PNGs at all three dimensions.
- Review keyboard navigation, screen-reader labels, reduced motion, contrast, and common phone widths.
