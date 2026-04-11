import { describe, it, expect } from "vitest";
import {
  buildVerifyArgs,
  parseAndValidateResult,
  parseOutput,
} from "../../experiments/write-test-plan/scripts/verify.js";

describe("verify args", () => {
  it("supports dry-check/no-run and passthrough", () => {
    const parsed = buildVerifyArgs(["--no-run", "--single", "ec-04", "--timeout-ms", "5000"]);
    expect(parsed.dryCheck).toBe(true);
    expect(parsed.timeoutMs).toBe(5000);
    expect(parsed.passThroughArgs).toEqual(["--single", "ec-04"]);
  });

  it("defaults timeout to one hour when invalid", () => {
    const parsed = buildVerifyArgs(["--timeout-ms", "oops"]);
    expect(parsed.timeoutMs).toBe(3_600_000);
  });
});

describe("verify parsing", () => {
  it("parses METRICS_JSON", () => {
    const out = parseOutput('abc\nMETRICS_JSON: {"score":88.8,"loss":12.5,"metrics":{"x":1}}\n');
    expect(out).toEqual({ score: 88.8, loss: 12.5, metrics: { x: 1 } });
  });

  it("parses SCORE/LOSS fallback", () => {
    const out = parseOutput("SCORE: 0.91\nLOSS: 6.2\n");
    expect(out).toEqual({ score: 91, loss: 6.2 });
  });

  it("validates and clamps score/loss", () => {
    const out = parseAndValidateResult('METRICS_JSON: {"score":120,"loss":-1,"metrics":{"ok":1}}');
    expect(out).toEqual({ score: 100, loss: 0, metrics: { ok: 1 } });
  });
});
