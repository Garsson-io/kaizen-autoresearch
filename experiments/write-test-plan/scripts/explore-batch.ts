#!/usr/bin/env tsx
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Command } from "commander";
import { runCommandSync } from "./process-utils.js";

type Signal = "signal" | "concentrated-signal" | "no-signal";

type ExploreWinner = {
  variation?: string;
  delta?: number;
  concentration_pct?: number;
};

type ExploreJson = {
  signal?: Signal;
  winner?: ExploreWinner | null;
};

type RunRecord = {
  seed: number;
  pass: "main" | "holdout";
  exitCode: number;
  signal: Signal | "unknown";
  winner: string;
  delta: string;
  concentrationPct: string;
  error?: string;
};

const ACCEPTED_EXIT_CODES = new Set([0, 2, 3]);

function fmtDelta(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "NA";
  return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

function parseJson(stdout: string): ExploreJson {
  const text = stdout.trim();
  if (!text) return {};
  if (!text.startsWith("{")) return {};
  return JSON.parse(text) as ExploreJson;
}

function runExploreOnce(params: {
  idea: string;
  seed: number;
  selectCount: number;
  force: boolean;
}): RunRecord {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const explorePath = path.join(here, "explore.ts");

  const args = [
    "tsx",
    explorePath,
    params.idea,
    "--seed",
    String(params.seed),
    "--select-count",
    String(params.selectCount),
    "--json",
  ];
  if (params.force) args.push("--force");

  const proc = runCommandSync("npx", args, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

  const exitCode = proc.status ?? 1;
  const record: RunRecord = {
    seed: params.seed,
    pass: "main",
    exitCode,
    signal: "unknown",
    winner: "none",
    delta: "NA",
    concentrationPct: "NA",
  };

  if (!ACCEPTED_EXIT_CODES.has(exitCode)) {
    record.error = (proc.stderr || proc.stdout || "unknown error").trim().slice(0, 500);
    return record;
  }

  try {
    const parsed = parseJson(proc.stdout || "");
    record.signal = parsed.signal ?? "unknown";
    const winner = parsed.winner;
    record.winner = winner?.variation ?? "none"; // winner can be null for no-signal
    record.delta = fmtDelta(winner?.delta);
    record.concentrationPct = typeof winner?.concentration_pct === "number"
      ? (winner.concentration_pct * 100).toFixed(1)
      : "NA";
  } catch (err) {
    record.error = `JSON parse failure: ${String(err)}`;
  }

  return record;
}

function toTsv(records: RunRecord[]): string {
  const lines = ["seed\tpass\texit\tsignal\twinner\tdelta\tconc_pct\terror"];
  for (const r of records) {
    lines.push([
      String(r.seed),
      r.pass,
      String(r.exitCode),
      r.signal,
      r.winner,
      r.delta,
      r.concentrationPct,
      (r.error ?? "").replace(/\s+/g, " ").trim(),
    ].join("\t"));
  }
  return lines.join("\n");
}

const program = new Command();
program
  .argument("<idea>", "idea id")
  .option("--seed-from <n>", "start seed", (v) => Number(v), 900)
  .option("--seed-to <n>", "end seed (inclusive)", (v) => Number(v), 919)
  .option("--select-count <n>", "task subset size", (v) => Number(v), 8)
  .option("--force", "pass --force to explore.ts", true)
  .option("--no-force", "do not pass --force to explore.ts")
  .option("--holdout", "run holdout when main signal is signal/concentrated-signal", true)
  .option("--no-holdout", "skip holdout pass entirely")
  .option("--holdout-offset <n>", "holdout seed offset", (v) => Number(v), 100)
  .option("--json", "print JSON instead of TSV", false)
  .parse(process.argv);

const opts = program.opts<{
  seedFrom: number;
  seedTo: number;
  selectCount: number;
  force: boolean;
  holdout: boolean;
  holdoutOffset: number;
  json: boolean;
}>();

const idea = program.args[0] as string;
if (!idea) {
  console.error("Missing required <idea>");
  process.exit(1);
}
if (!Number.isInteger(opts.seedFrom) || !Number.isInteger(opts.seedTo) || opts.seedFrom > opts.seedTo) {
  console.error("Invalid seed range");
  process.exit(1);
}

const records: RunRecord[] = [];
for (let seed = opts.seedFrom; seed <= opts.seedTo; seed += 1) {
  const main = runExploreOnce({
    idea,
    seed,
    selectCount: opts.selectCount,
    force: opts.force,
  });
  main.pass = "main";
  records.push(main);

  // Exit code 1 is the only hard tool failure.
  if (main.exitCode === 1) {
    if (opts.json) {
      console.log(JSON.stringify({ records, error: `explore failed on seed ${seed}` }, null, 2));
    } else {
      console.log(toTsv(records));
    }
    process.exit(1);
  }

  const shouldHoldout = opts.holdout && (main.signal === "signal" || main.signal === "concentrated-signal");
  if (!shouldHoldout) continue;

  const holdoutSeed = seed + opts.holdoutOffset;
  const holdout = runExploreOnce({
    idea,
    seed: holdoutSeed,
    selectCount: opts.selectCount,
    force: true,
  });
  holdout.pass = "holdout";
  records.push(holdout);

  if (holdout.exitCode === 1) {
    if (opts.json) {
      console.log(JSON.stringify({ records, error: `holdout explore failed on seed ${holdoutSeed}` }, null, 2));
    } else {
      console.log(toTsv(records));
    }
    process.exit(1);
  }
}

if (opts.json) {
  console.log(JSON.stringify({ records }, null, 2));
} else {
  console.log(toTsv(records));
}
