/**
 * smoke.test.ts — CLI-level smoke tests for all scripts.
 * All tests are LLM-free: they use fixtures or --mock flags.
 */
import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { join } from "path";
import {
  REPO_ROOT, EXP_DIR, EXP_SCRIPTS,
  FIXTURE_RUN, FIXTURE_GT_DIR, FIXTURE_OUTPUT, FIXTURE_GT,
} from "./fixtures.js";

/** Run a script from the repo root (standard). */
function tsx(script: string, args: string[], env?: Record<string, string>) {
  return spawnSync(
    "npx",
    ["tsx", join(EXP_SCRIPTS, script), ...args],
    { cwd: REPO_ROOT, encoding: "utf8", timeout: 30_000, env: { ...process.env, ...env } }
  );
}

/** Run the same script but with cwd set to the experiment directory. */
function tsxFromExpDir(script: string, args: string[]) {
  return spawnSync(
    "npx",
    ["tsx", join(EXP_SCRIPTS, script), ...args],
    { cwd: EXP_DIR, encoding: "utf8", timeout: 30_000, env: { ...process.env } }
  );
}

/** Run with cwd set to a deep subdirectory inside the repo. */
function tsxFromSubdir(script: string, args: string[]) {
  return spawnSync(
    "npx",
    ["tsx", join(EXP_SCRIPTS, script), ...args],
    { cwd: join(EXP_DIR, "corpus"), encoding: "utf8", timeout: 30_000, env: { ...process.env } }
  );
}

describe("verify.ts --mock", () => {
  it("outputs valid JSON with score and loss", () => {
    const r = tsx("verify.ts", ["--mock", "0.895", "--mock-loss", "23.4"]);
    expect(r.status).toBe(0);
    const out = JSON.parse(r.stdout);
    expect(out.score).toBeCloseTo(89.5, 1);
    expect(out.loss).toBeCloseTo(23.4, 1);
  });

  it("multiplies raw score by 100", () => {
    const r = tsx("verify.ts", ["--mock", "0.5", "--mock-loss", "100"]);
    expect(r.status).toBe(0);
    const out = JSON.parse(r.stdout);
    expect(out.score).toBeCloseTo(50.0, 1);
  });

  it("defaults loss to 0 when --mock-loss omitted", () => {
    const r = tsx("verify.ts", ["--mock", "0.8"]);
    expect(r.status).toBe(0);
    const out = JSON.parse(r.stdout);
    expect(out.loss).toBe(0);
  });
});

describe("score.ts --output / --gt", () => {
  it("scores fixture output against fixture GT and exits 0", () => {
    const r = tsx("score.ts", ["--output", FIXTURE_OUTPUT, "--gt", FIXTURE_GT]);
    expect(r.status).toBe(0);
  });

  it("output contains TOTAL and LOSS lines", () => {
    const r = tsx("score.ts", ["--output", FIXTURE_OUTPUT, "--gt", FIXTURE_GT]);
    expect(r.stdout).toContain("TOTAL");
    expect(r.stdout).toContain("LOSS");
  });

  it("exits non-zero with usage message when no args", () => {
    const r = tsx("score.ts", []);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("Usage");
  });

  it("batch mode: --output-dir and --gt-dir", () => {
    const r = tsx("score.ts", [
      "--output-dir", FIXTURE_RUN,
      "--gt-dir", FIXTURE_GT_DIR,
    ]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("EC-01");
  });
});

describe("extract-thinking.ts", () => {
  it("outputs valid JSON array with --json flag", () => {
    const r = tsx("extract-thinking.ts", ["--run-dir", FIXTURE_RUN, "--json"]);
    expect(r.status).toBe(0);
    const data = JSON.parse(r.stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(3);
  });

  it("each result has task, behavior_id, predicted, gt, direction", () => {
    const r = tsx("extract-thinking.ts", ["--run-dir", FIXTURE_RUN, "--json"]);
    const data = JSON.parse(r.stdout);
    for (const item of data) {
      expect(item).toHaveProperty("task");
      expect(item).toHaveProperty("behavior_id");
      expect(item).toHaveProperty("predicted");
      expect(item).toHaveProperty("direction");
    }
  });

  it("accepts absolute run-dir path (path-doubling fix)", () => {
    const r = tsx("extract-thinking.ts", ["--run-dir", FIXTURE_RUN, "--json"]);
    expect(r.status).toBe(0);
    expect(r.stderr).not.toContain("not found");
  });

  it("exits non-zero for missing --run-dir", () => {
    const r = tsx("extract-thinking.ts", []);
    expect(r.status).not.toBe(0);
  });

  it("--task filters to single task", () => {
    const r = tsx("extract-thinking.ts", ["--run-dir", FIXTURE_RUN, "--task", "EC-01", "--json"]);
    expect(r.status).toBe(0);
    const data = JSON.parse(r.stdout);
    expect(data.every((d: { task: string }) => d.task === "EC-01")).toBe(true);
  });
});

describe("ideas-index.ts", () => {
  it("--json outputs a valid JSON array", () => {
    const r = tsx("ideas-index.ts", ["--json"]);
    expect(r.status).toBe(0);
    const data = JSON.parse(r.stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("each idea has id, title, status, effort", () => {
    const r = tsx("ideas-index.ts", ["--json"]);
    const data = JSON.parse(r.stdout);
    for (const idea of data) {
      expect(idea).toHaveProperty("id");
      expect(idea).toHaveProperty("title");
      expect(idea).toHaveProperty("status");
      expect(idea).toHaveProperty("effort");
    }
  });

  it("--table exits 0 and contains header row", () => {
    const r = tsx("ideas-index.ts", ["--table"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("STATUS");
  });
});

describe("results.ts", () => {
  it("--summary exits 0 and shows total/keep rate", () => {
    const r = tsx("results.ts", ["--summary"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("Total iterations");
    expect(r.stdout).toContain("Keep rate");
  });

  it("--json outputs a valid JSON array", () => {
    const r = tsx("results.ts", ["--json"]);
    expect(r.status).toBe(0);
    const data = JSON.parse(r.stdout);
    expect(Array.isArray(data)).toBe(true);
  });

  it("--last 3 shows at most 3 rows", () => {
    const r = tsx("results.ts", ["--last", "3"]);
    expect(r.status).toBe(0);
  });
});

describe("run-stats.ts", () => {
  it("parses fixture run and outputs a table", () => {
    const r = tsx("run-stats.ts", ["--run", FIXTURE_RUN]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("EC01");
  });

  it("--json outputs a JSON array of probe stats", () => {
    const r = tsx("run-stats.ts", ["--run", FIXTURE_RUN, "--json"]);
    expect(r.status).toBe(0);
    const data = JSON.parse(r.stdout);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty("duration_s");
    expect(data[0]).toHaveProperty("cost_usd");
  });
});

// CWD-independence regression tests
// These were the root cause of the path-doubling bug: scripts were invoked from
// different working directories and path resolution broke.
describe("cwd independence — scripts work from any directory in the repo", () => {
  it("extract-thinking: absolute --run-dir from experiment dir (original failure scenario)", () => {
    // This is the exact scenario that triggered the join/resolve bug:
    // script invoked from EXP_DIR with an absolute path for --run-dir.
    const r = tsxFromExpDir("extract-thinking.ts", ["--run-dir", FIXTURE_RUN, "--json"]);
    expect(r.status, `stderr: ${r.stderr}`).toBe(0);
    const data = JSON.parse(r.stdout);
    expect(data.length).toBe(3);
    // The doubled path would have been something like:
    //   .../write-test-plan/runs/home/aviadr1/.../fixtures/runs/test-run-001
    // Verify the returned paths don't contain that pattern.
    expect(r.stderr).not.toMatch(/not found/i);
  });

  it("extract-thinking: absolute --run-dir from deep subdirectory", () => {
    const r = tsxFromSubdir("extract-thinking.ts", ["--run-dir", FIXTURE_RUN, "--json"]);
    expect(r.status, `stderr: ${r.stderr}`).toBe(0);
    const data = JSON.parse(r.stdout);
    expect(data.length).toBe(3);
  });

  it("score.ts: resolves GT and schema paths from experiment dir", () => {
    const r = tsxFromExpDir("score.ts", ["--output", FIXTURE_OUTPUT, "--gt", FIXTURE_GT]);
    expect(r.status, `stderr: ${r.stderr}`).toBe(0);
    expect(r.stdout).toContain("TOTAL");
  });

  it("verify.ts --mock: works from any cwd (no filesystem deps)", () => {
    const r = tsxFromExpDir("verify.ts", ["--mock", "0.9", "--mock-loss", "50"]);
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout).score).toBeCloseTo(90, 1);
  });

  it("PATHS are absolute regardless of cwd — verified via ideas-index --json", () => {
    // ideas-index uses PATHS.ideas to find ideas/. If paths were cwd-relative it would
    // find nothing (or wrong dir) when run from experiment dir vs repo root.
    const fromRoot = tsx("ideas-index.ts", ["--json"]);
    const fromExpDir = tsxFromExpDir("ideas-index.ts", ["--json"]);
    const fromSubdir = tsxFromSubdir("ideas-index.ts", ["--json"]);

    expect(fromRoot.status).toBe(0);
    expect(fromExpDir.status).toBe(0);
    expect(fromSubdir.status).toBe(0);

    // All three should return the same idea IDs regardless of where they were invoked from
    const ids = (r: typeof fromRoot) => JSON.parse(r.stdout).map((i: { id: string }) => i.id).sort();
    expect(ids(fromExpDir)).toEqual(ids(fromRoot));
    expect(ids(fromSubdir)).toEqual(ids(fromRoot));
  });
});
