# Build a Complete Hávamál Study, Comparison, Quote, and Discussion Platform

Act as a senior product designer, UX specialist, full-stack software engineer, database architect, digital humanities developer, accessibility specialist, SEO specialist, and careful editor of historical source material.

Build a complete, production-ready web application centered on the Hávamál.

This must not be a mockup, a landing-page-only concept, or a generic AI-generated dashboard. Build the actual working application, database structure, authentication, study tools, discussion system, quote-card generator, administration tools, source attribution system, responsive interface, and seed/import process.

Use the existing repository if one is provided. Preserve useful existing work. Do not unnecessarily replace configuration files, lockfiles, or working dependencies.

The application must install, build, and run successfully with:

```bash
npm install
npm run dev
npm run build
```

Use stable, maintained dependencies. Avoid unnecessary packages, experimental libraries, and complicated abstractions that do not improve the product.

---

# 1. Project Purpose

Create a free, noncommercial Hávamál study resource for:

* Pagans and Heathens
* scholars and serious students
* mythology enthusiasts
* general readers
* writers and creators
* people searching for a particular stanza
* people comparing translations
* people forming their own understanding of the text
* people who want to quote and share stanzas responsibly

The project is not an attempt to rewrite the Hávamál.

The project is not an attempt to produce a new translation.

The project is not an attempt to declare one interpretation correct.

The project must not present AI-generated explanations as historical or scholarly knowledge.

Its purpose is to make the source material easier to:

* find
* search
* compare
* cite
* study
* organize
* discuss
* reflect on
* share accurately

The philosophical center of the project is:

> Present the texts, translations, source notes, and documented readings clearly enough that readers can form their own understanding.

The original texts and translations must remain at the center of the experience. Site commentary must never visually overpower the source material.

---

# 2. Mission Language

Use straightforward language throughout the project.

A suitable mission statement is:

> This project does not attempt to rewrite, replace, or declare a final meaning for the Hávamál. It brings together source texts, translations, commentary, and discussion so readers can compare them carefully and form their own understanding.

Another appropriate statement is:

> The notes and discussions on this site are study aids, not final answers. Translations and readings differ. This resource is designed to make those differences easier to see.

Do not describe the project as:

* the definitive Hávamál
* the true meaning of the Hávamál
* the ultimate Pagan platform
* the final authority on Norse belief
* a replacement for published editions or scholarship

Do not use fake-spiritual marketing language.

Do not use language such as:

* unlock ancient wisdom
* awaken your Viking spirit
* discover your warrior blood
* reclaim the old ways
* sacred secrets revealed
* ancient power for modern life

Keep the voice thoughtful, direct, welcoming, restrained, and honest.

---

# 3. Noncommercial Status

The initial release is completely free and noncommercial.

Do not add:

* pricing pages
* subscriptions
* Stripe
* advertisements
* sponsored placements
* paid memberships
* affiliate links
* paywalled study content
* paid quote templates

However, structure source licensing carefully enough that commercial features could be evaluated later without rebuilding the entire database.

Every edition and commentary source must record whether it permits:

* public display
* noncommercial reuse
* commercial reuse
* excerpts
* full-text display
* adaptations
* quote-card export
* downloadable files

If the project ever becomes commercial, sources restricted to noncommercial use must be capable of being disabled globally through configuration.

Add an application-level setting:

```txt
PROJECT_COMMERCIAL_MODE=false
```

When `false`, properly licensed noncommercial sources may appear.

When `true`, any source without confirmed commercial reuse rights must automatically be excluded from:

* public full-text display
* quote-card exports
* downloadable study guides
* API responses
* paid or promotional features

Do not assume that something is reusable merely because it is available to read online.

---

# 4. Critical Source and Copyright Rules

Create a first-class source registry. Do not scatter copyright information through hardcoded components.

Each source or edition record must include:

* work title
* edition title
* translator
* editor
* publication year
* original publisher
* source provider
* source location
* language
* license name
* license status
* attribution text
* public-domain jurisdiction notes
* commercial reuse allowed
* noncommercial reuse allowed
* full-text display allowed
* quote-card export allowed
* downloadable export allowed
* source notes
* date last verified
* verified by
* enabled status

The initial verified Hávamál corpus should include distinct editions, not duplicate mirrors of the same translation.

## Initial English editions

### Henry Adams Bellows

Import the Hávamál from Bellows’ edition of *The Poetic Edda*.

Record:

```txt
Translator: Henry Adams Bellows
Original publication year: 1923
Status: Public domain in the United States
Preferred transcription source: Project Gutenberg or a scan-verified equivalent
```

Preserve Bellows’ stanza wording and notes exactly. Do not modernize his language.

### Benjamin Thorpe

Import Thorpe’s translation from *The Edda of Sæmund the Learned*.

Record:

```txt
Translator: Benjamin Thorpe
Original publication year: 1866
Status: Public domain
Preferred transcription source: Scan-verified public-domain edition or Wikisource transcription
```

Preserve Thorpe’s wording and edition-specific stanza numbering.

### Olive Bray

Import Olive Bray’s translation from the 1908 edition of *The Elder or Poetic Edda*.

Record:

```txt
Translator and editor: Olive Bray
Original publication year: 1908
Status: Public domain
Preferred transcription source: Scan of the 1908 edition
```

Do not import a website’s “reworked,” modernized, corrected, or altered version and present it as Bray’s original translation.

### Edward Pettit

Import the Hávamál text from Edward Pettit’s *The Poetic Edda: A Dual-Language Edition* only under its actual license.

Record:

```txt
Editor and translator: Edward Pettit
Publication year: 2023
License: CC BY-NC 4.0
Commercial use: No without additional permission
Attribution required: Yes
```

Display the required attribution and license information anywhere this edition appears.

Any quote card using Pettit must automatically include a readable attribution and CC BY-NC 4.0 notice.

If commercial mode is ever enabled, disable Pettit’s full text and exported quote cards unless separate permission has been recorded.

## Old Norse text

Include an Old Norse text only from an edition with verified reuse rights.

Preferred options:

* the Old Norse text in Pettit’s dual-language edition under CC BY-NC 4.0 while the project is noncommercial
* a verified public-domain edition associated with Finnur Jónsson
* another clearly licensed scholarly transcription

Do not copy an Old Norse transcription merely because it appears on a public website.

Do not silently combine spellings from different editions.

Preserve the selected edition’s:

* spelling
* punctuation
* line divisions
* stanza divisions
* editorial brackets
* normalized characters
* supplied lacunae or uncertainty marks

Store a separate normalized search field so search can ignore diacritics without changing the displayed text.

## Explicitly excluded without permission

Do not import or display complete copyrighted translations, including:

* Jackson Crawford
* Carolyne Larrington
* Lee M. Hollander
* W. H. Auden and Paul B. Taylor
* Ursula Dronke
* other modern copyrighted translations

Do not import the Ragweed Forge Auden/Taylor text.

A free website is not automatic permission to reproduce a copyrighted translation.

Create disabled source records for permission-requested editions so they can be added later without restructuring the app.

For a disabled modern edition, the public source page may show:

* translator
* edition title
* publication information
* short neutral description
* purchase or publisher reference
* permission status

Do not display the full translation until written permission has been recorded.

---

# 5. Textual Integrity and Stanza Alignment

Different editions may divide or number stanzas differently.

Do not force every edition into a false one-to-one alignment.

Use an internal canonical passage system while preserving each edition’s printed numbering.

Recommended structure:

```txt
works
canonical_passages
editions
edition_passages
passage_alignments
```

A canonical passage is only an internal organizational tool. Do not present it as the one academically correct division.

Each edition passage must preserve:

* source stanza number
* section heading
* printed order
* exact translation text
* footnotes
* source page number when known
* alignment confidence
* editorial notes
* whether it spans more than one canonical passage
* whether multiple source passages map to one canonical passage

If editions disagree:

* show the disagreement
* explain the numbering difference neutrally
* do not silently edit one edition to match another
* do not invent missing lines
* do not auto-merge stanzas

Add a visible note when relevant:

> Stanza divisions and numbering vary between editions. This page aligns related passages for comparison while preserving each edition’s original numbering.

Create import validation that detects:

* missing stanzas
* duplicate source numbers
* unexpected numbering gaps
* empty translation fields
* broken Unicode
* unbalanced editorial brackets
* accidental paragraph merging
* altered line breaks

All source imports must be reviewable in the admin area before publication.

---

# 6. No AI Interpretation Policy

Do not generate or publish AI-written interpretations of the Hávamál.

Do not add a “What this really means” section.

Do not use AI to invent:

* historical context
* author intent
* Pagan doctrine
* spiritual advice
* academic consensus
* translator commentary
* source citations

The site may display:

1. Exact source text.
2. Exact translations.
3. Properly licensed commentary excerpts.
4. Carefully sourced summaries of published commentary.
5. Clearly labeled editorial notes.
6. Community discussion and personal reflection.

Keep these categories visibly separate.

Use labels such as:

* Original Text
* Translations
* Translator’s Notes
* Source Notes
* Published Commentary
* Ways This Passage Has Been Read
* Historical Context
* Reader Discussion
* Personal Reflection

Never label community opinions as scholarship.

Never label editorial summaries as quotations.

Every commentary entry must identify:

* author
* work
* year
* page or location when available
* entry type
* quotation or paraphrase
* license or fair-use basis
* external source reference
* editor review status

---

# 7. Design Standard

Apply the following design standard exactly. Where it says “business,” interpret that as this specific study resource and community.

Build this site like a real human designer made it for this specific business, not like a generic AI template.

Do not default to the usual AI website look:

* no centered hero with a pill badge, huge headline, subtext, and two buttons unless it truly fits
* no generic blue/purple/green gradients
* no random icon grids just to fill space
* no perfect repeated cards everywhere
* no over-polished SaaS style
* no generic “modern and professional” layout
* no fake-sounding marketing copy
* no samey rounded white cards with shadows on every section

Also avoid the overused “AI premium” color palette unless it seriously fits the actual business, logo, location, photos, building, trucks, or trade.

Do not use these as the default palette:

* warm cream / parchment / off-white backgrounds
* beige and soft tan section blocks
* forest green, dark green, sage green, olive green, or muted green panels
* greige, taupe, mushroom gray, warm gray, or stone-gray blocks
* faint grid paper backgrounds
* soft linen paper textures
* generic cream + dark green + taupe combinations
* the common “natural premium cabin/contractor” palette unless the business genuinely calls for it

If one of those colors truly fits the business, use it carefully and explain the reason through the design. Otherwise, find a more specific palette from the real business world: work trucks, signage, uniforms, equipment, materials, local landscape, brick, metal, dirt, water, wood, concrete, photos, packaging, storefront, or regional feel.

Before designing, decide what the business should feel like based on the trade, location, customer type, and personality. Make the design feel custom to them.

I want:

* a unique header/hero layout that does not look like every other AI site
* typography that fits the business, not just Inter plus a fancy heading font every time
* a color palette pulled from the business, trade, materials, local area, logo, trucks, equipment, buildings, photos, or natural surroundings
* sections with different shapes and rhythm, not just stacked centered blocks
* real-world texture where appropriate: borders, panels, split layouts, offset images, badges, service tags, local notes, rougher edges, photo overlays, map/location feel, trade-specific details
* fewer icons, and only use icons when they actually help
* copy that sounds like a real local business owner, simple and clear, not AI-polished
* some asymmetry and imperfect human layout choices while still looking clean and premium
* make every section feel intentional, not filler

For the header especially:

Create a custom header direction before coding. Avoid the standard nav/logo/button layout if another approach fits better. The header should set the whole mood of the site. Think like: old-school local business sign, contractor truck decal, cabin welcome board, newspaper/local guide masthead, shop wall, field service ticket, outdoor lodge sign, diner menu, or premium editorial layout depending on the business.

Do not make the header feel like a default SaaS navbar. The header should feel like it belongs to this exact business, not like a reusable template.

Make it feel premium through restraint, spacing, strong type, good photo use, and custom layout, not through generic gradients, shiny effects, or safe AI color choices.

Keep it mobile clean, fast, SEO-friendly, and easy to edit. Do not change the business facts or invent claims.

---

# 8. Site-Specific Visual Direction

The project should feel like:

> A contemporary Pagan study hall crossed with a serious literary archive and a well-edited independent journal.

It must appeal to:

* practicing Pagans
* Heathens
* scholars
* students
* curious readers
* people who do not identify religiously but care about Norse literature

It must not feel like:

* a fantasy role-playing game
* a Viking merchandise store
* a black-metal album page
* a Renaissance fair vendor
* a generic occult store
* a Christian Bible-study template with the labels replaced
* a startup dashboard
* a rustic cabin website
* an AI-generated “ancient wisdom” page

## Suggested palette direction

Use a restrained, cooler editorial palette inspired by:

* black iron
* carbon ink
* weathered silver
* deep blue-black
* mineral blue
* oxidized copper used sparingly
* iron-oxide red used as a functional accent
* cool white for readable text surfaces

Avoid making the entire site brown, beige, parchment-colored, or forest green.

Possible token direction:

```txt
Background: deep ink blue-black
Primary reading surface: cool neutral white
Secondary surface: cool charcoal
Primary text: near-black or cool white depending on surface
Muted text: silver gray with accessible contrast
Primary accent: mineral blue
Secondary accent: restrained iron red
Detail accent: oxidized copper used sparingly
Borders: thin iron-gray rules
```

Do not use gradients unless one has a specific visual purpose.

Do not put every section inside a rounded card.

Use:

* editorial rules
* clear text columns
* offset marginal notes
* inset source annotations
* strong section labels
* subtle carved-line geometry
* asymmetric column widths
* deliberate whitespace
* tabs that resemble an archive index rather than SaaS pills
* narrow source-reference rails
* restrained dividers

## Typography

Do not default to Inter.

Choose typography that supports:

* long-form reading
* Old Norse characters
* academic notes
* clear UI labels
* stanza poetry
* mobile legibility

Use one strong text family with a complementary display or editorial face only if needed.

Confirm full character support for:

```txt
á ð é í ó ú ý þ æ ö ø ǫ Œ
```

Do not use fake runic fonts for English interface text.

Runes must not be used as meaningless decoration.

Remember that surviving Hávamál manuscripts are not modern “Viking rune posters.” Do not imply that a decorative runic transcription is an original manuscript representation.

## Header direction

Create a custom editorial masthead rather than a default navbar.

A suitable desktop direction:

* a compact top utility strip for account, saved work, and search
* an offset masthead with the project name and a short mission line
* a visible “Browse the Hávamál” index control
* a source/edition selector integrated into the masthead
* a narrow reading-progress or section rail
* navigation presented like an archive index, not a row of generic buttons

A suitable mobile direction:

* project wordmark
* clear search control
* compact menu
* saved-work access when signed in
* no crowded secondary navigation
* no tiny scholarly controls

The homepage must not begin with a giant centered slogan and two buttons.

A stronger homepage opening is:

* editorial masthead on one side
* live stanza/keyword search on the other
* a selected stanza excerpt beneath
* direct routes into Browse, Compare, Study, Quote, and Discuss
* a short explanation of the project’s purpose
* no fake usage statistics

---

# 9. Historically Responsible Visuals

Do not use fake Viking imagery.

Explicitly avoid:

* horned helmets

* fantasy barbarian armor

* random axes

* skulls used as generic decoration

* random rune circles

* fake bindrunes

* glowing magical runes

* shirtless warrior stock art

* overused longship silhouettes

* “warrior blood” imagery

* Marvel-inspired Norse imagery

Quote cards should default to text-first layouts.

Where imagery is used, it must come from:

* verified public-domain historical art
* openly licensed museum images
* carefully documented archaeological objects
* historically grounded commissioned or generated imagery reviewed before publication
* neutral materials such as iron, carved wood, woven cloth, firelight, water, landscape, or manuscript detail

Every image asset must have:

* title
* creator if known
* date if known
* institution or source
* license
* attribution
* alt text
* historical-context note
* approval status

Do not call an image “era accurate” unless it is based on documented evidence.

Use “historically grounded” where absolute certainty is not possible.

---

# 10. Primary Navigation and Pages

Create the following public sections.

## Home

The homepage should include:

* custom editorial masthead
* prominent search by word, phrase, theme, or stanza
* direct browse entry
* selected stanza of the day
* recently added source or commentary notes
* featured study themes
* explanation of how translation comparison works
* explanation of the project’s non-authoritative approach
* entry to discussions
* source and licensing transparency
* no fake popularity or member statistics

“Stanza of the day” must be deterministic based on the date and available canonical passages. Do not generate random unexplained numbers.

## Hávamál Browser

Route:

```txt
/havamal
```

Include:

* complete passage index
* search
* theme filters
* section filters
* edition availability
* compact and reading views
* direct stanza-number entry
* keyboard navigation
* mobile-friendly filtering

Allow browsing by recognized major internal sections where editorially supported, while making clear that section naming and boundaries may vary by edition.

## Individual Stanza Page

Route pattern:

```txt
/havamal/stanza/[canonical-slug]
```

This is the core page.

Detailed requirements appear below.

## Themes

Routes:

```txt
/themes
/themes/[slug]
```

Initial themes may include:

* hospitality
* friendship
* speech
* silence
* wisdom
* foolishness
* travel
* generosity
* reputation
* death
* memory
* moderation
* drinking
* counsel
* trust
* conflict
* runes
* Odin
* knowledge
* sacrifice

Themes are editorial aids, not claims of absolute classification.

Allow passages to have multiple themes.

Show who assigned or reviewed each theme in admin metadata.

## Editions and Translators

Routes:

```txt
/editions
/editions/[slug]
/translators/[slug]
```

Each edition page should explain:

* translator/editor
* publication history
* source edition
* license
* language style
* known numbering differences
* available notes
* how the site transcribed it
* correction history
* external source or book reference

Do not rank translations as best or worst.

## Compare

Route:

```txt
/compare
```

Allow readers to:

* select a stanza
* select two to four editions
* view them side by side
* toggle Old Norse
* highlight word differences
* preserve line breaks
* copy each edition separately
* copy a properly labeled comparison
* open the full stanza page

On mobile, use swipeable or stacked edition panels rather than compressed columns.

## Quote Maker

Route:

```txt
/quote-maker
```

Detailed requirements appear below.

## Study Guides

Routes:

```txt
/study
/study/[slug]
/my-study
/my-study/[id]
```

Public study guides can be read without an account.

Accounts are required only to:

* save a guide
* create a personal guide
* write private notes
* bookmark stanzas
* organize collections
* continue work across devices

## Discussion Forum

Routes:

```txt
/discuss
/discuss/category/[slug]
/discuss/thread/[slug]
```

Detailed requirements appear below.

## Sources and Methodology

Routes:

```txt
/sources
/methodology
/licensing
/corrections
```

Explain clearly:

* what texts are used
* why they may be used
* how transcriptions were created
* how stanza alignment works
* how corrections are reviewed
* how commentary differs from community opinion
* how noncommercial licenses are handled
* what is intentionally excluded

## About

Route:

```txt
/about
```

Present this as a sincere reader-built resource, not a corporate product story.

## Community Guidelines

Route:

```txt
/community-guidelines
```

## Privacy, Terms, and Accessibility

Routes:

```txt
/privacy
/terms
/accessibility
```

Keep them plain-language and appropriate for a free community resource.

---

# 11. Individual Stanza Page Experience

Every stanza page must provide a strong study experience without becoming cluttered.

## Top section

Display:

* Hávamál title
* internal aligned passage identifier
* selected edition’s stanza number
* relevant section
* themes
* bookmark control
* copy link
* quote-card control
* previous and next passage navigation

Do not show an unexplained “Stanza 77” if an edition uses another number.

Clearly label numbering:

```txt
Bellows stanza 77
Thorpe stanza 76
Aligned passage reference
```

Only show differences that actually exist in imported data.

## Main reading layout

Desktop layout:

* wide central reading column
* translation selector or edition rail
* contextual source panel
* optional Old Norse column
* commentary panel that is visually separate from translation text

Mobile layout:

* Text
* Translations
* Source Notes
* Commentary
* Discussion

Use accessible tabs or accordions.

Do not force three tiny columns onto a phone.

## Translation controls

Allow readers to:

* select the primary translation
* add comparison translations
* toggle Old Norse
* preserve line breaks
* enlarge text
* use distraction-free reading mode
* copy the full stanza
* copy with citation
* copy a short selected excerpt
* open the edition details

## Source notes

Show:

* translator/editor
* edition
* year
* license
* source page where available
* source numbering
* transcription notes
* correction history

## Published commentary

Show separate commentary entries, each with:

* author
* source
* year
* page
* excerpt or paraphrase label
* citation
* interpretation category
* license status

Do not blend multiple authors into an anonymous site voice.

Use an introductory note:

> These readings are presented for comparison. Inclusion does not mean the project declares one reading correct.

## Reflection tools

Signed-in users may add:

* private note
* personal tags
* study question
* related passage
* guide collection

Private notes must never appear in the public discussion area.

## Related passages

Recommend related passages based on:

* shared themes
* source cross-references
* manually reviewed editorial relationships

Do not use opaque “AI recommended” language.

## Discussion at the bottom

At the bottom of every stanza page, include its attached discussion thread.

This is mandatory.

The discussion must visually remain separate from:

* the source text
* licensed commentary
* translator notes
* site editorial notes

Use a heading such as:

> Reader Discussion

Include a short reminder:

> Discussion reflects individual readers and community members. It is not part of the original text or published commentary.

Public visitors can read discussion.

Only verified accounts can post.

Include:

* top-level responses
* threaded replies
* sort by oldest, newest, or most helpful
* report control
* share link
* source citation formatting
* moderator notes
* locked-thread state
* deleted-content state
* empty state without fake posts

Empty state:

> No discussion has been started for this passage yet.

Do not seed fake comments, usernames, scholars, reactions, or member counts.

---

# 12. Search

Search is one of the most important features.

Support:

* stanza number
* exact phrase
* keywords
* Old Norse terms
* translator
* theme
* section
* commentary author
* source title

Examples:

```txt
cattle die
friendship
hospitality
runes
Bellows 77
Thorpe guest
Old Norse orðstírr
```

Use PostgreSQL full-text search and appropriate normalized fields.

Consider trigram matching for spelling variations and partial phrases.

Preserve original text separately from normalized search text.

Search results must show:

* matching stanza
* matching translation
* translator
* highlighted excerpt
* themes
* whether Old Norse or commentary matched
* direct stanza link

Do not mix public forum posts into primary source results by default.

Provide separate result tabs:

* Texts
* Commentary
* Discussions
* Study Guides

Do not use an external search service unless necessary.

---

# 13. Study Guide System

The study-guide feature should help readers organize their own work without the site telling them what to believe.

## Public guides

Create a small set of carefully structured starter guides such as:

* Beginning with the Hávamál
* Hospitality and the Guest
* Speech, Silence, and Listening
* Friendship and Trust
* Reputation, Death, and Memory
* Moderation and Drink
* Odin, Knowledge, and the Runes

These are organizational paths, not doctrinal lessons.

Each guide may contain:

* selected passages
* comparison prompts
* source notes
* reflection questions
* links to published commentary
* space for personal notes

Do not write final-answer explanations.

Use prompts such as:

* What changes between these translations?
* Which terms carry different implications?
* What social setting does the passage appear to assume?
* Which related stanzas complicate this reading?
* What questions remain after comparing the sources?

## Personal guides

Signed-in users can:

* create a guide
* name it
* add stanzas
* reorder items
* choose a preferred translation
* add private notes
* add personal tags
* save selected commentary
* export a clean study document
* keep the guide private

Public sharing of personal guides should be disabled initially or require moderation before publication.

No random identifier should be visible in URLs. Use readable slugs plus secure internal IDs.

---

# 14. Quote-Card Generator

The quote-card generator must help users share exact, properly attributed text.

It must not rewrite, summarize, shorten, or “improve” a stanza automatically.

## User controls

Allow the user to choose:

* stanza
* translation
* full stanza or manually selected lines
* Old Norse inclusion
* square format
* portrait/story format
* landscape format
* text alignment
* type size
* approved visual template
* source attribution position

## Required attribution

Every quote card must include:

* Hávamál
* edition-specific stanza number
* translator or editor
* edition or year when practical
* license note when required

For CC BY-NC content, include the required license attribution.

Do not allow users to remove mandatory source attribution.

## Visual templates

Start with a restrained library of historically grounded templates.

Possible directions:

* black iron and cool white
* deep ink and mineral blue
* oxidized copper detail
* firelit timber without fantasy props
* cool northern water and stone
* documented artifact detail
* clean archive typography
* manuscript-derived linework used accurately

Do not make all templates look like parchment.

Do not include:

* horned helmets

* fantasy warriors

* random runes

* fake bindrunes

* blood splatter

* axes used as filler

* skulls

* generic raven overlays

* AI-generated pseudo-Norse writing

Text-first designs should be the default.

## Export

Support:

* high-quality PNG
* accessible text copy
* social preview
* optional SVG if technically practical

Use a reliable client or server rendering system such as SVG/Satori-compatible rendering or a well-supported HTML-to-image approach.

Exports must remain crisp and properly wrap poetry.

Do not send stanza text to a third-party image API.

Do not use live AI image generation in the public quote-maker.

Quote templates should be curated and approved through the admin area.

---

# 15. Accounts

Reading the site must never require an account.

Searching must never require an account.

Comparing translations must never require an account.

Creating a basic quote card must never require an account.

Accounts are required only for:

* saving stanzas
* private notes
* study guides
* saved quote designs
* discussion posting
* reporting content
* profile and notification settings

Use Supabase Auth.

Support:

* email and password
* email verification
* secure password reset
* optional magic-link login if straightforward
* account deletion
* data export
* sign out
* session persistence

Collect minimal profile data:

* display name
* optional profile image
* short optional bio
* discussion preferences

Do not require:

* real legal name
* religious identity
* location
* birth date unless legally required
* political views
* gender
* ethnicity

Profiles should not display private saved work.

---

# 16. Discussion Forum

Build a custom discussion system integrated into the application.

Do not install a visually separate generic forum template.

The forum should feel like part of the study resource.

## Public forum structure

Initial categories:

* Stanza Discussion
* Translation Questions
* Sources and Editions
* Study Methods
* Historical Context
* Practice and Reflection
* Site Corrections
* Site Feedback

Do not create dozens of empty categories.

Do not add:

* partisan politics
* general culture-war debate
* meme dumping
* marketplace listings
* dating
* paid spiritual services
* unmoderated promotion

## Stanza-linked threads

Every stanza page has one automatically linked discussion thread.

The thread should also appear in the Stanza Discussion category.

Do not create duplicate stanza threads.

Use a stable relation:

```txt
canonical_passage_id -> discussion_thread_id
```

## Thread features

Include:

* title
* category
* optional linked stanza
* author
* creation date
* edited date
* posts
* threaded replies
* source citation helper
* report button
* moderator controls
* lock
* pin
* archive
* soft delete
* edit history
* accessible permalinks

## Posting editor

Use a simple, safe editor.

Support:

* paragraphs
* block quotes
* lists
* source citations
* links
* limited emphasis

Do not allow raw HTML.

Sanitize all content.

Do not build an overcomplicated social-media composer.

## Moderation

Build moderation from the beginning.

Include:

* report queue
* first-post approval option
* user warnings
* temporary posting restriction
* temporary suspension
* permanent ban
* thread lock
* post removal
* moderator notes
* appeal status
* audit log
* configurable rate limits
* link-spam detection
* duplicate-post detection

Community reports must require a reason.

Suggested report reasons:

* harassment
* misinformation presented as sourced fact
* uncited copyrighted text
* spam
* off-topic
* impersonation
* personal information
* other

## Community rules

The project is an inclusive study space.

Clearly prohibit:

* racism

* white supremacy

* antisemitism

* ethnic gatekeeping

* homophobia

* transphobia

* misogyny

* harassment

* threats

* extremist recruitment

* presenting personal belief as mandatory doctrine

* posting copyrighted full translations without permission

Allow disagreement about:

* translation
* historical interpretation
* theology
* practice
* personal reflection

Require disagreement to remain focused on ideas and sources rather than personal attacks.

## No fake activity

Do not create:

* fake users
* fake moderators
* fake comments
* fake likes
* fake “most helpful” counts
* fake trending threads
* fake online-user counts

The live site should launch with honest empty states.

---

# 17. Commentary Versus Community Discussion

The interface must maintain a strict visual and structural distinction.

## Published commentary

This belongs in the study portion of the stanza page.

It must be:

* sourced
* attributed
* reviewed
* licensed or excerpted appropriately
* categorized

## Community discussion

This belongs at the bottom of the page and in the forum.

It must be labeled as:

* reader discussion
* personal reflection
* community interpretation
* question
* source suggestion

Never automatically move a forum post into the commentary section.

Create an admin workflow where a useful forum source suggestion may be reviewed and then independently added as a properly cited commentary record.

---

# 18. Corrections and Editorial Transparency

Add a correction system.

Visitors can report:

* transcription error
* stanza-number mismatch
* broken character
* missing line
* incorrect attribution
* licensing concern
* broken source link
* factual metadata issue

A correction submission must include:

* affected source
* affected passage
* description
* suggested correction
* supporting source
* optional contact email

Admin workflow:

```txt
new
under review
needs source
accepted
rejected
published
```

Every accepted textual correction should create a revision record.

Display a small correction history on edition pages.

Do not silently alter source text.

---

# 19. Admin Area

Create a protected admin area.

Routes may include:

```txt
/admin
/admin/works
/admin/editions
/admin/passages
/admin/alignments
/admin/themes
/admin/commentary
/admin/sources
/admin/licenses
/admin/imports
/admin/quote-templates
/admin/discussions
/admin/reports
/admin/users
/admin/corrections
/admin/settings
```

Admin capabilities:

* add and edit works
* add editions
* upload structured source data
* preview imports
* approve imports
* align passages
* flag uncertain alignment
* manage themes
* add commentary
* record licenses
* disable a source
* control commercial-mode availability
* approve quote templates
* moderate discussions
* review reports
* manage users
* review corrections
* view audit logs

Do not expose admin controls through hidden client-only checks.

Enforce authorization server-side and with database policies.

---

# 20. Database Architecture

Use Supabase Postgres.

Create proper SQL migrations.

Suggested tables:

```txt
profiles
user_roles

works
editions
source_records
license_records
canonical_passages
edition_passages
passage_alignments
passage_sections

themes
passage_themes

commentary_sources
commentary_entries
commentary_passages

study_guides
study_guide_items
user_study_guides
user_study_items
user_notes
bookmarks

quote_templates
quote_template_assets
saved_quote_cards

forum_categories
forum_threads
forum_posts
forum_post_revisions
forum_reports
moderation_actions
user_sanctions

correction_reports
text_revisions
import_jobs
import_errors

site_settings
audit_logs
```

Use foreign keys, indexes, unique constraints, and timestamps properly.

Do not store multiple translations as columns on the stanza table.

Each edition passage should be its own record.

Use JSON only where the data is truly flexible, such as visual template configuration. Do not hide the core relational model inside giant JSON fields.

---

# 21. Row-Level Security and Security

Enable Row-Level Security on all appropriate Supabase tables.

Public users may read only published:

* works
* editions
* passages
* themes
* approved commentary
* public guides
* public discussions

Authenticated users may:

* manage their own notes
* manage their own bookmarks
* manage their own private guides
* create and edit their own forum posts within the allowed edit window
* submit reports
* submit corrections

Moderators may:

* review reports
* hide posts
* lock threads
* apply sanctions according to role

Admins may manage all content.

Security requirements:

* server-side authorization
* sanitized user content
* no raw HTML posting
* safe markdown subset
* rate limiting for login and posting
* verified email before posting
* secure environment variables
* no service-role key in client code
* protected admin routes
* safe file upload validation
* audit logging for moderation and source edits
* secure account deletion
* no personally sensitive information in logs

---

# 22. Technology Stack

Use:

* Next.js App Router
* TypeScript
* Tailwind CSS
* Supabase Postgres
* Supabase Auth
* Supabase Storage where needed
* Vercel-compatible deployment
* PostgreSQL full-text search
* a reliable accessible component foundation only where helpful
* a safe markdown parser for discussion posts
* a stable image export method for quote cards

Do not add Stripe.

Do not add an AI interpretation API.

Do not add a live image-generation API.

Do not add a third-party forum platform.

Do not add a separate CMS unless there is a strong technical reason.

Use server components where appropriate, but do not force them into highly interactive tools where client components are cleaner.

Keep the architecture easy for one developer to maintain.

---

# 23. Source Import System

Do not scrape source websites at runtime.

Create curated local import files and an idempotent import script.

Suggested structure:

```txt
/data/sources/bellows-havamal.json
/data/sources/thorpe-havamal.json
/data/sources/bray-havamal.json
/data/sources/pettit-havamal.json
/data/sources/old-norse-[edition].json
```

Each record should include:

```txt
edition_slug
source_stanza_number
section
text_lines
prose_note
footnotes
source_page
source_reference
license_reference
review_status
```

Build:

```bash
npm run validate:sources
npm run import:sources
```

The validation command should report errors without modifying the database.

The import command should:

* be repeatable
* avoid duplicates
* preserve revision history
* log changes
* stop on serious validation failures
* generate a readable report

Do not automatically publish newly imported source material without review.

---

# 24. SEO

Build useful public pages, not keyword-stuffed pages.

Each stanza page should have:

* unique title
* clear meta description
* canonical URL
* Open Graph data
* translator and stanza information
* structured breadcrumbs
* internal links to themes and editions
* related stanza links

Create:

* XML sitemap
* robots file
* canonical handling
* social previews
* clean URLs

Index:

* published stanza pages
* edition pages
* theme pages
* public study guides
* useful public forum threads

Do not index:

* private notes
* personal study guides
* account pages
* admin pages
* empty search result pages
* thin user profiles
* moderation pages

Do not manufacture pages merely to target keywords.

---

# 25. Accessibility

Meet WCAG AA expectations.

Include:

* complete keyboard navigation
* visible focus states
* semantic headings
* accessible tabs
* accessible dialogs
* readable contrast
* adjustable reading text size
* reduced-motion support
* alt text
* screen-reader labels
* skip links
* clear error messages
* no color-only status indicators

Poetry line breaks must remain understandable to screen readers.

Old Norse characters must render correctly.

The quote maker must include an accessible plain-text equivalent.

---

# 26. Mobile Experience

Mobile is not an afterthought.

On phones:

* search must be immediately available
* stanza text must remain readable
* translation switching must be simple
* comparison views should stack or swipe
* source details should collapse cleanly
* discussion composer must fit the screen
* filters should use a clear drawer
* sticky controls must not cover text
* no tiny multi-column scholarly layout
* no horizontal page overflow
* quote-card controls must be touch-friendly
* account and saved-work controls must remain easy to reach

Test common phone widths.

Do not merely shrink the desktop interface.

---

# 27. Performance

Optimize for:

* static or cached public stanza pages
* fast search
* minimal client JavaScript
* optimized images
* lazy-loaded discussions where appropriate
* efficient database queries
* pagination for forum threads
* server-side filtering
* no unnecessary animation libraries

Target strong Core Web Vitals.

Avoid loading the entire Hávamál corpus into the browser for every page.

---

# 28. Content Rules

Do not invent:

* historical facts
* translator opinions
* manuscript claims
* scholarly consensus
* member statistics
* reviews
* testimonials
* user discussions
* source citations
* books
* author names
* forum activity
* study progress
* dates
* page numbers

Do not add lorem ipsum.

Do not fill empty spaces with random copy.

Do not display arbitrary numbers merely to make the interface feel active.

The only stanza numbers shown must come from imported source records or clearly identified internal alignment records.

Use honest empty states.

Examples:

> No commentary has been added for this passage.

> No reader discussion has been started yet.

> This edition has not been aligned with this passage.

> Source verification is still in progress.

---

# 29. Expansion Architecture

The database and route structure should allow future additions such as:

* Völuspá
* Grímnismál
* Lokasenna
* other Poetic Edda poems
* Prose Edda references
* saga passages
* cross-work themes
* character and place indexes
* manuscript references
* scholarly bibliographies

Do not build all those texts now.

Build the Hávamál experience fully and make the underlying `works` architecture reusable.

Do not hardcode the whole application around one poem in a way that requires a rewrite later.

---

# 30. Initial Seed Content

Seed the project with:

* the verified Hávamál editions listed in this specification
* source and licensing records
* translation metadata
* Old Norse text only after rights verification
* initial themes
* project mission
* methodology page
* licensing page
* community guidelines
* privacy and terms drafts
* empty discussion categories
* no fake forum threads
* no fake members
* no fake saved guides

Create a small number of manually reviewed public study-guide structures, but do not invent authoritative interpretations to fill them.

Where commentary content has not yet been sourced, show a real empty state instead of generating filler.

---

# 31. Deliverables

Deliver a complete repository containing:

* working application
* responsive design
* database migrations
* RLS policies
* source import files
* source validation script
* source import script
* seed script
* authentication
* private saved-work system
* personal notes
* study guides
* comparison tool
* quote-card generator
* stanza discussions
* full forum
* moderation tools
* admin area
* source registry
* licensing controls
* SEO setup
* accessibility support
* tests
* `.env.example`
* deployment instructions
* admin setup instructions
* source-import documentation
* moderation documentation
* README

The README must explain:

* installation
* environment variables
* Supabase setup
* migrations
* seed/import commands
* admin role setup
* source licensing model
* commercial-mode setting
* quote-card rendering
* discussion moderation
* deployment

---

# 32. Testing and Acceptance Criteria

The build is not complete until all of these work.

## Public use

* A visitor can browse the Hávamál without signing in.
* A visitor can search by word, phrase, theme, translator, and stanza number.
* A visitor can open a stanza and switch translations.
* A visitor can compare editions.
* A visitor can view Old Norse where available.
* A visitor can see source and license details.
* A visitor can generate a properly attributed quote card.
* A visitor can read discussion without an account.

## Accounts

* A user can create and verify an account.
* A user can sign in and sign out.
* A user can reset a password.
* A user can bookmark stanzas.
* A user can create private notes.
* A user can build a personal study guide.
* A user can post and reply in discussions.
* A user can report a post.
* A user can delete their account.

## Source integrity

* Each translation is tied to a source record.
* Edition numbering is preserved.
* Different stanza alignments are visible.
* Public-domain and noncommercial licenses are stored separately.
* Pettit attribution appears wherever required.
* Copyrighted modern translations are not displayed.
* Commercial mode disables noncommercial-only content.
* Imports are repeatable and validated.

## Moderation

* Moderators can review reports.
* Moderators can hide posts.
* Moderators can lock threads.
* Moderators can warn or suspend users.
* Actions are logged.
* Admin authorization is enforced server-side.

## Technical quality

* No TypeScript errors.
* No broken routes.
* No package-lock corruption.
* No hydration errors.
* No exposed secret keys.
* No failed production build.
* No horizontal mobile overflow.
* No major accessibility violations.
* No fake data.
* No random numbers.
* No placeholder AI copy.
* No copyrighted full translations without permission.

---

# 33. Implementation Order

Build in this order:

1. Project foundation and design system.
2. Database schema and RLS.
3. Source registry and licensing model.
4. Source validation/import pipeline.
5. Hávamál browser.
6. Individual stanza pages.
7. Translation comparison.
8. Search.
9. Quote-card generator.
10. Authentication.
11. Saved stanzas and private notes.
12. Study-guide system.
13. Stanza-linked discussions.
14. Broader forum.
15. Moderation.
16. Admin area.
17. SEO and accessibility.
18. Testing and documentation.

Do not spend most of the build on the homepage while leaving the actual study tools unfinished.

---

# 34. Final Non-Negotiables

* Build the real working resource, not a visual demo.
* Keep reading and searching free without login.
* Accounts are only for saved work, notes, guides, and discussion.
* Do not rewrite the Hávamál.
* Do not produce a new site interpretation.
* Do not claim one translation is correct.
* Do not publish AI-generated commentary as knowledge.
* Preserve edition-specific wording and numbering.
* Show sources and licenses clearly.
* Include every verified distinct public-domain or noncommercially licensed Hávamál edition available to the project.
* Do not treat duplicate web mirrors as separate translations.
* Do not import Ragweed Forge’s Auden/Taylor translation.
* Do not import Crawford or other copyrighted modern translations without written permission.
* Include a custom discussion area at the bottom of every stanza page.
* Keep public discussion separate from sourced commentary.
* Include a broader custom forum tied into the same account and moderation system.
* Do not use fake Viking visuals.
* Do not use random runes.
* Do not use horned helmets.
* Do not use extremist-coded symbols.
* Do not use fake users, posts, statistics, or testimonials.
* Do not use random numbers to make the application look populated.
* Do not produce a generic AI website.
* Make the design feel like a thoughtful modern Pagan study hall and serious literary archive.
* Make it useful to Pagans, scholars, enthusiasts, and ordinary readers without watering down the source material.
* Keep it fast, mobile-friendly, accessible, maintainable, and ready to expand into other old texts later.
