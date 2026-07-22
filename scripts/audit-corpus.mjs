import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { validateSourceFile } from "./source-utils.mjs";

const root = process.cwd();
const manifests = JSON.parse(await readFile(path.join(root, "data/source-manifests.json"), "utf8"));
const locations = [
  { state: "published", directory: path.join(root, "data", "sources") },
  { state: "staging", directory: path.join(root, "data", "source-staging") },
];
let failed = false;
console.log("State      Edition                 records  public  expected  alignment review");
console.log("─────────  ──────────────────────  ───────  ──────  ────────  ────────────────");
for (const location of locations) {
  if (!existsSync(location.directory)) continue;
  const files = (await readdir(location.directory)).filter((name) => name.endsWith(".json")).sort();
  for (const filename of files) {
    const source = JSON.parse(await readFile(path.join(location.directory, filename), "utf8"));
    const manifest = manifests.find((entry) => entry.editionSlug === source.edition.slug);
    const report = validateSourceFile(source, { filename: `${location.state}/${filename}` });
    const published = source.passages.filter((passage) => passage.review_status === "published").length;
    const uncertain = source.passages.filter((passage) => !passage.alignment_confidence || passage.alignment_confidence === "uncertain").length;
    console.log(`${location.state.padEnd(10)} ${source.edition.slug.padEnd(23)} ${String(source.passages.length).padStart(7)}  ${String(published).padStart(6)}  ${String(manifest?.expectedStanzaCount ?? "—").padStart(8)}  ${String(uncertain).padStart(16)}`);
    if (!report.valid) failed = true;
    if (manifest?.expectedStanzaCount && source.passages.length !== manifest.expectedStanzaCount && manifest.acquisitionStatus !== "bundled_partial") failed = true;
  }
}
if (failed) process.exitCode = 1;
