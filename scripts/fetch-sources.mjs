import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { validateSourceFile } from "./source-utils.mjs";

const root = process.cwd();
const manifests = JSON.parse(await readFile(path.join(root, "data/source-manifests.json"), "utf8"));
const editions = JSON.parse(await readFile(path.join(root, "data/editions.json"), "utf8"));
const requested = process.argv.find((arg) => arg.startsWith("--edition="))?.split("=")[1];
const force = process.argv.includes("--force");
const targets = manifests.filter((manifest) => manifest.parser !== "none" && (!requested || manifest.editionSlug === requested));

if (!targets.length) {
  console.error(requested ? `No fetchable manifest found for ${requested}.` : "No fetchable source manifests found.");
  process.exit(1);
}

const entityMap = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", aacute: "á", eth: "ð", thorn: "þ",
  ouml: "ö", oslash: "ø", aelig: "æ", yacute: "ý", iacute: "í", oacute: "ó", uacute: "ú",
};

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&([a-z]+);/gi, (match, name) => entityMap[name.toLowerCase()] ?? match);
}

function htmlToLines(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h1|h2|h3|h4|tr|blockquote)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
}

function cleanLine(line) {
  return line
    .replace(/^\u200b+/, "")
    .replace(/\[(?:\s*\d+\s*)\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function numberedBlocks(lines, { start = 1, end = 999, stopPatterns = [] } = {}) {
  const records = [];
  let current = null;
  for (const rawLine of lines) {
    const line = cleanLine(rawLine);
    if (!line) continue;
    if (stopPatterns.some((pattern) => pattern.test(line))) break;
    const match = line.match(/^(\d{1,3})(?:[.)]|\s*\([^)]*\))?(?:\s+(.*))?$/);
    if (match) {
      const number = Number(match[1]);
      if (current?.number === end) {
        records.push(current);
        current = null;
        break;
      }
      if (number >= start && number <= end) {
        if (current) records.push(current);
        current = { number, lines: match[2] ? [match[2]] : [] };
        continue;
      }
    }
    if (current && !/^\[?Pg\s+\d+/i.test(line) && line !== "* * *" && line !== "***") {
      current.lines.push(line);
    }
  }
  if (current) records.push(current);
  return records;
}


const superscriptNotePattern = /^[⁰¹²³⁴⁵⁶⁷⁸⁹]+(?:\s|[a-z.—:;,-])/i;

function parseNumberedHeadingHtml(html, start = 1, end = 200) {
  const records = [];
  const headingPattern = /<h3\b[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3\b[^>]*>|<h2\b[^>]*>|$)/gi;
  for (const match of html.matchAll(headingPattern)) {
    const heading = htmlToLines(match[1]).join(" ");
    const numberMatch = heading.match(/^(\d{1,3})(?:\s*\([^)]*\))?$/);
    if (!numberMatch) continue;
    const number = Number(numberMatch[1]);
    if (number < start || number > end) continue;
    const lines = [];
    for (const rawLine of htmlToLines(match[2])) {
      const line = cleanLine(rawLine);
      if (!line || /^(Image|Notes?|Translator['’]s note)$/i.test(line)) continue;
      if (superscriptNotePattern.test(line) || new RegExp(`^${number}\\.[ \\t]`).test(line)) break;
      lines.push(line);
    }
    if (lines.length) records.push({ number, lines });
  }
  return [...new Map(records.map((record) => [record.number, record])).values()].sort((a, b) => a.number - b.number);
}

async function parseWeVikingsEnglish(url, expected) {
  const records = parseNumberedHeadingHtml(await fetchText(url));
  if (records.length !== expected) throw new Error(`Parsed ${records.length} stanzas; expected ${expected}.`);
  return records;
}

function sectionForBellows(number) {
  if (number <= 80) return "Hávamál proper";
  if (number <= 95) return "Counsel and reflections on love";
  if (number <= 102) return "Billing’s daughter";
  if (number <= 110) return "The mead of poetry";
  if (number <= 138) return "Loddfáfnismál";
  if (number <= 146) return "Rúnatal";
  return "Ljóðatal";
}

function themesFor(lines) {
  const text = lines.join(" ").toLowerCase();
  const map = [
    ["hospitality", /guest|host|feast|food|drink|door|house/],
    ["friendship", /friend|trust|gift/],
    ["speech", /speech|speak|word|tongue|silence/],
    ["wisdom", /wise|wisdom|wit|knowledge|counsel/],
    ["moderation", /measure|drunk|ale|beer|mead/],
    ["reputation", /fame|renown|praise|name/],
    ["death", /die|death|corpse|pyre/],
    ["runes", /rune/],
    ["travel", /wander|road|journey|farer|ship/],
    ["generosity", /give|gift|generous/],
  ];
  return map.filter(([, pattern]) => pattern.test(text)).map(([slug]) => slug);
}

function canonicalGuess(editionSlug, sourceNumber) {
  if (editionSlug === "bellows-1923") return {
    canonical_slug: `passage-${String(sourceNumber).padStart(3, "0")}`,
    alignment_confidence: "exact",
    alignment_relation: "one_to_one",
    alignment_note: "Bellows is the internal comparison anchor; this does not make its stanza division authoritative.",
  };
  return {
    canonical_slug: `passage-${String(Math.min(sourceNumber, 165)).padStart(3, "0")}`,
    alignment_confidence: "uncertain",
    alignment_relation: "uncertain",
    alignment_note: "Initial staging placement only. Compare wording and printed divisions against the anchor before publication.",
  };
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "The-Havamal-Archive-source-import/1.0 (noncommercial editorial import)" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.text();
}

async function parseBellows(manifest) {
  try {
    const payload = JSON.parse(await fetchText(manifest.sourceUrl));
    const extract = payload?.query?.pages?.[0]?.extract;
    if (!extract) throw new Error("Wikisource API returned no plain-text extract.");
    const body = extract.split(/\n\s*Footnotes?/i)[0];
    const records = numberedBlocks(body.split(/\r?\n/), { start: 1, end: 165 });
    if (records.length !== 165) throw new Error(`Wikisource parsed ${records.length}; expected 165.`);
    return records;
  } catch (error) {
    return parseWeVikingsEnglish("https://wevikings.com/library/poetry/havamal/henry-adams-bellows/", 165);
  }
}

async function parseThorpe(manifest) {
  try {
    const html = await fetchText(manifest.sourceUrl);
    const lines = htmlToLines(html);
    const start = lines.findIndex((line) => /THE HIGH ONE['’]S LAY/i.test(line));
    const runeStart = lines.findIndex((line, index) => index > start && /ODIN['’]S RUNE-SONG/i.test(line));
    const nextPoem = lines.findIndex((line, index) => index > runeStart && /THE LAY OF HYMIR/i.test(line));
    if (start < 0 || runeStart < 0) throw new Error("Could not locate Thorpe’s Hávamál and Rune-Song headings.");
    const records = [
      ...numberedBlocks(lines.slice(start, runeStart), { start: 1, end: 139, stopPatterns: [/^FOOTNOTES:?$/i] }),
      ...numberedBlocks(lines.slice(runeStart, nextPoem > runeStart ? nextPoem : undefined), { start: 140, end: 166, stopPatterns: [/^FOOTNOTES:?$/i] }),
    ];
    if (records.length !== 166) throw new Error(`Project Gutenberg parsed ${records.length}; expected 166.`);
    return records;
  } catch (error) {
    return parseWeVikingsEnglish("https://wevikings.com/library/havamal-eng/", 166);
  }
}

function oldNorseScore(lines) {
  return (lines.join(" ").match(/[ðþǫæøáéíóúýö]/gi) ?? []).length;
}

async function parseBray(manifest) {
  const html = await fetchText(manifest.sourceUrl);
  const stanzaPattern = /<h3[^>]*>\s*(\d{1,3})\s*<\/h3>([\s\S]*?)(?=<h3[^>]*>\s*\d{1,3}\s*<\/h3>|$)/gi;
  const records = [];
  for (const match of html.matchAll(stanzaPattern)) {
    const number = Number(match[1]);
    if (number < 1 || number > 164) continue;
    const lines = htmlToLines(match[2]).filter((line) => !/^(Image|Notes?)$/i.test(line));
    const splitAt = Math.max(1, Math.floor(lines.length / 2));
    const first = lines.slice(0, splitAt);
    const second = lines.slice(splitAt);
    const firstIsNorse = oldNorseScore(first) >= oldNorseScore(second);
    records.push({ number, lines: firstIsNorse ? second : first, oldNorseLines: firstIsNorse ? first : second });
  }
  if (!records.length) {
    const lines = htmlToLines(html);
    return numberedBlocks(lines, { start: 1, end: 164 });
  }
  return records;
}

async function parseHollander(manifest) {
  return parseWeVikingsEnglish(manifest.sourceUrl, manifest.expectedStanzaCount ?? 165);
}

async function findXmlFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await findXmlFiles(target)));
    else if (/\.(xml|xhtml|html)$/i.test(entry.name)) found.push(target);
  }
  return found;
}

async function parsePettit(manifest) {
  if (process.env.PROJECT_COMMERCIAL_MODE === "true") {
    throw new Error("Pettit import is disabled while PROJECT_COMMERCIAL_MODE=true.");
  }
  const cacheDir = path.join(root, "data", "source-cache");
  const archivePath = path.join(cacheDir, "pettit-2023.xml.zip");
  if (force || !existsSync(archivePath)) {
    const response = await fetch(manifest.sourceUrl, { headers: { "user-agent": "The-Havamal-Archive-source-import/1.0" } });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} downloading Pettit XML archive.`);
    await writeFile(archivePath, Buffer.from(await response.arrayBuffer()));
  }
  const temp = await mkdtemp(path.join(os.tmpdir(), "havamal-pettit-"));
  try {
    let result = spawnSync("tar", ["-xf", archivePath, "-C", temp], { encoding: "utf8" });
    if (result.status !== 0) result = spawnSync("unzip", ["-q", archivePath, "-d", temp], { encoding: "utf8" });
    if (result.status !== 0) throw new Error("Could not unpack the official Pettit XML ZIP. Install bsdtar or unzip and rerun.");
    const files = await findXmlFiles(temp);
    let content = "";
    for (const file of files) {
      const candidate = await readFile(file, "utf8");
      if (/Hávamál|Havamal/.test(candidate) && /stanza|lg|l n=/i.test(candidate)) {
        content = candidate;
        break;
      }
    }
    if (!content) throw new Error("Could not locate the Hávamál XML inside the official archive.");
    const records = [];
    const blocks = content.match(/<(?:div|lg)\b[^>]*(?:n|xml:id)=["'][^"']*(\d{1,3})[^"']*["'][^>]*>[\s\S]*?<\/(?:div|lg)>/gi) ?? [];
    for (const block of blocks) {
      const numberMatch = block.match(/(?:n|xml:id)=["'][^"']*(\d{1,3})/i);
      if (!numberMatch) continue;
      const number = Number(numberMatch[1]);
      if (number < 1 || number > 200) continue;
      const oldNorse = [...block.matchAll(/<(?:l|p)\b[^>]*(?:xml:lang|lang)=["'](?:non|is|on)["'][^>]*>([\s\S]*?)<\/(?:l|p)>/gi)].map((m) => htmlToLines(m[1]).join(" "));
      const english = [...block.matchAll(/<(?:l|p)\b[^>]*(?:xml:lang|lang)=["']en[^"']*["'][^>]*>([\s\S]*?)<\/(?:l|p)>/gi)].map((m) => htmlToLines(m[1]).join(" "));
      if (english.length || oldNorse.length) records.push({ number, lines: english, oldNorseLines: oldNorse });
    }
    if (!records.length) throw new Error("The Pettit XML structure was not recognized. Keep the downloaded archive and update the parser against its TEI structure.");
    return records;
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

const parsers = {
  "bellows-wikisource": parseBellows,
  "thorpe-gutenberg": parseThorpe,
  "bray-wevikings": parseBray,
  "hollander-wevikings": parseHollander,
  "pettit-obp": parsePettit,
};

for (const manifest of targets) {
  const edition = editions.find((entry) => entry.slug === manifest.editionSlug);
  if (!edition) throw new Error(`Edition registry entry missing for ${manifest.editionSlug}.`);
  console.log(`\nFetching ${manifest.editionSlug}…`);
  try {
    const parsed = await parsers[manifest.parser](manifest);
    const byNumber = new Map(parsed.map((record) => [record.number, record]));
    const records = [...byNumber.values()].sort((a, b) => a.number - b.number);
    if (manifest.expectedStanzaCount && records.length !== manifest.expectedStanzaCount) {
      throw new Error(`Parsed ${records.length} stanzas; expected ${manifest.expectedStanzaCount}. No file was written.`);
    }
    const sourceFile = {
      schema_version: 1,
      edition: { ...edition, enabled: false },
      passages: records.map((record) => ({
        edition_slug: edition.slug,
        source_stanza_number: String(record.number),
        ...canonicalGuess(edition.slug, record.number),
        section: sectionForBellows(Math.min(record.number, 165)),
        text_lines: record.lines.map(cleanLine).filter(Boolean),
        ...(record.oldNorseLines?.length ? { old_norse_lines: record.oldNorseLines.map(cleanLine).filter(Boolean) } : {}),
        prose_note: null,
        footnotes: [],
        source_page: null,
        source_reference: manifest.verificationUrl,
        license_reference: manifest.licenseUrl,
        review_status: "needs_review",
        themes: themesFor(record.lines),
      })),
    };
    const report = validateSourceFile(sourceFile, { filename: manifest.outputFile });
    if (!report.valid) {
      console.error(report.errors);
      throw new Error("Generated source file failed validation.");
    }
    await writeFile(path.join(root, "data", "source-staging", manifest.outputFile), `${JSON.stringify(sourceFile, null, 2)}\n`);
    console.log(`WROTE data/source-staging/${manifest.outputFile}: ${records.length} staged stanzas.`);
    console.log("All records remain needs_review and the edition remains disabled until approval.");
  } catch (error) {
    console.error(`FAILED ${manifest.editionSlug}: ${error.message}`);
    process.exitCode = 1;
  }
}
