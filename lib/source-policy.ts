import type { EditionRegistryEntry } from "@/lib/types";
export const commercialMode = process.env.PROJECT_COMMERCIAL_MODE === "true" || process.env.NEXT_PUBLIC_PROJECT_COMMERCIAL_MODE === "true";
export function canDisplayEdition(edition: EditionRegistryEntry) { return Boolean(edition.enabled && edition.fullTextDisplayAllowed && (commercialMode ? edition.commercialReuseAllowed : edition.noncommercialReuseAllowed)); }
export function canExportQuote(edition: EditionRegistryEntry) { return canDisplayEdition(edition) && edition.quoteCardExportAllowed; }
