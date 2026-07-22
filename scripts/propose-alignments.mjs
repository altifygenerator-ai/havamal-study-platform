import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeSearchText } from "./source-utils.mjs";

const root = process.cwd();
const sourceDir = path.join(root, "data", "sources");
const stagingDir = path.join(root, "data", "source-staging");
const requested = process.argv.find((arg) => arg.startsWith("--edition="))?.split("=")[1];
const apply = process.argv.includes("--apply");
const sourceMap = new Map();
for (const directory of [sourceDir, stagingDir]) {
  let files = [];
  try { files = (await readdir(directory)).filter((name) => name.endsWith(".json")); } catch { continue; }
  for (const filename of files) {
    const filePath = path.join(directory, filename);
    const file = JSON.parse(await readFile(filePath, "utf8"));
    sourceMap.set(file.edition.slug, { filename, filePath, file });
  }
}
const sources = [...sourceMap.values()];
const anchorEntry = sources.find(({ file }) => file.edition.slug === "bellows-1923");
if (!anchorEntry || anchorEntry.file.passages.length !== 165) {
  console.error("A complete 165-stanza Bellows file is required before proposing cross-edition alignments.");
  process.exit(1);
}

const stop = new Set("a an and are as at be but by for from had has have he her him his i if in into is it its me my no not of on one or our shall she so than that the their them then there they this thou thy to was we were what when where which who will with would ye yet you your".split(" "));
function tokens(lines) {
  return new Set(normalizeSearchText(lines.join(" ")).split(" ").filter((token) => token.length > 2 && !stop.has(token)));
}
function trigrams(lines) {
  const text = normalizeSearchText(lines.join(" ")).replace(/\s+/g, " ");
  const set = new Set();
  for (let index = 0; index < text.length - 2; index += 1) set.add(text.slice(index, index + 3));
  return set;
}
function dice(left, right) {
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const item of left) if (right.has(item)) overlap += 1;
  return (2 * overlap) / (left.size + right.size);
}
function features(passage) {
  const lines = [...passage.text_lines, ...(passage.old_norse_lines ?? [])];
  return { tokenSet: tokens(lines), trigramSet: trigrams(lines) };
}
function similarity(left, right) {
  return dice(left.tokenSet, right.tokenSet) * 0.62 + dice(left.trigramSet, right.trigramSet) * 0.38;
}
function confidenceFor(score, margin) {
  if (score >= 0.66 && margin >= 0.12) return "high";
  if (score >= 0.46 && margin >= 0.06) return "medium";
  return "uncertain";
}

const anchors = anchorEntry.file.passages.map((passage) => ({ passage, features: features(passage) }));
await mkdir(path.join(root, "data", "alignment-reports"), { recursive: true });

for (const entry of sources) {
  const editionSlug = entry.file.edition.slug;
  if (editionSlug === "bellows-1923" || (requested && requested !== editionSlug)) continue;
  const proposals = [];
  const updatedPassages = entry.file.passages.map((passage, sourceIndex) => {
    const sourceFeatures = features(passage);
    const ranked = anchors
      .map((anchor, anchorIndex) => {
        const contentScore = similarity(sourceFeatures, anchor.features);
        const projected = sourceIndex / Math.max(entry.file.passages.length - 1, 1);
        const anchorPosition = anchorIndex / Math.max(anchors.length - 1, 1);
        const positionScore = Math.max(0, 1 - Math.abs(projected - anchorPosition));
        return {
          anchor,
          anchorIndex,
          contentScore,
          score: contentScore * 0.88 + positionScore * 0.12,
        };
      })
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const second = ranked[1];
    const margin = best.score - second.score;
    const confidence = confidenceFor(best.score, margin);
    const proposal = {
      edition_slug: editionSlug,
      source_stanza_number: passage.source_stanza_number,
      proposed_canonical_slug: best.anchor.passage.canonical_slug,
      anchor_stanza_number: best.anchor.passage.source_stanza_number,
      score: Number(best.score.toFixed(4)),
      content_score: Number(best.contentScore.toFixed(4)),
      margin: Number(margin.toFixed(4)),
      confidence,
      runner_up: second.anchor.passage.canonical_slug,
      status: "needs_editor_review",
    };
    proposals.push(proposal);
    if (!apply) return passage;
    return {
      ...passage,
      canonical_slug: proposal.proposed_canonical_slug,
      canonical_span: undefined,
      alignment_confidence: confidence,
      alignment_relation: "one_to_one",
      alignment_note: `Machine-proposed by lexical and positional comparison (score ${proposal.score}); editor review required. Runner-up: ${proposal.runner_up}.`,
      review_status: passage.review_status === "published" ? "needs_review" : passage.review_status,
    };
  });

  const reportPath = path.join(root, "data", "alignment-reports", `${editionSlug}.json`);
  await writeFile(reportPath, `${JSON.stringify({
    schema_version: 1,
    anchor_edition: "bellows-1923",
    target_edition: editionSlug,
    warning: "These are proposals, not approved alignments. Review wording, stanza divisions, relocations, and one-to-many or many-to-one relationships before publication.",
    proposals,
  }, null, 2)}\n`);
  if (apply) {
    entry.file.passages = updatedPassages;
    entry.file.edition.enabled = false;
    await writeFile(entry.filePath, `${JSON.stringify(entry.file, null, 2)}\n`);
  }
  console.log(`${editionSlug}: wrote ${proposals.length} alignment proposals${apply ? " and staged them for review" : ""}.`);
}
