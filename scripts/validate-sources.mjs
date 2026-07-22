import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { validateSourceFile } from "./source-utils.mjs";

const locations = [
  { label: "published", directory: path.resolve("data/sources") },
  { label: "staging", directory: path.resolve("data/source-staging") },
];
let failed = false;
let total = 0;
let fileCount = 0;
for (const location of locations) {
  if (!existsSync(location.directory)) continue;
  const names = (await readdir(location.directory)).filter((name) => name.endsWith(".json")).sort();
  for (const name of names) {
    fileCount += 1;
    try {
      const file = JSON.parse(await readFile(path.join(location.directory, name), "utf8"));
      const report = validateSourceFile(file, { filename: `${location.label}/${name}` });
      total += report.summary?.passageCount || 0;
      console.log(`\n${report.valid ? "PASS" : "FAIL"} ${location.label}/${name}: ${report.summary?.passageCount || 0} passages`);
      for (const issue of [...report.errors, ...report.warnings]) {
        console.log(`  ${issue.severity.toUpperCase()} ${issue.recordReference}: ${issue.message}`);
      }
      if (!report.valid) failed = true;
    } catch (error) {
      failed = true;
      console.error(`\nFAIL ${location.label}/${name}: ${error.message}`);
    }
  }
}
console.log(`\nValidated ${fileCount} source file(s), ${total} passage record(s).`);
if (failed) process.exitCode = 1;
