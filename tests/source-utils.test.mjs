import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSearchText, validateSourceFile } from "../scripts/source-utils.mjs";

function passage(overrides = {}) {
  return {
    edition_slug: "sample",
    source_stanza_number: "1",
    canonical_slug: "passage-001",
    section: "Sample",
    text_lines: ["One line"],
    footnotes: [],
    source_reference: "https://example.com/source",
    license_reference: "https://example.com/license",
    review_status: "published",
    themes: [],
    alignment_confidence: "exact",
    alignment_relation: "one_to_one",
    ...overrides,
  };
}

function source(passages) {
  return { schema_version: 1, edition: { slug: "sample" }, passages };
}

test("normalization preserves searchable letters and removes diacritics", () => {
  assert.equal(normalizeSearchText("Old Norse orðstírr — Bellows"), "old norse orðstirr bellows");
});

test("validator accepts a reviewed bilingual passage", () => {
  const result = validateSourceFile(source([
    passage({ old_norse_lines: ["Deyr fé, deyja frændr"] }),
  ]));
  assert.equal(result.valid, true);
});

test("validator rejects duplicate stanza numbers", () => {
  const result = validateSourceFile(source([
    passage(),
    passage({ canonical_slug: "passage-002" }),
  ]));
  assert.equal(result.valid, false);
});

test("validator accepts explicit many-to-one canonical mappings", () => {
  const result = validateSourceFile(source([
    passage({ source_stanza_number: "1", alignment_relation: "many_to_one" }),
    passage({ source_stanza_number: "2", alignment_relation: "many_to_one" }),
  ]));
  assert.equal(result.valid, true);
});

test("validator rejects invalid alignment metadata", () => {
  const result = validateSourceFile(source([
    passage({ alignment_confidence: "automatic", alignment_relation: "similar" }),
  ]));
  assert.equal(result.valid, false);
});

test("validator rejects empty Old Norse lines", () => {
  const result = validateSourceFile(source([
    passage({ old_norse_lines: [""] }),
  ]));
  assert.equal(result.valid, false);
});
