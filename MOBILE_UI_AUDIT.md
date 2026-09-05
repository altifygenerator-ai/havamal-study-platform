# Mobile and UI Audit

This pass keeps the manuscript brand and existing application mechanics intact while improving small-screen usability and visual consistency.

## Navigation

- Primary archive navigation becomes a single horizontally scrollable index on phones instead of a tall multi-row menu.
- The current section is visibly marked and exposed with `aria-current="page"`.
- Account/session controls remain available in the utility strip without forcing the masthead wider than the viewport.
- Header search remains immediately accessible on mobile.

## Search and browsing

- Search suggestions remain anchored to the search field on phones instead of detaching into a bottom overlay.
- Search input uses the mobile search keyboard action.
- Browse filters stack cleanly on narrow screens.
- Active browse filters can be cleared in one action.
- Passage index rows collapse to a simple one-column reading order on very small screens.

## Stanza reading

- The selected translation stays before source metadata on tablet and mobile.
- A compact passage action strip provides Previous, Compare, Quote, and Next without requiring a long scroll through every translation.
- Edition tabs remain horizontally scrollable and touch-friendly.
- Additional translations are available in a clear expandable section instead of forcing every translation into the main reading flow.
- Long attribution/source text can wrap without causing horizontal overflow.
- Edition numbering now renders as separate lines in passage metadata.
- Related passage cards use the intended two-column desktop span and single-column mobile flow.

## Compare and quote maker

- Compare controls and results stack in a predictable order on smaller screens.
- Quote preview no longer reserves a desktop-sized 520px panel on phones.
- Canvas previews scale to the available viewport width.
- Checkbox, radio, range, select, and button controls have improved touch sizing.

## Accounts, saved work, and discussion

- Account panels, saved-work rows, guide creation, and action buttons collapse cleanly on narrow phones.
- Saved-work actions move below content instead of squeezing beside it.
- Discussion replies use reduced indentation on phones.
- Discussion actions wrap and preserve usable tap targets.

## General responsive safeguards

- Explicit device-width viewport and browser theme color.
- Form controls remain at 16px on mobile to avoid unwanted iOS zoom.
- Imported/source content can wrap safely.
- Tables intentionally scroll horizontally instead of crushing columns.
- Images, canvases, SVGs, and video cannot exceed their container width.
- Touch devices do not depend on hover-only feedback.

## Verification completed in the build environment

- 14 Node test cases pass.
- Source validation runs successfully for the bundled reviewed source data.
- 96 TypeScript/TSX files pass syntax transpilation.
- `app/globals.css` parses successfully with PostCSS.
- Static class-name audit found no unintended missing styles.

A dependency-backed `npm run typecheck` and `npm run build` still need to be run in the normal project/Vercel environment because package installation is unavailable in this build environment.
