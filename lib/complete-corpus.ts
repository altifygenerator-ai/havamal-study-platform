import "server-only";

import { inflateRawSync } from "node:zlib";
import editionsJson from "@/data/editions.json";
import manifestsJson from "@/data/source-manifests.json";
import type {
  AlignmentConfidence,
  AlignmentRelation,
  CanonicalPassage,
  CorpusSourceStatus,
  EditionRegistryEntry,
  SourceFile,
  SourceManifest,
  SourcePassage,
} from "@/lib/types";
import { commercialMode } from "@/lib/source-policy";
import { getAllPassages, getSourceFiles } from "@/lib/data";
import { normalizeSearchText } from "@/lib/normalize";

export type CompleteCorpusResult = {
  passages: CanonicalPassage[];
  statuses: CorpusSourceStatus[];
  generatedAt: string;
};

type ParsedRecord = {
  number: number;
  lines: string[];
  oldNorseLines?: string[];
};

type AlignmentAssignment = {
  canonicalSlugs: string[];
  confidence: AlignmentConfidence;
  relation: AlignmentRelation;
  note: string;
};

const editions = editionsJson as EditionRegistryEntry[];
const manifests = manifestsJson as SourceManifest[];
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
let memoryCache: { expiresAt: number; value: CompleteCorpusResult } | null = null;
let pending: Promise<CompleteCorpusResult> | null = null;

const entityMap: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  aacute: "á",
  eth: "ð",
  thorn: "þ",
  ouml: "ö",
  oslash: "ø",
  aelig: "æ",
  yacute: "ý",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
};

function decodeEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, number: string) => String.fromCodePoint(Number(number)))
    .replace(/&([a-z]+);/gi, (match, name: string) => entityMap[name.toLowerCase()] ?? match);
}

function cleanLine(line: string) {
  return decodeEntities(line)
    .replace(/^\u200b+/, "")
    .replace(/\[(?:\s*\d+\s*)\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlToLines(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h1|h2|h3|h4|tr|blockquote|l|head)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);
}

function numberedBlocks(
  lines: string[],
  { start = 1, end = 999, stopPatterns = [] as RegExp[] } = {},
) {
  const records: ParsedRecord[] = [];
  let current: ParsedRecord | null = null;

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);
    if (!line) continue;
    if (stopPatterns.some((pattern) => pattern.test(line))) break;
    const match = line.match(/^(\d{1,3})(?:[.)]|\s*\([^)]*\))?(?:\s+(.*))?$/);
    if (match) {
      const number = Number(match[1]);
      if (number >= start && number <= end) {
        if (current && number < current.number) break;
        if (current && number === current.number) {
          if (match[2]) current.lines.push(match[2]);
          continue;
        }
        if (current) records.push(current);
        current = { number, lines: match[2] ? [match[2]] : [] };
        continue;
      }
      if (current?.number === end) break;
    }
    if (current && !/^\[?Pg\s+\d+/i.test(line) && line !== "* * *" && line !== "***") {
      current.lines.push(line);
    }
  }
  if (current) records.push(current);
  return records;
}


const superscriptNotePattern = /^[⁰¹²³⁴⁵⁶⁷⁸⁹]+(?:\s|[a-z.—:;,-])/i;

function parseNumberedHeadingHtml(html: string, start: number, end: number) {
  const records: ParsedRecord[] = [];
  const headingPattern = /<h3\b[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3\b[^>]*>|<h2\b[^>]*>|$)/gi;

  for (const match of html.matchAll(headingPattern)) {
    const heading = htmlToLines(match[1]).join(" ");
    const numberMatch = heading.match(/^(\d{1,3})(?:\s*\([^)]*\))?$/);
    if (!numberMatch) continue;
    const number = Number(numberMatch[1]);
    if (number < start || number > end) continue;

    const lines: string[] = [];
    for (const rawLine of htmlToLines(match[2])) {
      const line = cleanLine(rawLine);
      if (!line || /^(Image|Notes?|Translator['’]s note)$/i.test(line)) continue;
      if (superscriptNotePattern.test(line) || new RegExp(`^${number}\\.[ \t]`).test(line)) break;
      lines.push(line);
    }
    if (lines.length) records.push({ number, lines });
  }

  return [...new Map(records.map((record) => [record.number, record])).values()].sort(
    (left, right) => left.number - right.number,
  );
}

async function parseWeVikingsEnglish(url: string, expected: number) {
  const records = parseNumberedHeadingHtml(await fetchText(url), 1, 200);
  if (records.length !== expected) {
    throw new Error(`registered transcription found ${records.length} stanzas; expected ${expected}`);
  }
  return records;
}

function sectionForAnchor(number: number) {
  if (number <= 80) return "Hávamál proper";
  if (number <= 95) return "Counsel and reflections on love";
  if (number <= 102) return "Billing’s daughter";
  if (number <= 110) return "The mead of poetry";
  if (number <= 138) return "Loddfáfnismál";
  if (number <= 146) return "Rúnatal";
  return "Ljóðatal";
}

function themesFor(lines: string[]) {
  const text = lines.join(" ").toLowerCase();
  const map: Array<[string, RegExp]> = [
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

async function fetchText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "The-Havamal-Archive/1.0 (noncommercial source reader)",
        accept: "text/html,text/plain,application/json,application/xml,*/*",
      },
      redirect: "follow",
      signal: controller.signal,
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBuffer(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "The-Havamal-Archive/1.0 (noncommercial source reader)" },
      redirect: "follow",
      signal: controller.signal,
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return Buffer.from(await response.arrayBuffer());
  } finally {
    clearTimeout(timeout);
  }
}

async function parseBellows(manifest: SourceManifest) {
  try {
    const payload = JSON.parse(await fetchText(manifest.sourceUrl)) as {
      query?: { pages?: Array<{ extract?: string }> };
    };
    const extract = payload.query?.pages?.[0]?.extract;
    if (!extract) throw new Error("Wikisource returned no Hávamál text.");
    const body = extract.split(/\n\s*Footnotes?/i)[0];
    const records = numberedBlocks(body.split(/\r?\n/), { start: 1, end: 165 });
    if (records.length !== 165) throw new Error(`Wikisource found ${records.length}; expected 165.`);
    return records;
  } catch (primaryError) {
    try {
      return await parseWeVikingsEnglish(
        "https://wevikings.com/library/poetry/havamal/henry-adams-bellows/",
        165,
      );
    } catch (fallbackError) {
      throw new Error(
        `Wikisource failed (${primaryError instanceof Error ? primaryError.message : "unknown error"}); Bellows fallback failed (${fallbackError instanceof Error ? fallbackError.message : "unknown error"}).`,
      );
    }
  }
}

async function parseThorpe(manifest: SourceManifest) {
  try {
    const html = await fetchText(manifest.sourceUrl);
    const lines = htmlToLines(html);
    const start = lines.findIndex((line) => /THE HIGH ONE['’]S LAY/i.test(line));
    const runeStart = lines.findIndex(
      (line, index) => index > start && /ODIN['’]S RUNE-SONG/i.test(line),
    );
    const nextPoem = lines.findIndex(
      (line, index) => index > runeStart && /THE LAY OF HYMIR/i.test(line),
    );
    if (start < 0 || runeStart < 0) throw new Error("Thorpe Hávamál headings were not found.");
    const records = [
      ...numberedBlocks(lines.slice(start, runeStart), {
        start: 1,
        end: 139,
        stopPatterns: [/^FOOTNOTES:?$/i],
      }),
      ...numberedBlocks(lines.slice(runeStart, nextPoem > runeStart ? nextPoem : undefined), {
        start: 140,
        end: 166,
        stopPatterns: [/^FOOTNOTES:?$/i],
      }),
    ];
    if (records.length !== 166) throw new Error(`Project Gutenberg found ${records.length}; expected 166.`);
    return records;
  } catch (primaryError) {
    try {
      return await parseWeVikingsEnglish("https://wevikings.com/library/havamal-eng/", 166);
    } catch (fallbackError) {
      throw new Error(
        `Project Gutenberg failed (${primaryError instanceof Error ? primaryError.message : "unknown error"}); Thorpe fallback failed (${fallbackError instanceof Error ? fallbackError.message : "unknown error"}).`,
      );
    }
  }
}

function oldNorseScore(lines: string[]) {
  return (lines.join(" ").match(/[ðþǫæøáéíóúýö]/gi) ?? []).length;
}

async function parseBray(manifest: SourceManifest) {
  const html = await fetchText(manifest.sourceUrl);
  const stanzaPattern = /<h3[^>]*>\s*(\d{1,3})(?:\s*\([^)]*\))?\s*<\/h3>([\s\S]*?)(?=<h3[^>]*>\s*\d{1,3}(?:\s*\([^)]*\))?\s*<\/h3>|<h2[^>]*>|$)/gi;
  const records: ParsedRecord[] = [];

  for (const match of html.matchAll(stanzaPattern)) {
    const number = Number(match[1]);
    if (number < 1 || number > 164) continue;
    const fragment = match[2];
    const paragraphs = [...fragment.matchAll(/<(?:p|div|blockquote)[^>]*>([\s\S]*?)<\/(?:p|div|blockquote)>/gi)]
      .map((item) => htmlToLines(item[1]))
      .filter((lines) => lines.length && !/^(Image|Notes?)$/i.test(lines.join(" ")));
    let oldNorseLines: string[] = [];
    let englishLines: string[] = [];

    for (const lines of paragraphs) {
      const text = lines.join(" ");
      if (/^\d{1,3}[.—-]/.test(text) || /R No\.|paper MSS|see\s+[A-Z]/i.test(text)) continue;
      if (oldNorseScore(lines) >= 2) oldNorseLines.push(...lines);
      else englishLines.push(...lines);
    }

    if (!englishLines.length) {
      const lines = htmlToLines(fragment).filter(
        (line) => !/^\d{1,3}[.—-]/.test(line) && !/^(Image|Notes?)$/i.test(line),
      );
      const splitAt = Math.max(1, Math.floor(lines.length / 2));
      const first = lines.slice(0, splitAt);
      const second = lines.slice(splitAt);
      const firstIsNorse = oldNorseScore(first) >= oldNorseScore(second);
      oldNorseLines = firstIsNorse ? first : second;
      englishLines = firstIsNorse ? second : first;
    }

    records.push({ number, lines: englishLines.map(cleanLine).filter(Boolean), oldNorseLines });
  }
  return records;
}

function unzipEntries(buffer: Buffer) {
  const entries = new Map<string, Buffer>();
  let eocd = -1;
  for (let index = buffer.length - 22; index >= Math.max(0, buffer.length - 65_557); index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) throw new Error("The official Pettit ZIP has no central directory.");
  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);

  for (let item = 0; item < count; item += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;
    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const filenameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const filename = buffer.subarray(offset + 46, offset + 46 + filenameLength).toString("utf8");
    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error("Invalid ZIP entry.");
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    const content = compression === 0 ? compressed : compression === 8 ? inflateRawSync(compressed) : null;
    if (content) entries.set(filename, content);
    offset += 46 + filenameLength + extraLength + commentLength;
  }
  return entries;
}

function extractXmlLines(fragment: string) {
  return [...fragment.matchAll(/<(?:l|p|seg|ab)\b[^>]*>([\s\S]*?)<\/(?:l|p|seg|ab)>/gi)]
    .flatMap((match) => htmlToLines(match[1]))
    .map(cleanLine)
    .filter(Boolean);
}

async function parseHollander(manifest: SourceManifest) {
  return parseWeVikingsEnglish(manifest.sourceUrl, manifest.expectedStanzaCount ?? 165);
}

async function parsePettitXml(manifest: SourceManifest) {
  if (commercialMode) throw new Error("Excluded in commercial mode by CC BY-NC 4.0.");
  const archive = await fetchBuffer(manifest.sourceUrl);
  const entries = unzipEntries(archive);
  const xmlCandidates = [...entries.entries()].filter(([name]) => /\.(xml|xhtml|html)$/i.test(name));
  const candidate = xmlCandidates.find(([, value]) => /Hávamál|Havamal/i.test(value.toString("utf8")));
  if (!candidate) throw new Error("Hávamál was not found in the official XML package.");
  const allXml = candidate[1].toString("utf8");
  const start = allXml.search(/Hávamál|Havamal/i);
  const after = allXml.slice(Math.max(0, start));
  const next = after.search(/Vafþrúðnismál|Vafthrudnismal/i);
  const xml = next > 0 ? after.slice(0, next) : after;
  const records: ParsedRecord[] = [];
  const blockPattern = /<lg\b([^>]*)>([\s\S]*?)<\/lg>/gi;

  for (const match of xml.matchAll(blockPattern)) {
    const attrs = match[1];
    const numberMatch = attrs.match(/\bn=["'](?:st\.?\s*)?(\d{1,3})["']/i) ?? attrs.match(/xml:id=["'][^"']*?(\d{1,3})["']/i);
    if (!numberMatch) continue;
    const number = Number(numberMatch[1]);
    if (number < 1 || number > 200) continue;
    const block = match[2];
    const oldNorseFragments = [...block.matchAll(/<(?:lg|div|seg|p)\b[^>]*(?:xml:lang|lang)=["'](?:non|on|is)["'][^>]*>([\s\S]*?)<\/(?:lg|div|seg|p)>/gi)]
      .flatMap((item) => extractXmlLines(item[1]));
    const englishFragments = [...block.matchAll(/<(?:lg|div|seg|p)\b[^>]*(?:xml:lang|lang)=["']en(?:-[^"']*)?["'][^>]*>([\s\S]*?)<\/(?:lg|div|seg|p)>/gi)]
      .flatMap((item) => extractXmlLines(item[1]));
    const allLines = extractXmlLines(block);
    const oldNorseLines = oldNorseFragments.length
      ? oldNorseFragments
      : allLines.filter((line) => oldNorseScore([line]) >= 1);
    const lines = englishFragments.length
      ? englishFragments
      : allLines.filter((line) => oldNorseScore([line]) === 0);
    if (lines.length || oldNorseLines.length) records.push({ number, lines, oldNorseLines });
  }

  const unique = [...new Map(records.map((record) => [record.number, record])).values()].sort(
    (left, right) => left.number - right.number,
  );
  if (unique.length < 150) {
    throw new Error(`Official XML parser found only ${unique.length} stanzas; edition was not exposed.`);
  }
  return unique;
}

async function parsePettitHtmlFallback() {
  const html = await fetchText("https://www.einherjar.org/the-poetic-edda/havamal/");
  const lines = htmlToLines(html);
  const start = lines.findIndex((line) => /Sayings of the High One/i.test(line));
  if (start < 0) throw new Error("The licensed Pettit fallback transcription was not recognized.");
  const records = numberedBlocks(lines.slice(start), { start: 1, end: 164 });
  if (records.length !== 164) {
    throw new Error(`Licensed Pettit fallback found ${records.length} stanzas; expected 164.`);
  }
  return records;
}

async function parsePettit(manifest: SourceManifest) {
  try {
    return await parsePettitXml(manifest);
  } catch (xmlError) {
    try {
      return await parsePettitHtmlFallback();
    } catch (fallbackError) {
      throw new Error(
        `Official XML failed (${xmlError instanceof Error ? xmlError.message : "unknown error"}); licensed HTML fallback failed (${fallbackError instanceof Error ? fallbackError.message : "unknown error"}).`,
      );
    }
  }
}

const parsers: Record<SourceManifest["parser"], (manifest: SourceManifest) => Promise<ParsedRecord[]>> = {
  "bellows-wikisource": parseBellows,
  "thorpe-gutenberg": parseThorpe,
  "bray-wevikings": parseBray,
  "hollander-wevikings": parseHollander,
  "pettit-obp": parsePettit,
  none: async () => [],
};

const stopWords = new Set(
  "a an and are as at be but by for from had has have he her him his i if in into is it its me my no not of on one or our shall she so than that the their them then there they this thou thy to was we were what when where which who will with would ye yet you your".split(
    " ",
  ),
);

function tokenSet(lines: string[]): Set<string> {
  return new Set<string>(
    normalizeSearchText(lines.join(" "))
      .split(" ")
      .filter((token) => token.length > 2 && !stopWords.has(token)),
  );
}

function trigramSet(lines: string[]) {
  const text = normalizeSearchText(lines.join(" ")).replace(/\s+/g, " ");
  const result = new Set<string>();
  for (let index = 0; index < text.length - 2; index += 1) result.add(text.slice(index, index + 3));
  return result;
}

function dice(left: Set<string>, right: Set<string>) {
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const item of left) if (right.has(item)) overlap += 1;
  return (2 * overlap) / (left.size + right.size);
}

function similarity(left: string[], right: string[]) {
  return dice(tokenSet(left), tokenSet(right)) * 0.64 + dice(trigramSet(left), trigramSet(right)) * 0.36;
}

function confidenceFor(score: number): AlignmentConfidence {
  if (score >= 0.59) return "high";
  if (score >= 0.38) return "medium";
  return "uncertain";
}

/**
 * Monotonic sequence alignment permits one-to-one, one-to-two and two-to-one
 * relationships. It is a finding aid, never a claim that Bellows numbering is
 * academically authoritative. Relocated closing material is matched separately.
 */
function alignToBellows(target: ParsedRecord[], anchors: ParsedRecord[]) {
  const relocated = new Map<number, AlignmentAssignment>();
  let workingTarget = target;

  if (target.length && target[target.length - 1]?.number === 166) {
    const final = target[target.length - 1];
    const ranked = anchors
      .map((anchor) => ({ anchor, score: similarity(final.lines, anchor.lines) }))
      .sort((left, right) => right.score - left.score);
    if (ranked[0] && ranked[0].score >= 0.28 && ranked[0].anchor.number < 150) {
      relocated.set(final.number, {
        canonicalSlugs: [`passage-${String(ranked[0].anchor.number).padStart(3, "0")}`],
        confidence: confidenceFor(ranked[0].score),
        relation: "one_to_one",
        note: `Relocated closing stanza matched by text to Bellows ${ranked[0].anchor.number}; printed number ${final.number} is preserved.`,
      });
      workingTarget = target.slice(0, -1);
    }
  }

  const n = workingTarget.length;
  const m = anchors.length;
  const dp = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(Number.NEGATIVE_INFINITY));
  const back = Array.from({ length: n + 1 }, () => Array<{ di: number; dj: number; score: number } | null>(m + 1).fill(null));
  dp[0][0] = 0;

  function update(i: number, j: number, ni: number, nj: number, value: number, score: number) {
    if (value > dp[ni][nj]) {
      dp[ni][nj] = value;
      back[ni][nj] = { di: ni - i, dj: nj - j, score };
    }
  }

  for (let i = 0; i <= n; i += 1) {
    for (let j = 0; j <= m; j += 1) {
      if (!Number.isFinite(dp[i][j])) continue;
      if (i < n && j < m) {
        const score = similarity(workingTarget[i].lines, anchors[j].lines);
        update(i, j, i + 1, j + 1, dp[i][j] + score - 0.16, score);
      }
      if (i < n && j + 1 < m) {
        const score = similarity(workingTarget[i].lines, [
          ...anchors[j].lines,
          ...anchors[j + 1].lines,
        ]);
        update(i, j, i + 1, j + 2, dp[i][j] + score - 0.28, score);
      }
      if (i + 1 < n && j < m) {
        const score = similarity(
          [...workingTarget[i].lines, ...workingTarget[i + 1].lines],
          anchors[j].lines,
        );
        update(i, j, i + 2, j + 1, dp[i][j] + score - 0.28, score);
      }
      if (i < n) update(i, j, i + 1, j, dp[i][j] - 0.62, 0);
      if (j < m) update(i, j, i, j + 1, dp[i][j] - 0.62, 0);
    }
  }

  const assignments = new Map<number, AlignmentAssignment>();
  let i = n;
  let j = m;
  const steps: Array<{ startI: number; startJ: number; di: number; dj: number; score: number }> = [];
  while (i > 0 || j > 0) {
    const step = back[i][j];
    if (!step) break;
    steps.push({ startI: i - step.di, startJ: j - step.dj, ...step });
    i -= step.di;
    j -= step.dj;
  }

  for (const step of steps.reverse()) {
    if (step.di === 1 && step.dj === 1) {
      const targetRecord = workingTarget[step.startI];
      const anchor = anchors[step.startJ];
      assignments.set(targetRecord.number, {
        canonicalSlugs: [`passage-${String(anchor.number).padStart(3, "0")}`],
        confidence: confidenceFor(step.score),
        relation: "one_to_one",
        note: `Aligned by sequence and wording to Bellows ${anchor.number}; printed numbering remains ${targetRecord.number}.`,
      });
    } else if (step.di === 1 && step.dj === 2) {
      const targetRecord = workingTarget[step.startI];
      const anchorA = anchors[step.startJ];
      const anchorB = anchors[step.startJ + 1];
      assignments.set(targetRecord.number, {
        canonicalSlugs: [anchorA, anchorB].map(
          (anchor) => `passage-${String(anchor.number).padStart(3, "0")}`,
        ),
        confidence: confidenceFor(step.score),
        relation: "one_to_many",
        note: `This printed stanza spans material aligned with Bellows ${anchorA.number}–${anchorB.number}.`,
      });
    } else if (step.di === 2 && step.dj === 1) {
      const targetA = workingTarget[step.startI];
      const targetB = workingTarget[step.startI + 1];
      const anchor = anchors[step.startJ];
      for (const targetRecord of [targetA, targetB]) {
        assignments.set(targetRecord.number, {
          canonicalSlugs: [`passage-${String(anchor.number).padStart(3, "0")}`],
          confidence: confidenceFor(step.score),
          relation: "many_to_one",
          note: `Printed stanzas ${targetA.number}–${targetB.number} share material aligned with Bellows ${anchor.number}.`,
        });
      }
    }
  }

  for (const record of workingTarget) {
    if (assignments.has(record.number)) continue;
    const projected = Math.max(1, Math.min(165, Math.round((record.number / Math.max(n, 1)) * 165)));
    assignments.set(record.number, {
      canonicalSlugs: [`passage-${String(projected).padStart(3, "0")}`],
      confidence: "uncertain",
      relation: "uncertain",
      note: "Provisional positional alignment; review against the printed edition before scholarly citation.",
    });
  }

  for (const [number, assignment] of relocated) assignments.set(number, assignment);
  return assignments;
}

function buildSourceFile(
  edition: EditionRegistryEntry,
  manifest: SourceManifest,
  records: ParsedRecord[],
  anchorRecords: ParsedRecord[],
): SourceFile {
  const isAnchor = edition.slug === "bellows-1923";
  const alignments = isAnchor ? new Map<number, AlignmentAssignment>() : alignToBellows(records, anchorRecords);
  const runtimeEdition: EditionRegistryEntry = { ...edition, enabled: true };

  return {
    schema_version: 1,
    edition: runtimeEdition,
    passages: records.map((record) => {
      const assignment = isAnchor
        ? {
            canonicalSlugs: [`passage-${String(record.number).padStart(3, "0")}`],
            confidence: "exact" as const,
            relation: "one_to_one" as const,
            note: "Bellows supplies the internal comparison anchor only; its division is not presented as authoritative.",
          }
        : alignments.get(record.number)!;
      return {
        edition_slug: edition.slug,
        source_stanza_number: String(record.number),
        canonical_slug: assignment.canonicalSlugs[0],
        ...(assignment.canonicalSlugs.length > 1 ? { canonical_span: assignment.canonicalSlugs } : {}),
        alignment_confidence: assignment.confidence,
        alignment_relation: assignment.relation,
        alignment_note: assignment.note,
        section: sectionForAnchor(Number(assignment.canonicalSlugs[0].replace("passage-", ""))),
        text_lines: record.lines.map(cleanLine).filter(Boolean),
        ...(record.oldNorseLines?.length
          ? { old_norse_lines: record.oldNorseLines.map(cleanLine).filter(Boolean) }
          : {}),
        prose_note: null,
        footnotes: [],
        source_page: null,
        source_reference: manifest.verificationUrl,
        license_reference: manifest.licenseUrl,
        review_status: "published",
        themes: themesFor(record.lines),
      } satisfies SourcePassage;
    }),
  };
}

function combineSourceFiles(sourceFiles: SourceFile[]) {
  const map = new Map<string, CanonicalPassage>();
  for (const file of sourceFiles) {
    for (const passage of file.passages) {
      const canonicalSlugs = passage.canonical_span?.length
        ? passage.canonical_span
        : [passage.canonical_slug];
      for (const canonicalSlug of canonicalSlugs) {
        const current = map.get(canonicalSlug) ?? {
          slug: canonicalSlug,
          internalReference: canonicalSlug.replace("passage-", "Aligned passage "),
          section: passage.section,
          themes: [],
          editions: [],
        };
        current.themes = [...new Set([...current.themes, ...passage.themes])];
        if (!current.editions.some(({ edition }) => edition.slug === file.edition.slug)) {
          current.editions.push({ edition: file.edition, passage });
        }
        map.set(canonicalSlug, current);
      }
    }
  }
  const order = new Map(editions.map((edition, index) => [edition.slug, index]));
  for (const passage of map.values()) {
    passage.editions.sort(
      (left, right) => (order.get(left.edition.slug) ?? 999) - (order.get(right.edition.slug) ?? 999),
    );
  }
  return [...map.values()].sort((left, right) =>
    left.slug.localeCompare(right.slug, undefined, { numeric: true }),
  );
}

async function loadCorpusFresh(): Promise<CompleteCorpusResult> {
  const localFiles = getSourceFiles();
  const localBellows = localFiles.find((file) => file.edition.slug === "bellows-1923");
  const statuses: CorpusSourceStatus[] = [];
  const loaded = new Map<string, SourceFile>();
  for (const file of localFiles) loaded.set(file.edition.slug, file);

  const bellowsManifest = manifests.find((manifest) => manifest.editionSlug === "bellows-1923");
  const bellowsEdition = editions.find((edition) => edition.slug === "bellows-1923");
  let anchorRecords: ParsedRecord[] =
    localBellows?.passages.map((passage) => ({
      number: Number(passage.source_stanza_number),
      lines: passage.text_lines,
      oldNorseLines: passage.old_norse_lines,
    })) ?? [];

  if (bellowsManifest && bellowsEdition) {
    try {
      const records = await parseBellows(bellowsManifest);
      if (records.length !== bellowsManifest.expectedStanzaCount) {
        throw new Error(`found ${records.length}; expected ${bellowsManifest.expectedStanzaCount}`);
      }
      anchorRecords = records;
      loaded.set(
        bellowsEdition.slug,
        buildSourceFile(bellowsEdition, bellowsManifest, records, records),
      );
      statuses.push({
        editionSlug: bellowsEdition.slug,
        label: bellowsEdition.translator ?? bellowsEdition.editionTitle,
        state: "loaded",
        stanzaCount: records.length,
        message: "Complete public-domain edition loaded from the registered source.",
      });
    } catch (error) {
      statuses.push({
        editionSlug: bellowsEdition.slug,
        label: bellowsEdition.translator ?? bellowsEdition.editionTitle,
        state: "bundled",
        stanzaCount: anchorRecords.length,
        message: `Using bundled reviewed passages because the complete source could not load: ${error instanceof Error ? error.message : "unknown error"}`,
      });
    }
  }

  if (anchorRecords.length < 150) {
    return {
      passages: getAllPassages(),
      statuses,
      generatedAt: new Date().toISOString(),
    };
  }

  const targets = manifests.filter(
    (manifest) =>
      manifest.parser !== "none" &&
      manifest.editionSlug !== "bellows-1923" &&
      manifest.editionSlug !== "crawford-permission-pending",
  );
  const results = await Promise.allSettled(
    targets.map(async (manifest) => {
      const edition = editions.find((entry) => entry.slug === manifest.editionSlug);
      if (!edition) throw new Error(`Edition registry missing for ${manifest.editionSlug}.`);
      if (commercialMode && !edition.commercialReuseAllowed) {
        return {
          edition,
          manifest,
          file: null,
          excluded: true,
          count: 0,
        };
      }
      const records = await parsers[manifest.parser](manifest);
      if (manifest.expectedStanzaCount && records.length !== manifest.expectedStanzaCount) {
        throw new Error(`found ${records.length}; expected ${manifest.expectedStanzaCount}`);
      }
      return {
        edition,
        manifest,
        file: buildSourceFile(edition, manifest, records, anchorRecords),
        excluded: false,
        count: records.length,
      };
    }),
  );

  results.forEach((result, index) => {
    const manifest = targets[index];
    const edition = editions.find((entry) => entry.slug === manifest.editionSlug)!;
    if (result.status === "fulfilled") {
      if (result.value.excluded) {
        statuses.push({
          editionSlug: edition.slug,
          label: edition.translator ?? edition.editionTitle,
          state: "excluded",
          stanzaCount: 0,
          message: "Excluded because commercial mode is enabled and this license is noncommercial.",
        });
      } else if (result.value.file) {
        loaded.set(edition.slug, result.value.file);
        statuses.push({
          editionSlug: edition.slug,
          label: edition.translator ?? edition.editionTitle,
          state: "loaded",
          stanzaCount: result.value.count,
          message:
            edition.slug === "pettit-2023"
              ? "Official CC BY-NC 4.0 dual-language edition loaded with required attribution."
              : "Complete edition loaded and aligned while preserving printed numbering.",
        });
      }
    } else {
      statuses.push({
        editionSlug: edition.slug,
        label: edition.translator ?? edition.editionTitle,
        state: "unavailable",
        stanzaCount: 0,
        message: result.reason instanceof Error ? result.reason.message : "Source could not be loaded.",
      });
    }
  });

  return {
    passages: combineSourceFiles([...loaded.values()]),
    statuses,
    generatedAt: new Date().toISOString(),
  };
}

export async function getCompleteCorpus(options?: { force?: boolean }) {
  const now = Date.now();
  if (!options?.force && memoryCache && memoryCache.expiresAt > now) return memoryCache.value;
  if (!options?.force && pending) return pending;
  pending = loadCorpusFresh()
    .then((value) => {
      memoryCache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      return value;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

export async function getCompletePassage(slug: string) {
  const corpus = await getCompleteCorpus();
  return corpus.passages.find((passage) => passage.slug === slug);
}
