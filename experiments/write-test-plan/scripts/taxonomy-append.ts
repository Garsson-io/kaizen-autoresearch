#!/usr/bin/env npx tsx
/**
 * taxonomy-append.ts — Auto-route taxonomy-lines output to the right taxonomy files.
 *
 * Takes the output of `extract-thinking.ts --taxonomy-lines` (via stdin or --input)
 * and appends each line to the taxonomy file whose `confusion_pair` frontmatter
 * matches the line's confusion pair. Lines with no matching file are collected
 * for review (potential new patterns).
 *
 * Usage:
 *   npx tsx scripts/extract-thinking.ts --run-dir latest --taxonomy-lines | \
 *     npx tsx scripts/taxonomy-append.ts --run N
 *
 *   # Or with explicit input file:
 *   npx tsx scripts/taxonomy-append.ts --run 8 --input /tmp/lines.txt
 *
 * The --run flag sets the [runN] label; auto-detect if omitted (counts existing entries).
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { PATHS } from "./paths.js";

interface TaxonomyFile {
  path: string;
  confusionPairs: string[];  // e.g. ["Integration-Agentic", "Unit-Agentic"]
  direction: string;         // "under" | "over"
  id: string;
}

// ─── Load taxonomy files and parse frontmatter ────────────────────────────────

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
    if (!name.endsWith(".md") || name === "README.md") continue;
    const path = join(dir, name);
    const content = readFileSync(path, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm.confusion_pair) continue;

    // confusion_pair can be "Integration-Agentic" or multiple "U1, U2" — use it directly
    const pairs = fm.confusion_pair.split(",").map(p => p.trim());
    files.push({ path, confusionPairs: pairs, direction: fm.direction ?? "", id: fm.id ?? name });
  }
  return files;
}

// ─── Count existing run labels to auto-detect run number ─────────────────────

function detectRunNumber(taxFiles: TaxonomyFile[]): number {
  let max = 0;
  for (const f of taxFiles) {
    const content = readFileSync(f.path, "utf8");
    for (const m of content.matchAll(/\[run(\d+)\]/g)) {
      max = Math.max(max, parseInt(m[1], 10));
    }
  }
  return max + 1;
}

// ─── Parse a taxonomy line ────────────────────────────────────────────────────

interface TaxonomyLine {
  raw: string;
  confusionPair: string | null; // "Integration-Agentic"
  isSelfAware: boolean;
}

function parseLine(line: string): TaxonomyLine {
  // Format: [runN] TASK bN (Pred→GT): "justification"
  // or:     [runN] TASK bN THINKING: ⚠ SELF-AWARE "..."
  const pairMatch = line.match(/\((\w+)→(\w+)\)/);
  if (!pairMatch) return { raw: line, confusionPair: null, isSelfAware: false };
  const pair = `${pairMatch[1]}-${pairMatch[2]}`;
  const isSelfAware = line.includes("SELF-AWARE") || line.includes("THINKING:");
  return { raw: line, confusionPair: pair, isSelfAware };
}

// ─── Match a confusion pair to taxonomy files ─────────────────────────────────

function matchFiles(pair: string, taxFiles: TaxonomyFile[]): TaxonomyFile[] {
  return taxFiles.filter(f => f.confusionPairs.some(p => p === pair));
}

// ─── Append lines to a file (avoiding exact duplicates) ──────────────────────

function appendLines(filePath: string, lines: string[]): number {
  const existing = readFileSync(filePath, "utf8");
  const toAdd = lines.filter(l => !existing.includes(l.trim()));
  if (toAdd.length === 0) return 0;
  const newline = existing.endsWith("\n") ? "" : "\n";
  writeFileSync(filePath, existing + newline + toAdd.join("\n") + "\n", "utf8");
  return toAdd.length;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const runArg = args.includes("--run") ? parseInt(args[args.indexOf("--run") + 1] ?? "0", 10) : null;
  const inputArg = args.includes("--input") ? args[args.indexOf("--input") + 1] : null;
  const dryRun = args.includes("--dry-run");

  // Read input lines
  let rawInput: string;
  if (inputArg) {
    rawInput = readFileSync(inputArg, "utf8");
  } else {
    // Read from stdin
    try {
      rawInput = readFileSync("/dev/stdin", "utf8");
    } catch {
      console.error("No input: pipe from extract-thinking --taxonomy-lines or use --input <file>");
      process.exit(1);
    }
  }

  const inputLines = rawInput.split("\n").filter(l => l.trim() && l.match(/^\[run/));

  const taxFiles = loadTaxonomyFiles();
  const runN = runArg ?? detectRunNumber(taxFiles);

  // Re-label lines with the correct run number
  const relabeled = inputLines.map(l => l.replace(/^\[run\S+\]/, `[run${runN}]`));

  // Route lines to files
  const matched = new Map<string, string[]>(); // filePath → lines
  const unmatched: TaxonomyLine[] = [];

  for (const line of relabeled) {
    const parsed = parseLine(line);
    if (!parsed.confusionPair) continue;
    const files = matchFiles(parsed.confusionPair, taxFiles);
    if (files.length === 0) {
      unmatched.push({ ...parsed, raw: line });
    } else {
      for (const f of files) {
        if (!matched.has(f.path)) matched.set(f.path, []);
        matched.get(f.path)!.push(line);
      }
    }
  }

  // Append to files
  let totalAppended = 0;
  for (const [filePath, lines] of matched) {
    const fname = filePath.split("/").pop()!;
    if (dryRun) {
      console.log(`[dry-run] Would append ${lines.length} lines to ${fname}`);
      for (const l of lines) console.log(`  ${l.slice(0, 100)}`);
    } else {
      const added = appendLines(filePath, lines);
      if (added > 0) {
        console.log(`  ✓ ${fname}: +${added} lines`);
        totalAppended += added;
      }
    }
  }

  if (unmatched.length > 0) {
    console.log(`\nUNMATCHED (no taxonomy file for these confusion pairs — consider new patterns):`);
    const byPair = new Map<string, number>();
    for (const u of unmatched) {
      byPair.set(u.confusionPair!, (byPair.get(u.confusionPair!) ?? 0) + 1);
    }
    for (const [pair, count] of [...byPair.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${pair}: ${count} lines`);
    }
    for (const u of unmatched.slice(0, 3)) {
      console.log(`  Example: ${u.raw.slice(0, 120)}`);
    }
  }

  if (!dryRun && totalAppended > 0) {
    console.log(`\nAppended ${totalAppended} lines across ${matched.size} taxonomy files (run${runN})`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
