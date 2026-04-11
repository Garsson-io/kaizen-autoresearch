#!/usr/bin/env npx tsx
import { readFileSync } from "node:fs";
import { PATHS } from "./paths.js";
import {
  DEFAULT_CLAUDE_MODEL,
  DEFAULT_CODEX_MODEL,
  DEFAULT_REASONING_EFFORT,
  SUPPORTED_REASONING_EFFORTS,
} from "./model-config.js";

function extractValue(script: string, name: string): string | undefined {
  const match = script.match(new RegExp(`^${name}="([^"]+)"$`, "m"));
  return match?.[1];
}

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function main() {
  const sh = readFileSync(PATHS.runEval, "utf8");

  const defaultModel = extractValue(sh, "MODEL");
  const defaultReasoning = extractValue(sh, "REASONING_EFFORT");
  if (!defaultModel) fail("Unable to extract MODEL default from run-eval.sh");
  if (!defaultReasoning) fail("Unable to extract REASONING_EFFORT default from run-eval.sh");

  const codexBranchMatch = sh.match(/if \[\[ "\$MODEL_SET" != "true" && "\$CLI" == "codex" \]\]; then\s+MODEL="([^"]+)"/m);
  const claudeBranchMatch = sh.match(/elif \[\[ "\$MODEL_SET" != "true" && "\$CLI" == "claude" \]\]; then\s+MODEL="([^"]+)"/m);
  if (!codexBranchMatch?.[1] || !claudeBranchMatch?.[1]) {
    fail("Unable to extract CLI-specific MODEL defaults from run-eval.sh");
  }

  if (codexBranchMatch[1] !== DEFAULT_CODEX_MODEL) {
    fail(`run-eval.sh codex default (${codexBranchMatch[1]}) != TS default (${DEFAULT_CODEX_MODEL})`);
  }
  if (claudeBranchMatch[1] !== DEFAULT_CLAUDE_MODEL) {
    fail(`run-eval.sh claude default (${claudeBranchMatch[1]}) != TS default (${DEFAULT_CLAUDE_MODEL})`);
  }
  if (defaultReasoning !== DEFAULT_REASONING_EFFORT) {
    fail(`run-eval.sh reasoning default (${defaultReasoning}) != TS default (${DEFAULT_REASONING_EFFORT})`);
  }

  const effortCase = sh.match(/--reasoning-effort must be one of: ([^"]+)/);
  if (!effortCase?.[1]) {
    fail("Unable to extract reasoning-effort validation list from run-eval.sh");
  }
  const shellEfforts = effortCase[1].split("|").map((s) => s.trim()).filter(Boolean);
  const tsEfforts = [...SUPPORTED_REASONING_EFFORTS];
  if (shellEfforts.join(",") !== tsEfforts.join(",")) {
    fail(`run-eval.sh efforts (${shellEfforts.join(",")}) != TS efforts (${tsEfforts.join(",")})`);
  }

  console.log("Runner config is aligned: TypeScript defaults match run-eval.sh");
}

main();
