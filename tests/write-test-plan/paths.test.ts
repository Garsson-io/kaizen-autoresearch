import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { join, resolve } from "path";
import { mkdirSync, symlinkSync, rmSync, existsSync } from "fs";
import { getRunDir, PATHS } from "../../experiments/write-test-plan/scripts/paths.js";

const TMP_RUNS = join(import.meta.dirname, "fixtures/tmp-runs");

beforeAll(() => {
  mkdirSync(join(TMP_RUNS, "20260101-120000"), { recursive: true });
  mkdirSync(join(TMP_RUNS, "20260201-090000"), { recursive: true });
  mkdirSync(join(TMP_RUNS, "20260301-150000"), { recursive: true });
});

afterAll(() => {
  rmSync(TMP_RUNS, { recursive: true, force: true });
});

describe("getRunDir", () => {
  it("resolves a relative timestamp against PATHS.runs", () => {
    const runDir = getRunDir("20260328-155121");
    expect(runDir).toBe(join(PATHS.runs, "20260328-155121"));
  });

  it("resolves an absolute path as-is (the path-doubling bug is fixed)", () => {
    const absPath = "/tmp/some-run-dir";
    const result = getRunDir(absPath);
    expect(result).toBe(absPath);
    // Must NOT double the path
    expect(result).not.toContain(PATHS.runs);
  });

  it("PATHS.runs is a non-empty absolute path", () => {
    expect(PATHS.runs).toBeTruthy();
    expect(PATHS.runs.startsWith("/")).toBe(true);
  });

  it("PATHS.groundTruth points into the experiment dir", () => {
    expect(PATHS.groundTruth).toContain("ground-truth");
  });

  it("all canonical PATHS exist on disk", () => {
    const checked = ["runs", "groundTruth", "corpus", "ideas", "prompts"] as const;
    for (const key of checked) {
      expect(existsSync(PATHS[key]), `PATHS.${key} should exist on disk`).toBe(true);
    }
  });
});

describe("getRunDir fallback behaviour", () => {
  it("returns the provided path when given a name (real runs dir)", () => {
    // Uses the real runs dir — just verifies the function returns a string
    const result = getRunDir("20260328-155121");
    expect(typeof result).toBe("string");
    expect(result.endsWith("20260328-155121")).toBe(true);
  });
});

// Regression: path.join(base, absPath) silently strips the leading slash and
// concatenates, producing a doubled path like /runs/home/user/.../runs/timestamp.
// path.resolve(base, absPath) correctly returns absPath unchanged when it is absolute.
describe("getRunDir path-doubling regression", () => {
  it("result never contains PATHS.runs as a substring of itself twice", () => {
    const absPath = "/tmp/my-run";
    const result = getRunDir(absPath);
    // If join were used: result would be "<PATHS.runs>/tmp/my-run" — runs appears once extra
    // With resolve: result is exactly "/tmp/my-run"
    const runsSegment = PATHS.runs;
    const doubled = runsSegment + runsSegment;
    expect(result).not.toContain(doubled);
    expect(result).toBe(absPath);
  });

  it("relative name is joined with PATHS.runs (not doubled)", () => {
    const name = "20991231-235959";
    const result = getRunDir(name);
    expect(result).toBe(join(PATHS.runs, name));
    // Specifically: the runs dir must appear exactly once as a prefix
    expect(result.split(PATHS.runs).length).toBe(2);
  });
});
