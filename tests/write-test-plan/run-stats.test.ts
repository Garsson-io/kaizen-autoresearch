import { describe, it, expect } from "vitest";
import { join } from "path";
import { writeFileSync, unlinkSync } from "fs";
import { parseLog } from "../../experiments/write-test-plan/scripts/run-stats.js";
import { FIXTURE_LOG, FIXTURE_RUN } from "./fixtures.js";

const TMP_DIR = FIXTURE_RUN;

function makeLine(obj: unknown) {
  return JSON.stringify(obj);
}

function writeLog(name: string, lines: string[]): string {
  const path = join(TMP_DIR, name);
  writeFileSync(path, lines.join("\n") + "\n");
  return path;
}

describe("parseLog", () => {
  it("parses the fixture log and returns a ProbeStats object", () => {
    const stats = parseLog(FIXTURE_LOG);
    expect(stats).not.toBeNull();
    expect(stats!.duration_s).toBeCloseTo(74.321, 2);
    expect(stats!.cost_usd).toBeCloseTo(0.061, 3);
    expect(stats!.input_tokens).toBe(13356);
    expect(stats!.output_tokens).toBe(8836);
    expect(stats!.num_turns).toBe(2);
    expect(stats!.stop_reason).toBe("tool_use");
  });

  it("extracts model and tools_available from system event", () => {
    const stats = parseLog(FIXTURE_LOG);
    expect(stats!.model).toBe("claude-haiku-4-5-20251001");
    expect(stats!.tools_available).toBe(1);
    expect(stats!.mcp_servers).toBe(0);
  });

  it("task name is derived from filename", () => {
    const stats = parseLog(FIXTURE_LOG);
    expect(stats!.task).toBe("EC01");
  });

  it("returns null when log has no result event (incomplete run)", () => {
    const path = writeLog("incomplete.log", [
      makeLine({ type: "system", model: "haiku", tools: [], mcp_servers: [], slash_commands: [] }),
    ]);
    try {
      expect(parseLog(path)).toBeNull();
    } finally {
      unlinkSync(path);
    }
  });

  it("accumulates extra tool uses (non-StructuredOutput)", () => {
    const path = writeLog("extra-tools.log", [
      makeLine({ type: "system", model: "haiku", tools: [{ name: "StructuredOutput" }, { name: "Bash" }], mcp_servers: [], slash_commands: [] }),
      makeLine({ type: "assistant", message: { content: [{ type: "tool_use", name: "Bash" }] } }),
      makeLine({ type: "result", duration_ms: 5000, total_cost_usd: 0.01, num_turns: 1, stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } }),
    ]);
    try {
      const stats = parseLog(path);
      expect(stats!.tools_used).toContain("Bash");
    } finally {
      unlinkSync(path);
    }
  });

  it("StructuredOutput tool use is not counted in tools_used", () => {
    const path = writeLog("structured-only.log", [
      makeLine({ type: "system", model: "haiku", tools: [{ name: "StructuredOutput" }], mcp_servers: [], slash_commands: [] }),
      makeLine({ type: "assistant", message: { content: [{ type: "tool_use", name: "StructuredOutput" }] } }),
      makeLine({ type: "result", duration_ms: 3000, total_cost_usd: 0.005, num_turns: 1, stop_reason: "tool_use", usage: { input_tokens: 50, output_tokens: 30, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } }),
    ]);
    try {
      const stats = parseLog(path);
      expect(stats!.tools_used).toEqual([]);
    } finally {
      unlinkSync(path);
    }
  });

  it("skips non-JSON lines without throwing", () => {
    const path = writeLog("noisy.log", [
      "This is not JSON",
      "Another bad line",
      makeLine({ type: "result", duration_ms: 1000, total_cost_usd: 0.001, num_turns: 1, stop_reason: "end_turn", usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } }),
    ]);
    try {
      expect(() => parseLog(path)).not.toThrow();
      expect(parseLog(path)).not.toBeNull();
    } finally {
      unlinkSync(path);
    }
  });

  it("computes total_input = input + cache_read + cache_create", () => {
    const path = writeLog("cached.log", [
      makeLine({ type: "system", model: "haiku", tools: [], mcp_servers: [], slash_commands: [] }),
      makeLine({ type: "result", duration_ms: 2000, total_cost_usd: 0.002, num_turns: 1, stop_reason: "end_turn", usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 200, cache_creation_input_tokens: 50 } }),
    ]);
    try {
      const stats = parseLog(path);
      expect(stats!.total_input).toBe(350);  // 100 + 200 + 50
    } finally {
      unlinkSync(path);
    }
  });
});
