#!/usr/bin/env npx tsx
/**
 * taxonomy-append.ts — Route taxonomy-lines output to taxonomy files, persist unmatched,
 * and support retroactive re-routing when new taxonomy files are added.
 *
 * NEW: Input is block-based (multi-line entries from extract-thinking --taxonomy-lines).
 * Each block: first line is the routing key "[runN] TASK bN (Pred→GT) [w=W]",
 * followed by indented "  J: ..." and "  T: ..." lines. Full text, no truncation.
 * Old single-line format is still accepted (treated as a one-line block).
 *
 * Unmatched blocks are persisted to taxonomy/unmatched.md (append-only).
 * Run --reprocess-unmatched after adding new taxonomy files to backfill history.
 *
 * Usage:
 *   # Append current run's errors to taxonomy files
 *   npx tsx scripts/extract-thinking.ts --run-dir latest --taxonomy-lines | \
 *     npx tsx scripts/taxonomy-append.ts [--run N]
 *
 *   # Re-route historical unmatched after adding/updating taxonomy files
 *   npx tsx scripts/taxonomy-append.ts --reprocess-unmatched
 *
 *   # Show cumulative confusion pair counts across all taxonomy files + unmatched.md
 *   npx tsx scripts/taxonomy-append.ts --summary
 *
 *   # Preview without writing
 *   ... | npx tsx scripts/taxonomy-append.ts --dry-run
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { PATHS } from "./paths.js";

const UNMATCHED_PATH = join(PATHS.taxonomy, "unmatched.md");

const UNMATCHED_HEADER = `---
confusion_pair: "(unmatched — no taxonomy file for these pairs yet)"
note: "Auto-accumulated unmatched taxonomy lines. After creating new taxonomy files or updating confusion_pair lists, run: npx tsx experiments/write-test-plan/scripts/taxonomy-append.ts --reprocess-unmatched"
---

`;

// Schema for a taxonomy routing-key line.
// Format: "[run7] EC-10 b4 (Integration→Agentic) [w=4] ⚠SELF-AWARE"
// Lines without the (Pred→GT) pair are not routing keys and will fail parsing.
const RoutingKeySchema = z.string().transform((line, ctx) => {
  const m = line.match(/^\[run(\S+)\] (\S+) b(\d+) \((\w+)→(\w+)\)/);
  if (!m) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Not a routing key line" });
    return z.NEVER;
  }
  const wMatch = line.match(/\[w=(\d+)\]/);
  return {
    run: m[1],
    task: m[2],
    behavior: parseInt(m[3]),
    pred: m[4],
    gt: m[5],
    pair: `${m[4]}-${m[5]}`,
    weight: wMatch ? parseInt(wMatch[1]) : null,
    selfAware: line.includes("⚠SELF-AWARE") || line.includes("SELF-AWARE"),
  };
});
type RoutingKey = z.output<typeof RoutingKeySchema>;

// Schema for taxonomy file frontmatter. confusion_pair and id are required for routing.
const TaxonomyFrontmatterSchema = z.object({
  id: z.string(),
  confusion_pair: z.string(),
  direction: z.enum(["under", "over"]).optional(),
}).passthrough();

interface TaxonomyFile {
  path: string;
  confusionPairs: string[];
  direction: string;
  id: string;
}

interface Block {
  lines: string[];      // first line is routing key, rest are indented context
  key: string;          // first line (used for dedup check)
  confusionPair: string | null;
  isSelfAware: boolean;
}

// ─── Load taxonomy files ──────────────────────────────────────────────────────

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

function loadTaxonomyFiles(): TaxonomyFile[] {
  const files: TaxonomyFile[] = [];
  const dir = PATHS.taxonomy;
  if (!existsSync(dir)) return files;

  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md") || name === "README.md" || name === "unmatched.md") continue;
    const path = join(dir, name);
    const content = readFileSync(path, "utf8");
    const raw = parseFrontmatter(content);
    // Files without confusion_pair are not routing targets (e.g. C1, gt-review) — skip silently.
    if (!raw.confusion_pair) continue;
    const result = TaxonomyFrontmatterSchema.safeParse(raw);
    if (!result.success) {
      console.warn(`Skipping ${name}: invalid frontmatter — ${result.error.issues.map(i => i.message).join(", ")}`);
      continue;
    }
    const fm = result.data;
    const pairs = fm.confusion_pair.split(",").map(p => p.trim());
    files.push({ path, confusionPairs: pairs, direction: fm.direction ?? "", id: fm.id });
  }
  return files;
}

// ─── Detect run number ────────────────────────────────────────────────────────

function detectRunNumber(taxFiles: TaxonomyFile[]): number {
  let max = 0;
  const allPaths = taxFiles.map(f => f.path);
  if (existsSync(UNMATCHED_PATH)) allPaths.push(UNMATCHED_PATH);
  for (const path of allPaths) {
    const content = readFileSync(path, "utf8");
    for (const m of content.matchAll(/\[run(\d+)\]/g)) {
      max = Math.max(max, parseInt(m[1], 10));
    }
  }
  return max + 1;
}

// ─── Parse input into blocks ──────────────────────────────────────────────────
//
// New format (multi-line block):
//   [run-HHMMSS] EC-10 b4 (Integration→Agentic) [w=4]
//     J: "full justification text"
//     T: "full thinking text"
//   <blank line>
//
// Old format (single line, backwards compatible):
//   [run5] EC-10 b4 (Integration→Agentic): "truncated..."

function parseConfusionPair(line: string): string | null {
  const result = RoutingKeySchema.safeParse(line);
  return result.success ? result.data.pair : null;
}

function parseBlocks(rawInput: string): Block[] {
  const blocks: Block[] = [];

  // Split on blank lines → each group is a potential block
  const groups = rawInput.split(/\n[ \t]*\n/);

  for (const group of groups) {
    const lines = group.split("\n").filter(l => l !== "");
    if (!lines.length) continue;

    // Find the first [run...] line (routing key)
    const keyIdx = lines.findIndex(l => /^\[run/.test(l));
    if (keyIdx < 0) continue;

    const keyLine = lines[keyIdx];
    const block: Block = {
      lines: lines.slice(keyIdx),  // key + any following indented lines
      key: keyLine,
      confusionPair: parseConfusionPair(keyLine),
      isSelfAware: keyLine.includes("⚠SELF-AWARE") || keyLine.includes("SELF-AWARE"),
    };
    blocks.push(block);
  }

  return blocks;
}

// ─── Relabel run number in block ──────────────────────────────────────────────

function relabelBlock(block: Block, runN: number): Block {
  const newLines = [...block.lines];
  newLines[0] = newLines[0].replace(/^\[run\S+\]/, `[run${runN}]`);
  return { ...block, lines: newLines, key: newLines[0] };
}

// ─── Match confusion pair to taxonomy files ───────────────────────────────────

function matchFiles(pair: string, taxFiles: TaxonomyFile[]): TaxonomyFile[] {
  return taxFiles.filter(f => f.confusionPairs.some(p => p === pair));
}

// ─── Append blocks to a taxonomy file (dedup by key line) ────────────────────

function appendBlocks(filePath: string, blocks: Block[]): number {
  const existing = readFileSync(filePath, "utf8");
  const toAdd = blocks.filter(b => {
    if (existing.includes(b.key.trim())) return false;
    // Validate routing key line against schema before writing
    const validation = RoutingKeySchema.safeParse(b.key);
    if (!validation.success) {
      console.warn(`Skipping invalid routing key: ${b.key.slice(0, 80)}`);
      return false;
    }
    return true;
  });
  if (toAdd.length === 0) return 0;
  const sep = existing.endsWith("\n") ? "" : "\n";
  const newContent = toAdd.map(b => b.lines.join("\n")).join("\n\n");
  writeFileSync(filePath, existing + sep + newContent + "\n\n", "utf8");
  return toAdd.length;
}

// ─── Persist unmatched blocks to unmatched.md ────────────────────────────────

function persistUnmatched(blocks: Block[]): number {
  if (blocks.length === 0) return 0;
  if (!existsSync(UNMATCHED_PATH)) {
    writeFileSync(UNMATCHED_PATH, UNMATCHED_HEADER, "utf8");
  }
  return appendBlocks(UNMATCHED_PATH, blocks);
}

// ─── Read blocks from a file (for reprocessing) ──────────────────────────────

function readBlocksFromFile(filePath: string): Block[] {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, "utf8");
  // Skip frontmatter
  const body = content.replace(/^---[\s\S]*?---\n/, "");
  return parseBlocks(body);
}

// ─── --reprocess-unmatched ───────────────────────────────────────────────────
//
// Re-routes all blocks in unmatched.md against the current taxonomy files.
// Matched blocks are appended to the correct taxonomy files.
// Unmatched blocks remain in unmatched.md (rewritten in place).

function reprocessUnmatched(taxFiles: TaxonomyFile[], dryRun: boolean): void {
  if (!existsSync(UNMATCHED_PATH)) {
    console.log("No unmatched.md found — nothing to reprocess.");
    return;
  }

  const blocks = readBlocksFromFile(UNMATCHED_PATH);
  if (blocks.length === 0) {
    console.log("unmatched.md is empty — nothing to reprocess.");
    return;
  }

  console.log(`Reprocessing ${blocks.length} blocks from unmatched.md...\n`);

  const matched = new Map<string, Block[]>();
  const stillUnmatched: Block[] = [];

  for (const block of blocks) {
    if (!block.confusionPair) { stillUnmatched.push(block); continue; }
    const files = matchFiles(block.confusionPair, taxFiles);
    if (files.length === 0) {
      stillUnmatched.push(block);
    } else {
      for (const f of files) {
        if (!matched.has(f.path)) matched.set(f.path, []);
        matched.get(f.path)!.push(block);
      }
    }
  }

  let totalMoved = 0;
  for (const [filePath, fileBlocks] of matched) {
    const fname = filePath.split("/").pop()!;
    if (dryRun) {
      console.log(`[dry-run] Would move ${fileBlocks.length} blocks → ${fname}`);
      for (const b of fileBlocks) console.log(`  ${b.key.slice(0, 100)}`);
    } else {
      const added = appendBlocks(filePath, fileBlocks);
      if (added > 0) {
        console.log(`  ✓ ${fname}: +${added} blocks from unmatched`);
        totalMoved += added;
      }
    }
  }

  if (!dryRun && totalMoved > 0) {
    // Rewrite unmatched.md with only the still-unmatched blocks
    const header = readFileSync(UNMATCHED_PATH, "utf8").match(/^---[\s\S]*?---\n/)?.[0] ?? UNMATCHED_HEADER;
    const newBody = stillUnmatched.length > 0
      ? stillUnmatched.map(b => b.lines.join("\n")).join("\n\n") + "\n"
      : "";
    writeFileSync(UNMATCHED_PATH, header + "\n" + newBody, "utf8");
    console.log(`\nMoved ${totalMoved} blocks → taxonomy files.`);
    console.log(`${stillUnmatched.length} blocks remain in unmatched.md.`);
  } else if (!dryRun) {
    console.log("No blocks matched current taxonomy files.");
  }
}

// ─── --summary ───────────────────────────────────────────────────────────────
//
// Scans all taxonomy files + unmatched.md, counts occurrences per confusion pair.
// Shows which pairs have enough history to warrant new taxonomy files.

function parseRoutingKeys(content: string): RoutingKey[] {
  const keys: RoutingKey[] = [];
  for (const line of content.split("\n")) {
    const result = RoutingKeySchema.safeParse(line);
    if (result.success) keys.push(result.data);
  }
  return keys;
}

function printSummary(taxFiles: TaxonomyFile[]): void {
  // Count matched (in taxonomy files) — parse each line via RoutingKeySchema
  const matchedCounts = new Map<string, Map<string, number>>();  // pair → (file → count)
  for (const f of taxFiles) {
    const content = readFileSync(f.path, "utf8");
    const fname = f.id.replace(/\.md$/, "");
    for (const rk of parseRoutingKeys(content)) {
      if (!matchedCounts.has(rk.pair)) matchedCounts.set(rk.pair, new Map());
      matchedCounts.get(rk.pair)!.set(fname, (matchedCounts.get(rk.pair)!.get(fname) ?? 0) + 1);
    }
  }

  // Count unmatched (in unmatched.md)
  const unmatchedCounts = new Map<string, number>();
  const unmatchedRuns = new Map<string, Set<string>>();
  if (existsSync(UNMATCHED_PATH)) {
    const content = readFileSync(UNMATCHED_PATH, "utf8");
    for (const rk of parseRoutingKeys(content)) {
      unmatchedCounts.set(rk.pair, (unmatchedCounts.get(rk.pair) ?? 0) + 1);
      if (!unmatchedRuns.has(rk.pair)) unmatchedRuns.set(rk.pair, new Set());
      unmatchedRuns.get(rk.pair)!.add(rk.run);
    }
  }

  console.log("\nTAXONOMY SUMMARY — confusion pairs across all runs\n");

  if (matchedCounts.size > 0) {
    console.log("  MATCHED (in taxonomy files):");
    const sorted = [...matchedCounts.entries()].sort((a, b) => {
      const ta = [...a[1].values()].reduce((s, v) => s + v, 0);
      const tb = [...b[1].values()].reduce((s, v) => s + v, 0);
      return tb - ta;
    });
    for (const [pair, fileCounts] of sorted) {
      const total = [...fileCounts.values()].reduce((s, v) => s + v, 0);
      const breakdown = [...fileCounts.entries()].map(([f, c]) => `${f}:${c}`).join(", ");
      console.log(`    ${pair.padEnd(28)} ${String(total).padStart(3)} lines  (${breakdown})`);
    }
  }

  if (unmatchedCounts.size > 0) {
    console.log("\n  UNMATCHED (in unmatched.md):");
    const sorted = [...unmatchedCounts.entries()].sort((a, b) => b[1] - a[1]);
    for (const [pair, count] of sorted) {
      const runs = [...(unmatchedRuns.get(pair) ?? [])].sort((a, b) => parseInt(a) - parseInt(b)).join(",");
      const flag = count >= 3 ? "  ← consider new category" : "";
      console.log(`    ${pair.padEnd(28)} ${String(count).padStart(3)} lines  runs:[${runs}]${flag}`);
    }
    const needsCategory = [...unmatchedCounts.entries()].filter(([, c]) => c >= 3);
    if (needsCategory.length > 0) {
      console.log(`\n  → ${needsCategory.length} pair(s) ≥3 unmatched occurrences.`);
      console.log(`    Cognitive step: read those entries in unmatched.md, decide if they fit`);
      console.log(`    an existing pattern (update confusion_pair list) or need a new file,`);
      console.log(`    then run: npx tsx scripts/taxonomy-append.ts --reprocess-unmatched`);
    }
  } else {
    console.log("\n  UNMATCHED: (none)");
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const runArg = args.includes("--run") ? parseInt(args[args.indexOf("--run") + 1] ?? "0", 10) : null;
  const inputArg = args.includes("--input") ? args[args.indexOf("--input") + 1] : null;
  const dryRun = args.includes("--dry-run");
  const reprocess = args.includes("--reprocess-unmatched");
  const summary = args.includes("--summary");

  const taxFiles = loadTaxonomyFiles();

  if (summary) {
    printSummary(taxFiles);
    return;
  }

  if (reprocess) {
    reprocessUnmatched(taxFiles, dryRun);
    return;
  }

  // Read input blocks
  let rawInput: string;
  if (inputArg) {
    rawInput = readFileSync(inputArg, "utf8");
  } else {
    try {
      rawInput = readFileSync("/dev/stdin", "utf8");
    } catch {
      console.error("No input: pipe from extract-thinking --taxonomy-lines or use --input <file>");
      process.exit(1);
    }
  }

  const blocks = parseBlocks(rawInput);
  if (blocks.length === 0) {
    console.error("No blocks parsed from input. Expected lines starting with [run...].");
    process.exit(1);
  }

  const runN = runArg ?? detectRunNumber(taxFiles);

  // Relabel blocks with correct run number
  const relabeled = blocks.map(b => relabelBlock(b, runN));

  // Route blocks
  const matchedBlocks = new Map<string, Block[]>();
  const unmatchedBlocks: Block[] = [];

  for (const block of relabeled) {
    if (!block.confusionPair) continue;
    const files = matchFiles(block.confusionPair, taxFiles);
    if (files.length === 0) {
      unmatchedBlocks.push(block);
    } else {
      for (const f of files) {
        if (!matchedBlocks.has(f.path)) matchedBlocks.set(f.path, []);
        matchedBlocks.get(f.path)!.push(block);
      }
    }
  }

  // Append matched blocks to taxonomy files
  let totalAppended = 0;
  for (const [filePath, fileBlocks] of matchedBlocks) {
    const fname = filePath.split("/").pop()!;
    if (dryRun) {
      console.log(`[dry-run] Would append ${fileBlocks.length} blocks to ${fname}`);
      for (const b of fileBlocks) console.log(`  ${b.key.slice(0, 100)}`);
    } else {
      const added = appendBlocks(filePath, fileBlocks);
      if (added > 0) {
        console.log(`  ✓ ${fname}: +${added} blocks`);
        totalAppended += added;
      }
    }
  }

  // Persist unmatched blocks to unmatched.md
  if (unmatchedBlocks.length > 0) {
    const byPair = new Map<string, number>();
    for (const b of unmatchedBlocks) {
      byPair.set(b.confusionPair!, (byPair.get(b.confusionPair!) ?? 0) + 1);
    }

    if (dryRun) {
      console.log(`\nUNMATCHED (would append ${unmatchedBlocks.length} blocks to unmatched.md):`);
      for (const [pair, count] of [...byPair.entries()].sort((a, b) => b[1] - a[1])) {
        console.log(`  ${pair}: ${count} blocks`);
      }
    } else {
      const added = persistUnmatched(unmatchedBlocks);
      if (added > 0) {
        console.log(`  ✓ unmatched.md: +${added} blocks (no taxonomy file for these pairs)`);
        console.log(`    Pairs: ${[...byPair.entries()].map(([p, c]) => `${p}:${c}`).join(", ")}`);
        console.log(`    Run 'npx tsx scripts/taxonomy-append.ts --summary' to see cumulative unmatched counts`);
      }
    }
  }

  if (!dryRun && totalAppended > 0) {
    console.log(`\nAppended ${totalAppended} blocks across ${matchedBlocks.size} taxonomy files (run${runN})`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
