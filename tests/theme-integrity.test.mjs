import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const themes = JSON.parse(await readFile(new URL("../data/themes.json", import.meta.url), "utf8"));
const corpusCode = await readFile(new URL("../lib/complete-corpus.ts", import.meta.url), "utf8");

const registry = new Set(themes.map((theme) => theme.slug));
const themesFunction = corpusCode.match(/function themesFor\([\s\S]*?\n}\n\nasync function fetchText/)?.[0] ?? "";
const generated = [...themesFunction.matchAll(/\["([a-z-]+)",\s*\//g)].map((match) => match[1]);

test("every automatically assigned theme has a public theme record", () => {
  assert.ok(generated.length > 0);
  for (const slug of generated) {
    assert.ok(registry.has(slug), `missing public theme record for ${slug}`);
  }
});

test("theme slugs are unique", () => {
  assert.equal(registry.size, themes.length);
});
