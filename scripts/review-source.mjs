import { copyFile, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { validateSourceFile } from "./source-utils.mjs";

const root = process.cwd();
const editionSlug = process.argv.find((arg) => arg.startsWith("--edition="))?.split("=")[1];
const approveAll = process.argv.includes("--approve-all");
const publish = process.argv.includes("--publish");
if (!editionSlug || !approveAll) {
  console.error("Use: node scripts/review-source.mjs --edition=<slug> --approve-all [--publish]");
  console.error("Only run this after comparing every generated stanza and alignment against the named edition source.");
  process.exit(1);
}

const manifests = JSON.parse(await readFile(path.join(root, "data/source-manifests.json"), "utf8"));
const manifest = manifests.find((entry) => entry.editionSlug === editionSlug);
if (!manifest?.outputFile) throw new Error(`No source file manifest found for ${editionSlug}.`);

const stagedPath = path.join(root, "data", "source-staging", manifest.outputFile);
const publishedPath = path.join(root, "data", "sources", manifest.outputFile);
const workingPath = existsSync(stagedPath) ? stagedPath : publishedPath;
if (!existsSync(workingPath)) throw new Error(`No staged or published source file found for ${editionSlug}.`);

const source = JSON.parse(await readFile(workingPath, "utf8"));
source.passages = source.passages.map((passage) => ({
  ...passage,
  review_status: publish ? "published" : "approved",
}));
source.edition.enabled = publish;
const report = validateSourceFile(source, { filename: manifest.outputFile });
if (!report.valid) throw new Error("Source file failed validation after review update.");
await writeFile(workingPath, `${JSON.stringify(source, null, 2)}\n`);

if (publish) {
  await copyFile(workingPath, publishedPath);
}

const editionsPath = path.join(root, "data/editions.json");
const editions = JSON.parse(await readFile(editionsPath, "utf8"));
const index = editions.findIndex((entry) => entry.slug === editionSlug);
if (index < 0) throw new Error(`Edition registry entry missing for ${editionSlug}.`);
editions[index].enabled = publish;
const note = publish
  ? "Full local corpus reviewed and published through the source review workflow."
  : "Full local corpus reviewed but not yet published.";
if (!String(editions[index].sourceNotes ?? "").includes(note)) {
  editions[index].sourceNotes = `${editions[index].sourceNotes ?? ""} ${note}`.trim();
}
await writeFile(editionsPath, `${JSON.stringify(editions, null, 2)}\n`);
console.log(`${editionSlug}: ${source.passages.length} passages marked ${publish ? "published, copied into data/sources, and enabled" : "approved in staging"}.`);
