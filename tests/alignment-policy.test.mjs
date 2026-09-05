import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const data = JSON.parse(
  await readFile(new URL("../data/reviewed-alignment-map.json", import.meta.url), "utf8"),
);

function row(edition, stanza) {
  return data.editions[edition].find((item) => item.sourceStanza === stanza);
}

test("reviewed alignment maps cover every printed Thorpe and Bray stanza exactly once", () => {
  assert.equal(data.anchorEdition, "bellows-1923");
  assert.equal(data.editions["thorpe-1866"].length, 166);
  assert.equal(data.editions["bray-1908"].length, 164);
  assert.deepEqual(
    data.editions["thorpe-1866"].map((item) => item.sourceStanza),
    Array.from({ length: 166 }, (_, index) => index + 1),
  );
  assert.deepEqual(
    data.editions["bray-1908"].map((item) => item.sourceStanza),
    Array.from({ length: 164 }, (_, index) => index + 1),
  );
});

test("known reordered stanzas map to their actual Bellows equivalents", () => {
  assert.deepEqual(row("thorpe-1866", 76).bellows, [77]);
  assert.deepEqual(row("thorpe-1866", 78).bellows, [76]);
  assert.deepEqual(row("thorpe-1866", 166).bellows, [138]);
  assert.deepEqual(row("bray-1908", 75).bellows, [77]);
  assert.deepEqual(row("bray-1908", 77).bellows, [76]);
  assert.deepEqual(row("bray-1908", 164).bellows, [138]);
});

test("split and merged stanza relationships are preserved", () => {
  assert.deepEqual(row("thorpe-1866", 103), {
    sourceStanza: 103,
    bellows: [103],
    relation: "many_to_one",
  });
  assert.deepEqual(row("thorpe-1866", 104), {
    sourceStanza: 104,
    bellows: [103],
    relation: "many_to_one",
  });
  assert.deepEqual(row("thorpe-1866", 164), {
    sourceStanza: 164,
    bellows: [163, 164],
    relation: "one_to_many",
  });
  assert.deepEqual(row("bray-1908", 73), {
    sourceStanza: 73,
    bellows: [73, 74],
    relation: "one_to_many",
  });
  assert.deepEqual(row("bray-1908", 86), {
    sourceStanza: 86,
    bellows: [87, 88],
    relation: "one_to_many",
  });
  assert.deepEqual(row("bray-1908", 109).bellows, [111]);
  assert.deepEqual(row("bray-1908", 110).bellows, [111]);
});

test("reviewed mappings never point outside the 165 Bellows anchor passages", () => {
  for (const rows of Object.values(data.editions)) {
    for (const item of rows) {
      assert.ok(item.bellows.length >= 1);
      for (const number of item.bellows) {
        assert.ok(number >= 1 && number <= 165, `${item.sourceStanza} -> ${number}`);
      }
    }
  }
});
