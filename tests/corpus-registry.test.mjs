import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const editions = JSON.parse(await readFile(new URL("../data/editions.json", import.meta.url), "utf8"));
const manifests = JSON.parse(await readFile(new URL("../data/source-manifests.json", import.meta.url), "utf8"));

const required = [
  ["bellows-1923", 165],
  ["thorpe-1866", 166],
  ["bray-1908", 164],
  ["hollander-1928", 165],
  ["pettit-2023", 164],
];

test("all legally registered comparison editions are enabled and count-gated", () => {
  for (const [slug, expected] of required) {
    const edition = editions.find((entry) => entry.slug === slug);
    const manifest = manifests.find((entry) => entry.editionSlug === slug);
    assert.ok(edition, `missing edition ${slug}`);
    assert.equal(edition.enabled, true, `${slug} must be available to the public corpus loader`);
    assert.ok(manifest, `missing source manifest ${slug}`);
    assert.equal(manifest.expectedStanzaCount, expected);
    assert.notEqual(manifest.parser, "none");
  }
});

test("permission-only translations remain disabled", () => {
  const crawford = editions.find((entry) => entry.slug === "crawford-permission-pending");
  assert.ok(crawford);
  assert.equal(crawford.enabled, false);
  assert.equal(crawford.fullTextDisplayAllowed, false);
});
