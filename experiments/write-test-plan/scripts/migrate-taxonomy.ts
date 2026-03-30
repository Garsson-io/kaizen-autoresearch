#!/usr/bin/env npx tsx
/**
 * migrate-taxonomy.ts — One-time migration of all taxonomy entries to JSONL format.
 *
 * Reads every [UO]*.md taxonomy file + unmatched.md, parses ALL legacy entry formats:
 *   - JSONL lines (already correct)
 *   - Block format:   [runN] EC-NN bN (Pred→GT) [w=W]\n  J: "..."\n  T: "..."
 *   - Medium format:  [runN] EC-NN bN (Pred→GT): "justification"
 *   - Very-old pair:  EC-NN bN (Pred→GT): "justification"
 *   - Very-old bare:  EC-NN bN: "justification"   (pred/gt from file frontmatter)
 *   - Annotation:     [runN] EC-NN bN THINKING: ...  → DROPPED (not an entry)
 *
 * After parsing, validates every entry with TaxonomyEntrySchema, then rewrites
 * the file as: frontmatter + blank line + one JSONL entry per line.
 *
 * Run once. Verify counts match. Commit. Delete this script.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { PATHS } from "./paths.js";
import {
  TaxonomyEntrySchema,
  type TaxonomyEntry,
  LEVEL_WEIGHTS,
  serializeEntry,
  parseEntryLine,
} from "./taxonomy-schema.js";

type Level = keyof typeof LEVEL_WEIGHTS;
const LEVELS = Object.keys(LEVEL_WEIGHTS) as Level[];

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) result[key.trim()] = rest.join(":").trim().replace(/^"(.*)"$/, "$1");
  }
  return result;
}

function extractFrontmatterBlock(content: string): string {
  const match = content.match(/^(---\n[\s\S]*?\n---\n)/);
  return match ? match[1] : "";
}

function weightFor(gt: string): number {
  return (LEVEL_WEIGHTS as Record<string, number>)[gt] ?? 1;
}

// Extract quoted content from the justification portion of a line.
// Handles:   "text with "inner quotes" inside"
// Strategy: strip leading `"` and trailing `"` if present.
function extractQuoted(raw: string): string {
  const trimmed = raw.trim();
  const inner = trimmed.startsWith('"') ? trimmed.slice(1) : trimmed;
  // Strip trailing " if present (and not preceded by content that ends with ")
  return inner.endsWith('"') ? inner.slice(0, -1) : inner;
}

// Extract pred/gt from "(Pred→GT)" anywhere in a line. Returns null if not found.
function extractPair(line: string): { pred: string; gt: string } | null {
  const m = line.match(/\((\w+)→(\w+)\)/);
  if (!m) return null;
  if (!LEVELS.includes(m[1] as Level) || !LEVELS.includes(m[2] as Level)) return null;
  return { pred: m[1], gt: m[2] };
}

interface ParsedFile {
  path: string;
  name: string;
  frontmatter: string;
  filePred: string;
  fileGt: string;
  entries: TaxonomyEntry[];
  dropped: string[];
  invalid: string[];
}

function parseFile(filePath: string): ParsedFile {
  const name = filePath.split("/").pop()!;
  const content = readFileSync(filePath, "utf8");
  const fm = parseFrontmatter(content);
  const frontmatter = extractFrontmatterBlock(content);

  // Primary confusion pair from frontmatter (use first if multiple)
  const primaryPair = (fm.confusion_pair ?? "").split(",")[0].trim();
  const pairMatch = primaryPair.match(/^(\w+)-(\w+)$/);
  const filePred = pairMatch?.[1] ?? "";
  const fileGt = pairMatch?.[2] ?? "";

  const body = content.replace(/^---\n[\s\S]*?\n---\n/, "");
  const lines = body.split("\n");

  const entries: TaxonomyEntry[] = [];
  const dropped: string[] = [];
  const invalid: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) { i++; continue; }

    // Already JSONL
    if (trimmed.startsWith("{")) {
      const entry = parseEntryLine(trimmed);
      if (entry) {
        entries.push(entry);
      } else {
        invalid.push(`JSONL parse failed: ${trimmed.slice(0, 80)}`);
      }
      i++; continue;
    }

    // Annotation lines: [runN] EC-NN bN THINKING: or NOTE: — drop silently
    if (/^\[run\S+\] \S+ b\d+ (THINKING|NOTE):/.test(line)) {
      dropped.push(`annotation: ${line.slice(0, 80)}`);
      i++; continue;
    }

    // Block format: [runN] EC-NN bN (Pred→GT) [w=N]  (no colon directly after pair)
    const blockKeyMatch = line.match(/^\[run(\S+)\] (\S+) b(\d+) \((\w+)→(\w+)\) \[w=(\d+)\](.*)/);
    if (blockKeyMatch) {
      const run = blockKeyMatch[1];
      const task = blockKeyMatch[2];
      const b = parseInt(blockKeyMatch[3]);
      const pred = blockKeyMatch[4];
      const gt = blockKeyMatch[5];
      const w = parseInt(blockKeyMatch[6]);
      const saFlag = blockKeyMatch[7].includes("SELF-AWARE");

      let justification = "";
      let thinking: string | undefined;

      // Collect indented J: and T: lines
      i++;
      while (i < lines.length && (lines[i].startsWith("  ") || lines[i] === "")) {
        const inner = lines[i];
        if (inner.trimStart().startsWith("J: ")) {
          justification = extractQuoted(inner.trimStart().slice(3));
        } else if (inner.trimStart().startsWith("T: ")) {
          thinking = extractQuoted(inner.trimStart().slice(3));
        }
        i++;
      }

      if (!justification) { invalid.push(`block missing J: — ${line.slice(0, 60)}`); continue; }

      const raw: Record<string, unknown> = { run, task, b, pred, gt, w, j: justification };
      if (thinking) raw.t = thinking;
      if (saFlag) raw.sa = true;
      const result = TaxonomyEntrySchema.safeParse(raw);
      if (result.success) {
        entries.push(result.data);
      } else {
        invalid.push(`block invalid: ${line.slice(0, 60)} — ${result.error.issues.map(x => x.message).join(", ")}`);
      }
      continue;
    }

    // Medium format: [runN] EC-NN bN (Pred→GT): "justification"
    const mediumMatch = line.match(/^\[run(\S+)\] (\S+) b(\d+) \((\w+)→(\w+)\): (.*)/);
    if (mediumMatch) {
      const run = mediumMatch[1];
      const task = mediumMatch[2];
      const b = parseInt(mediumMatch[3]);
      const pred = mediumMatch[4];
      const gt = mediumMatch[5];
      const w = weightFor(gt);
      const justification = extractQuoted(mediumMatch[6]);

      const result = TaxonomyEntrySchema.safeParse({ run, task, b, pred, gt, w, j: justification });
      if (result.success) {
        entries.push(result.data);
      } else {
        invalid.push(`medium invalid: ${line.slice(0, 60)} — ${result.error.issues.map(x => x.message).join(", ")}`);
      }
      i++; continue;
    }

    // Very-old formats: no [run...] prefix
    // Very-old with pair: "EC-07 b4 (System→Workflow): "justification""
    // Very-old bare:      "EC-01 b3: "justification" — comment"
    if (/^EC-/.test(trimmed)) {
      const pair = extractPair(trimmed) ?? (filePred && fileGt ? { pred: filePred, gt: fileGt } : null);
      if (!pair) { dropped.push(`very-old no pair (and no file pair): ${trimmed.slice(0, 60)}`); i++; continue; }

      // Extract justification: quoted portion before " — comment"
      const colonIdx = trimmed.indexOf('): "') >= 0
        ? trimmed.indexOf('): "') + 3
        : trimmed.indexOf(': "') >= 0 ? trimmed.indexOf(': "') + 2 : -1;

      let justification = "";
      if (colonIdx >= 0) {
        const rest = trimmed.slice(colonIdx);
        const quoted = extractQuoted(rest);
        // Strip trailing " — comment" style annotations
        justification = quoted.replace(/\s+—\s+.*$/, "").trim();
        if (justification.endsWith('"')) justification = justification.slice(0, -1).trim();
      }

      if (!justification) { dropped.push(`very-old empty justification: ${trimmed.slice(0, 60)}`); i++; continue; }

      const result = TaxonomyEntrySchema.safeParse({
        run: "pre-schema",
        task: trimmed.match(/^(EC-\S+)/)?.[1] ?? "",
        b: parseInt(trimmed.match(/b(\d+)/)?.[1] ?? "0"),
        pred: pair.pred,
        gt: pair.gt,
        w: weightFor(pair.gt),
        j: justification,
      });
      if (result.success) {
        entries.push(result.data);
      } else {
        invalid.push(`very-old invalid: ${trimmed.slice(0, 60)} — ${result.error.issues.map(x => x.message).join(", ")}`);
      }
      i++; continue;
    }

    // Anything else: drop
    dropped.push(`unrecognized: ${trimmed.slice(0, 60)}`);
    i++;
  }

  return { path: filePath, name, frontmatter, filePred, fileGt, entries, dropped, invalid };
}

function rewriteFile(parsed: ParsedFile, dryRun: boolean): void {
  const body = parsed.entries.map(e => serializeEntry(e)).join("\n");
  const newContent = parsed.frontmatter + body + "\n";
  if (!dryRun) {
    writeFileSync(parsed.path, newContent, "utf8");
  }
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const dir = PATHS.taxonomy;

  const filesToMigrate: string[] = [];

  // Taxonomy files [UO]*.md
  for (const name of readdirSync(dir).sort()) {
    if (!/^[UO]\d+.*\.md$/.test(name)) continue;
    filesToMigrate.push(join(dir, name));
  }
  // unmatched.md
  const unmatchedPath = join(dir, "unmatched.md");
  if (existsSync(unmatchedPath)) filesToMigrate.push(unmatchedPath);

  let totalEntries = 0;
  let totalDropped = 0;
  let totalInvalid = 0;

  console.log(dryRun ? "\n=== DRY RUN ===" : "\n=== MIGRATING ===");

  for (const filePath of filesToMigrate) {
    const parsed = parseFile(filePath);
    console.log(`\n${parsed.name}:`);
    console.log(`  entries: ${parsed.entries.length}`);

    // Breakdown by run
    const byRun = new Map<string, number>();
    for (const e of parsed.entries) byRun.set(e.run, (byRun.get(e.run) ?? 0) + 1);
    for (const [run, count] of [...byRun.entries()].sort()) {
      console.log(`    run=${run}: ${count}`);
    }

    if (parsed.dropped.length > 0) {
      console.log(`  dropped: ${parsed.dropped.length}`);
      for (const d of parsed.dropped) console.log(`    - ${d}`);
    }
    if (parsed.invalid.length > 0) {
      console.log(`  INVALID (not migrated): ${parsed.invalid.length}`);
      for (const v of parsed.invalid) console.log(`    ✗ ${v}`);
    }

    totalEntries += parsed.entries.length;
    totalDropped += parsed.dropped.length;
    totalInvalid += parsed.invalid.length;

    rewriteFile(parsed, dryRun);
  }

  console.log(`\n=== TOTALS ===`);
  console.log(`  entries migrated: ${totalEntries}`);
  console.log(`  lines dropped:    ${totalDropped}`);
  console.log(`  invalid (skipped): ${totalInvalid}`);

  if (dryRun) {
    console.log("\n  Run without --dry-run to apply.");
  } else {
    console.log("\n  Done. Verify with: npx tsx scripts/taxonomy-append.ts --summary");
    console.log("  Then: git diff taxonomy/");
  }
}

main();
