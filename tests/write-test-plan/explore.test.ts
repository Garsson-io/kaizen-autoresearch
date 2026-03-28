/**
 * explore.test.ts — Data-integrity tests for the /explore feature.
 *
 * Tests are invariant-based: they verify structural correctness and
 * cross-reference consistency of the explore infrastructure.
 * No LLM calls, no subprocess invocations — all reads are from disk.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { PATHS, EXP_DIR } from "../../experiments/write-test-plan/scripts/paths.js";
import { loadIdeas } from "../../experiments/write-test-plan/scripts/ideas-index.js";

// Schema for each line in explore-log.jsonl
const ExploreEntry = z.object({
  timestamp: z.string(),
  idea_id: z.string(),
  variation: z.string(),
  run_dir: z.string(),                // relative path from EXP_DIR
  tasks: z.array(z.string()),
  baseline_loss: z.number().positive(),
  variation_loss: z.number().positive(),
  delta: z.number(),                  // variation_loss - baseline_loss
  prompt_diff: z.string(),
  winner: z.boolean(),
});
type ExploreEntry = z.infer<typeof ExploreEntry>;

function loadExploreLog(): ExploreEntry[] {
  const raw = readFileSync(PATHS.exploreLog, "utf-8");
  return raw.trim().split("\n").filter(Boolean).map((line) => {
    const parsed = JSON.parse(line);
    return ExploreEntry.parse(parsed);
  });
}

describe("PATHS — explore entries", () => {
  it("PATHS.exploreLog is defined and the file exists", () => {
    expect(PATHS.exploreLog).toBeTruthy();
    expect(existsSync(PATHS.exploreLog)).toBe(true);
  });

  it("PATHS.exploreRuns is defined and the directory exists", () => {
    expect(PATHS.exploreRuns).toBeTruthy();
    expect(existsSync(PATHS.exploreRuns)).toBe(true);
  });
});

describe("explore-log.jsonl — schema", () => {
  it("every line is valid JSON matching ExploreEntry schema", () => {
    expect(() => loadExploreLog()).not.toThrow();
  });

  it("has at least one entry", () => {
    expect(loadExploreLog().length).toBeGreaterThan(0);
  });

  it("every entry: delta = variation_loss − baseline_loss (within floating point tolerance)", () => {
    for (const e of loadExploreLog()) {
      const expected = e.variation_loss - e.baseline_loss;
      expect(e.delta).toBeCloseTo(expected, 1);
    }
  });

  it("winner = true iff delta < 0 (lower loss = better)", () => {
    for (const e of loadExploreLog()) {
      if (e.winner) {
        expect(e.delta).toBeLessThan(0);
      } else {
        expect(e.delta).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("at most one winner per idea_id", () => {
    const entries = loadExploreLog();
    const winners = entries.filter((e) => e.winner);
    const winnerIdeas = winners.map((e) => e.idea_id);
    const unique = new Set(winnerIdeas);
    expect(winnerIdeas.length).toBe(unique.size);
  });

  it("tasks list is non-empty for every entry", () => {
    for (const e of loadExploreLog()) {
      expect(e.tasks.length).toBeGreaterThan(0);
    }
  });
});

describe("explore-log.jsonl — run_dir cross-references", () => {
  it("every run_dir exists on disk (relative to EXP_DIR)", () => {
    for (const e of loadExploreLog()) {
      const abs = join(EXP_DIR, e.run_dir);
      expect(existsSync(abs), `run_dir not found: ${e.run_dir}`).toBe(true);
    }
  });

  it("every run_dir contains treatment.md", () => {
    for (const e of loadExploreLog()) {
      const treatment = join(EXP_DIR, e.run_dir, "treatment.md");
      expect(existsSync(treatment), `treatment.md missing in ${e.run_dir}`).toBe(true);
    }
  });

  it("every run_dir contains output JSON for each task in the tasks list", () => {
    for (const e of loadExploreLog()) {
      const dir = join(EXP_DIR, e.run_dir);
      const files = readdirSync(dir);
      for (const task of e.tasks) {
        const taskId = task.replace(/-/g, "");  // ec-01 → ec01
        const hasOutput = files.some((f) => f.includes(taskId) && f.endsWith(".json"));
        expect(hasOutput, `No output JSON for task ${task} in ${e.run_dir}`).toBe(true);
      }
    }
  });
});

describe("explore-log.jsonl — idea_id cross-references", () => {
  it("every idea_id in the log has a corresponding idea file", () => {
    const ideas = loadIdeas(PATHS.ideas);
    const ideaIds = new Set(ideas.map((i) => i.id));
    for (const e of loadExploreLog()) {
      expect(ideaIds.has(e.idea_id), `idea_id '${e.idea_id}' has no matching idea file`).toBe(true);
    }
  });
});

describe("idea files — explore metadata consistency", () => {
  it("ideas explored in the log have explore_status set (not null)", () => {
    const entries = loadExploreLog();
    const loggedIds = new Set(entries.map((e) => e.idea_id));
    const ideas = loadIdeas(PATHS.ideas);
    for (const idea of ideas) {
      if (!loggedIds.has(idea.id)) continue;
      expect(
        idea.explore_status,
        `${idea.id} appears in log but has explore_status: null`
      ).not.toBeNull();
    }
  });

  it("no-signal ideas have explore_delta > 0 (worse loss)", () => {
    const ideas = loadIdeas(PATHS.ideas);
    for (const idea of ideas) {
      if (idea.explore_status !== "no-signal") continue;
      const delta = Number(idea.explore_delta);
      expect(
        delta,
        `${idea.id} is no-signal but explore_delta=${delta} is not positive`
      ).toBeGreaterThan(0);
    }
  });

  it("signal ideas have explore_delta < 0 (improved loss)", () => {
    const ideas = loadIdeas(PATHS.ideas);
    for (const idea of ideas) {
      if (idea.explore_status !== "signal") continue;
      const delta = Number(idea.explore_delta);
      expect(
        delta,
        `${idea.id} is signal but explore_delta=${delta} is not negative`
      ).toBeLessThan(0);
    }
  });

  it("explore_baseline_loss and explore_loss match corresponding log entries", () => {
    const entries = loadExploreLog();
    const ideas = loadIdeas(PATHS.ideas);

    for (const idea of ideas) {
      if (!idea.explore_status || idea.explore_status === "null") continue;
      const matching = entries.filter((e) => e.idea_id === idea.id);
      if (matching.length === 0) continue;

      // explore_baseline_loss should match the baseline_loss from the log
      const logBaseline = matching[0].baseline_loss;
      expect(Number(idea.explore_baseline_loss)).toBeCloseTo(logBaseline, 1);

      // explore_loss should match the best variation's loss (winner or min)
      const winnerEntry = matching.find((e) => e.winner) ?? matching.reduce(
        (best, e) => e.variation_loss < best.variation_loss ? e : best
      );
      expect(Number(idea.explore_loss)).toBeCloseTo(winnerEntry.variation_loss, 1);
    }
  });
});

describe("explore run dirs — structure invariants", () => {
  it("all dirs under runs/explore/ are referenced in explore-log.jsonl", () => {
    const entries = loadExploreLog();
    const loggedDirs = new Set(entries.map((e) => join(EXP_DIR, e.run_dir)));
    const actualDirs = readdirSync(PATHS.exploreRuns)
      .map((d) => join(PATHS.exploreRuns, d))
      .filter((p) => statSync(p).isDirectory());
    for (const dir of actualDirs) {
      expect(loggedDirs.has(dir), `${dir} exists on disk but is not in explore-log.jsonl`).toBe(true);
    }
  });
});
