# Source and editorial workflow

## 1. Register the exact edition

Confirm the work, translator/editor, publication history, source provider, exact source location, and reuse rights. Do not treat a duplicate mirror as a separate translation.

The acquisition registry is `data/source-manifests.json`. It records the expected stanza count, acquisition source, verification source, license reference, parser, and whether the source can ever publish automatically. The current answer is always **no**: fetched text must be reviewed.

## 2. Stage complete legal sources

```bash
npm run fetch:sources
```

Or one edition:

```bash
npm run fetch:sources -- --edition=bellows-1923
npm run fetch:sources -- --edition=thorpe-1866
npm run fetch:sources -- --edition=bray-1908
npm run fetch:sources -- --edition=hollander-1928
npm run fetch:sources -- --edition=pettit-2023
```

- Bellows: Wikisource plain-text acquisition, checked against Project Gutenberg ebook 73533.
- Thorpe: Project Gutenberg ebook 14726.
- Bray: a transcription aid checked stanza-by-stanza against the 1908 scan. Reworked Bray websites are not accepted as the edition text.
- Hollander: original 1928 edition only. The later revised edition is a separate copyrighted text and is not substituted.
- Pettit: the official Open Book Publishers XML release under CC BY-NC 4.0. The importer refuses this source when `PROJECT_COMMERCIAL_MODE=true`.
- Copyrighted modern translations: metadata only unless written permission is recorded.

The fetch command refuses to write a corpus when the parsed stanza count differs from the manifest. Generated records are marked `needs_review`, disabled, and written to `data/source-staging/` so the current published local corpus remains usable.

## 3. Validate the corpus

```bash
npm run validate:sources
npm run audit:corpus
```

Validation checks required metadata, duplicate printed numbers, empty lines, Unicode replacement characters, bracket imbalance, ordering, Old Norse line structure, and alignment metadata. The corpus audit displays local, published, expected, and unresolved-alignment counts.

## 4. Propose alignment candidates

A complete 165-stanza Bellows file is required before cross-edition proposals can run.

```bash
npm run propose:alignments
npm run propose:alignments -- --edition=thorpe-1866
```

This writes review reports under `data/alignment-reports/`. The algorithm compares lexical and positional evidence and records a runner-up. It does not approve a match.

To apply proposals to the staged source files for editing:

```bash
npm run propose:alignments -- --edition=thorpe-1866 --apply
```

Every staged proposal remains unpublished. Reviewers must correct:

- merged or split stanzas;
- relocated material;
- closing formulas placed differently by an edition;
- one-to-many and many-to-one relationships;
- low-confidence or semantically weak matches;
- edition-specific lacunae, brackets, notes, and numbering.

`data/alignments/havamal-alignments.json` records the anchor structure and approved mappings. Canonical passage numbers are internal comparison aids only.

## 5. Review against the edition

Preserve exact wording, punctuation, spelling, line divisions, printed numbering, editorial brackets, supplied lacunae, footnotes, page references, and Old Norse characters. Normalized search text is generated separately and never replaces display text.

Do not approve a whole source simply because the parser produced the expected count. Compare every stanza against the named edition or scan.

## 6. Approve and publish

After the complete file and every alignment have been checked:

```bash
npm run review:source -- --edition=bellows-1923 --approve-all
npm run review:source -- --edition=bellows-1923 --approve-all --publish
```

The first command records approval in `data/source-staging/` without public display. The second copies the reviewed file into `data/sources/`, publishes all records, and enables the edition. Use the bulk command only after a complete editorial review; otherwise edit individual records and statuses manually.

Then import into Supabase:

```bash
npm run seed
npm run import:sources
```

Imports are checksum tracked and repeatable. Newly imported text is never silently substituted for a previously published edition.

## 7. Corrections

If a published text changes, create a correction decision and text revision record. Do not silently alter the source corpus.
