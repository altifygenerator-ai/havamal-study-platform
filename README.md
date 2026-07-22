# The Hávamál Archive

A free, source-conscious Hávamál reading, comparison, study, quote-card, and discussion platform built with Next.js, TypeScript, Tailwind CSS, Supabase, and PostgreSQL search.

**Texts, translations, notes, and reader discussion.**  
**Read the text. Compare the translations. Form your own understanding.**

The visual system is designed as a worn manuscript under active study rather than a blue SaaS dashboard or fantasy-Viking page: soot-dark framing, vellum reading leaves, brown-black ink, rubric-red indexing, marginal notes, archive rules, and text-first quote layouts. The source text remains the strongest object on the page.

## What works without Supabase

Run the app with the reviewed local corpus to inspect and use:

- the complete branded shell and responsive manuscript-style layout;
- the Hávamál browser, filtering, direct stanza navigation, and themes;
- individual passage study pages;
- edition comparison for every locally published edition;
- local normalized search;
- public study guides;
- source, licensing, methodology, and edition records;
- the text-first PNG quote-card maker;
- public discussion and account/admin interface states.

Supabase is only required for persistent accounts, bookmarks, notes, personal guides, discussion posting, reports, corrections, database search, moderation, and administration.

## Application features

- Custom editorial masthead and archive-index navigation
- Edition-specific numbering, source notes, attribution, and licensing records
- One-to-one, one-to-many, many-to-one, and uncertain passage alignment metadata
- Translation comparison for two to four enabled editions
- Old Norse storage and search support where a licensed edition supplies it
- Canvas quote-card export with mandatory attribution
- PostgreSQL full-text and trigram search after Supabase import
- Private bookmarks, notes, study guides, and saved quote-card database model
- Stable stanza-linked discussions plus a broader custom forum
- Threaded posts, reports, revisions, sanctions, locks, and moderation actions
- Correction reports and textual revision records
- Protected, database-backed administration workspaces
- Source validation, acquisition manifests, corpus auditing, alignment proposals, review, and idempotent imports
- RLS policies for public, owner-only, moderator, and administrator access
- Sitemap, robots controls, metadata, keyboard focus, reduced motion, and mobile layouts

## Corpus status and legal boundary

The repository currently keeps the original **24 line-reviewed Bellows passages** as the offline sample corpus, so the application can run without network access or invented text.

A complete acquisition workflow is now included for:

- Henry Adams Bellows, 1923 — public domain, expected 165 stanzas
- Benjamin Thorpe, 1866 — public domain, expected 166 stanzas
- Olive Bray, 1908 — public domain, expected 164 stanzas; scan review required
- Lee M. Hollander, original 1928 edition — public domain in the United States, expected 165 stanzas
- Edward Pettit, 2023 — official dual-language edition under CC BY-NC 4.0; noncommercial mode only

Copyrighted modern translations remain metadata-only unless written permission is recorded. “Mostly legal” is not an import category.

This environment could not reach the external repositories, so the complete source files were not silently fabricated or copied from unverifiable mirrors. The fetchers, count gates, review states, alignment reports, and publication workflow are included and ready to run from a normal internet connection.

## Requirements

- Node.js 20.11 or newer
- npm
- Internet access only when fetching source editions
- A dedicated Supabase project when persistent accounts/community features are needed

## Local installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Supabase variables may remain blank while testing the public layout and tools.

## Fetching complete legal editions

Fetch every registered legal source:

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

The fetch command:

1. Uses the exact URL and rights record in `data/source-manifests.json`.
2. Refuses to write a file when the parsed count differs from the edition manifest.
3. Preserves source numbering.
4. Writes into `data/source-staging/` so the working published corpus is not overwritten.
5. Marks every generated passage `needs_review` and keeps the edition disabled.
6. Refuses Pettit when `PROJECT_COMMERCIAL_MODE=true`.

The Bray web transcription is only an acquisition aid and must be checked against the 1908 scan. Hollander is restricted to the original 1928 edition; the later revised edition is not imported. Pettit is acquired only from the official Open Book Publishers release with its required CC BY-NC attribution.

## Validating and auditing

```bash
npm run validate:sources
npm run audit:corpus
npm test
npm run typecheck
```

The source validator checks structural metadata, printed-number duplicates, empty lines, broken Unicode, ordering, Old Norse line arrays, bracket warnings, and alignment metadata. The audit shows local, published, expected, and unresolved-alignment counts.

## Alignment workflow

Bellows is the internal comparison anchor because a complete public-domain 165-stanza transcription is available. It is not presented as the academically final stanza division.

After fetching the full Bellows corpus and another edition:

```bash
npm run propose:alignments -- --edition=thorpe-1866
```

Review reports are written to `data/alignment-reports/`. To stage proposals into the source file:

```bash
npm run propose:alignments -- --edition=thorpe-1866 --apply
```

The proposal algorithm compares lexical and positional evidence and stores a runner-up. It deliberately does **not** publish its choices. Editors must review split stanzas, merged stanzas, relocated material, closing formulas, and low-confidence matches. The model supports one-to-one, one-to-many, many-to-one, and uncertain relations.

See `docs/editorial-workflow.md` for the complete process and `docs/corpus-status.md` for the exact bundled-versus-staged boundary.

## Approving and publishing a reviewed source

After every stanza and alignment has been checked against the named edition:

```bash
npm run review:source -- --edition=bellows-1923 --approve-all
npm run review:source -- --edition=bellows-1923 --approve-all --publish
```

The first command records approval inside `data/source-staging/` without changing the live local corpus. The second copies the reviewed file into `data/sources/` and enables its edition. Do not use the bulk command before completing the review.

## Environment variables

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PROJECT_COMMERCIAL_MODE=false
NEXT_PUBLIC_PROJECT_COMMERCIAL_MODE=false
```

`SUPABASE_SERVICE_ROLE_KEY` is used only by server-side/local seed and import scripts. Never expose it to browser code.

## Supabase setup

Use a dedicated project where possible.

1. Run `supabase/migrations/202607220001_initial_havamal_platform.sql`.
2. Add the project URL and publishable key to `.env.local`.
3. Keep the service-role key local/server-only.
4. Seed themes, forum categories, and quote templates:

```bash
npm run seed
```

5. Import only reviewed local source files:

```bash
npm run import:sources
```

Imports are checksum tracked and repeatable. Run `seed` before `import:sources` so themes and the stanza-discussion category exist.

## Assigning the first administrator

Create and verify an account, find its UUID in Supabase Authentication, and run:

```sql
insert into public.user_roles (user_id, role)
values ('YOUR-AUTH-USER-UUID', 'admin')
on conflict do nothing;
```

## Commercial mode

The initial archive is noncommercial.

```env
PROJECT_COMMERCIAL_MODE=false
NEXT_PUBLIC_PROJECT_COMMERCIAL_MODE=false
```

When commercial mode is true, editions without confirmed commercial rights are excluded from public display, quote exports, downloads, and API results. Pettit cannot be fetched or displayed in commercial mode without separate permission.

## Brand system

See `docs/brand-system.md` for palette, typography, composition, and prohibited visual shortcuts. Font files are not bundled or redistributed.

## Project structure

```text
app/                       Next.js routes and APIs
components/                Reading, compare, quote, auth, discussion, and form UI
data/sources/              Published, locally enabled edition files
data/source-staging/       Fetched editions awaiting review and publication
data/source-manifests.json Legal acquisition registry
data/alignments/           Approved internal comparison anchors
data/alignment-reports/    Machine proposals awaiting review
lib/                       Data access, licensing, auth, and shared types
scripts/                   Fetch, validate, audit, align, review, seed, and import tools
supabase/migrations/        Schema, indexes, triggers, views, and RLS
tests/                     Source validation and normalization tests
docs/                      Brand, editorial, moderation, architecture, and deployment docs
```

## Editorial non-negotiable

Do not publish AI-generated interpretation as historical or scholarly knowledge. Do not modernize translations, hide edition differences, invent missing lines, or display copyrighted full translations without permission. Honest empty states are part of the product.

## Automatic complete-edition loading

The public reading tools do not stop at the bundled offline sample. When `/havamal`, `/compare`, a stanza page, or `/quote-maker` is opened, the app requests `/api/corpus`. That server route loads and caches the complete registered legal editions:

- Bellows (165 stanzas), public domain, from the registered Wikisource/Project Gutenberg edition.
- Thorpe (166 printed stanzas), public domain, from Project Gutenberg.
- Bray (164 printed stanzas), public domain, with Old Norse where the registered transcription supplies it.
- Hollander (165 printed stanzas), original 1928 edition, public domain in the United States.
- Pettit (164 stanzas), CC BY-NC 4.0, from the official Open Book Publishers XML package; a correctly attributed CC BY-NC HTML transcription is used only when the official XML cannot be parsed.

The compare screen defaults to the first four available editions and lets the reader select any four. The interface displays an edition-source status panel. It never silently claims that an edition loaded when its stanza-count gate failed. Pettit is automatically excluded when `PROJECT_COMMERCIAL_MODE=true`.

Cross-edition placement uses a monotonic sequence alignment that permits one-to-one, one-to-many, and many-to-one relationships while preserving every printed stanza number. Each displayed passage carries its alignment confidence and note. These alignments are finding aids for comparison, not a declaration that Bellows numbering is academically authoritative.
