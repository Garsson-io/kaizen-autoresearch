#!/usr/bin/env npx tsx
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { Command } from "commander";
import { ExploreResult } from "../src/schema.js";
import { PATHS } from "./paths.js";

type Row = ReturnType<typeof ExploreResult.parse>;

function keyOf(r: Row): string {
  return `${r.timestamp}::${r.idea_id}`;
}

function main() {
  const program = new Command();
  program
    .option("--write", "write changes in place (default: dry-run)", false)
    .parse(process.argv);
  const opts = program.opts<{ write?: boolean }>();

  if (!existsSync(PATHS.exploreLog)) {
    console.error(`Missing file: ${PATHS.exploreLog}`);
    process.exit(1);
  }

  const raw = readFileSync(PATHS.exploreLog, "utf-8");
  const lines = raw.split("\n").filter(l => l.trim().length > 0);
  const rows = lines.map((l, i) => {
    try {
      return ExploreResult.parse(JSON.parse(l));
    } catch (err) {
      throw new Error(`Line ${i + 1} parse error: ${(err as Error).message}`);
    }
  });

  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const k = keyOf(r);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  }

  let touched = 0;
  let setSelectCount = 0;
  let setNoSignal = 0;
  let inconsistent = 0;

  for (const [, group] of groups) {
    const winners = group.filter(r => r.winner);
    const hasWinner = winners.length > 0;
    if (winners.length > 1) {
      inconsistent += 1;
    }

    for (const r of group) {
      let changed = false;

      if (r.select_count === undefined) {
        r.select_count = r.tasks.length;
        setSelectCount += 1;
        changed = true;
      }

      // Safe deterministic backfill: only infer no-signal when there is no winner in batch.
      if (!hasWinner && r.signal === undefined) {
        r.signal = "no-signal";
        setNoSignal += 1;
        changed = true;
      }

      if (changed) touched += 1;
    }
  }

  const updated = rows.map(r => JSON.stringify(r)).join("\n") + "\n";

  console.log(`Rows: ${rows.length}`);
  console.log(`Groups: ${groups.size}`);
  console.log(`Touched rows: ${touched}`);
  console.log(`Backfilled select_count: ${setSelectCount}`);
  console.log(`Backfilled signal=no-signal: ${setNoSignal}`);
  console.log(`Inconsistent groups (>1 winner row): ${inconsistent}`);
  console.log(`Mode: ${opts.write ? "WRITE" : "DRY-RUN"}`);

  if (opts.write) {
    writeFileSync(PATHS.exploreLog, updated, "utf-8");
    console.log(`Wrote: ${PATHS.exploreLog}`);
  }
}

main();

