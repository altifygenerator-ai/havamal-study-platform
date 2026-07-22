export type LicenseStatus = "public_domain" | "licensed" | "permission_required" | "unknown";
export type ReviewStatus = "draft" | "needs_review" | "approved" | "published" | "rejected";
export type AlignmentConfidence = "exact" | "high" | "medium" | "uncertain";
export type AlignmentRelation = "one_to_one" | "one_to_many" | "many_to_one" | "uncertain";

export interface EditionRegistryEntry {
  slug: string;
  workTitle: string;
  editionTitle: string;
  translator?: string;
  editor?: string;
  publicationYear: number;
  originalPublisher?: string;
  sourceProvider: string;
  sourceLocation: string;
  language: string;
  licenseName: string;
  licenseStatus: LicenseStatus;
  attributionText: string;
  publicDomainJurisdictionNotes?: string;
  commercialReuseAllowed: boolean;
  noncommercialReuseAllowed: boolean;
  fullTextDisplayAllowed: boolean;
  quoteCardExportAllowed: boolean;
  downloadableExportAllowed: boolean;
  sourceNotes?: string;
  dateLastVerified: string;
  verifiedBy: string;
  enabled: boolean;
}

export interface SourcePassage {
  edition_slug: string;
  source_stanza_number: string;
  canonical_slug: string;
  canonical_span?: string[];
  alignment_confidence?: AlignmentConfidence;
  alignment_relation?: AlignmentRelation;
  alignment_note?: string | null;
  section: string;
  text_lines: string[];
  old_norse_lines?: string[];
  prose_note?: string | null;
  footnotes: string[];
  source_page?: string | null;
  source_reference: string;
  license_reference: string;
  review_status: ReviewStatus;
  themes: string[];
}

export interface SourceFile {
  schema_version: 1;
  edition: EditionRegistryEntry;
  passages: SourcePassage[];
}

export interface CanonicalPassage {
  slug: string;
  internalReference: string;
  section: string;
  themes: string[];
  editions: Array<{ edition: EditionRegistryEntry; passage: SourcePassage }>;
}

export interface ForumCategory {
  slug: string;
  title: string;
  description: string;
}


export interface CorpusSourceStatus {
  editionSlug: string;
  label: string;
  state: "bundled" | "loaded" | "unavailable" | "excluded";
  stanzaCount: number;
  message: string;
}

export interface SourceManifest {
  editionSlug: string;
  outputFile: string;
  acquisitionStatus: "bundled_partial" | "ready_to_fetch" | "manual_review_required" | "metadata_only";
  expectedStanzaCount?: number;
  sourceUrl: string;
  verificationUrl: string;
  licenseUrl: string;
  parser: "bellows-wikisource" | "thorpe-gutenberg" | "bray-wevikings" | "hollander-wevikings" | "pettit-obp" | "none";
  autoPublish: boolean;
  notes: string;
}
