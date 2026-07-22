# Architecture

## Public read path

The bundled reviewed JSON corpus powers static and cached public pages without a database dependency. `lib/data.ts` groups edition passages into internal canonical passages while preserving each edition record and printed stanza number.

## Persistence path

Supabase Postgres stores reusable work and edition records, license permissions, edition passages, alignments, themes, commentary, private study data, quote templates, discussions, moderation, corrections, imports, settings, and audit records.

Core text is relational. Flexible JSON is limited to configuration and metadata that genuinely varies, such as quote-template settings and discussion preferences.

## Trust boundaries

- Browser anon key: authentication and RLS-governed operations only
- Server routes: verified-user checks, validation, sanitization, and lock checks
- Service-role key: seed/import tooling only
- Administrator authorization: server role check plus database policies
- Public text: only records marked published and allowed by source policy

## Alignment model

`canonical_passages` provide internal organizational anchors. `edition_passages` preserve exact edition text and numbering. `passage_alignments` joins the two and stores confidence and exceptions. No translation is squeezed into columns on a single stanza record.
