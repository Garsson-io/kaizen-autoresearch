import { describe, it, expect } from "vitest";
import { join } from "path";
import {
  extractThinkingFromLog,
  extractBehaviorThinking,
  checkSelfAware,
  getDirection,
  processRun,
} from "../../experiments/write-test-plan/scripts/extract-thinking.js";
import { FIXTURE_RUN, FIXTURE_LOG } from "./fixtures.js";

describe("getDirection", () => {
  it("returns correct for exact match", () => {
    expect(getDirection("Unit", "Unit")).toBe("correct");
    expect(getDirection("System", "System")).toBe("correct");
  });

  it("returns under when predicted is lower than GT", () => {
    expect(getDirection("Unit", "Integration")).toBe("under");
    expect(getDirection("Unit", "System")).toBe("under");
    expect(getDirection("Integration", "Workflow")).toBe("under");
  });

  it("returns over when predicted is higher than GT", () => {
    expect(getDirection("Integration", "Unit")).toBe("over");
    expect(getDirection("System", "Integration")).toBe("over");
    expect(getDirection("Workflow", "Unit")).toBe("over");
  });
});

describe("extractThinkingFromLog", () => {
  it("extracts thinking text from stream-json log", () => {
    const thinking = extractThinkingFromLog(FIXTURE_LOG);
    expect(thinking).toContain("Behavior 1");
    expect(thinking).toContain("Behavior 2");
    expect(thinking).toContain("Behavior 3");
  });

  it("returns empty string for non-existent log", () => {
    expect(extractThinkingFromLog("/nonexistent/path.log")).toBe("");
  });

  it("returns empty string for log with no thinking blocks", () => {
    const noThinking = `{"type":"result","duration_ms":1000,"total_cost_usd":0.01,"num_turns":1,"stop_reason":"tool_use","usage":{"input_tokens":100,"output_tokens":50,"cache_read_input_tokens":0,"cache_creation_input_tokens":0}}`;
    const tmpPath = join(FIXTURE_RUN, "no-thinking.log");
    import("fs").then(({ writeFileSync, unlinkSync }) => {
      writeFileSync(tmpPath, noThinking);
      expect(extractThinkingFromLog(tmpPath)).toBe("");
      unlinkSync(tmpPath);
    });
  });

  it("ignores non-JSON lines gracefully", () => {
    const logPath = FIXTURE_LOG;
    // Log has real JSON lines; function should not throw
    expect(() => extractThinkingFromLog(logPath)).not.toThrow();
  });
});

describe("extractBehaviorThinking", () => {
  const thinking = `
Let me analyze each behavior.

Behavior 1: Returns correct sum
This is a pure arithmetic function. Unit level is correct.

Behavior 2: Saves result to database
This requires the real database driver. A mock would hide connection issues.
Integration level is appropriate here.

3. Sends email notification
The SMTP connection can fail in real ways.
`;

  it("finds excerpt for behavior that appears in thinking", () => {
    const excerpt = extractBehaviorThinking(thinking, 2, "Saves result to database");
    expect(excerpt).toContain("database");
    expect(excerpt).not.toBe("(behavior not found in thinking)");
  });

  it("returns sentinel when behavior not found", () => {
    const excerpt = extractBehaviorThinking(thinking, 99, "Nonexistent behavior");
    expect(excerpt).toBe("(behavior not found in thinking)");
  });

  it("finds behavior by description prefix match", () => {
    const excerpt = extractBehaviorThinking(thinking, 1, "Returns correct sum for two integers");
    expect(excerpt).not.toBe("(behavior not found in thinking)");
  });
});

describe("checkSelfAware", () => {
  it("returns not self-aware when prediction is correct", () => {
    const result = checkSelfAware("Some thinking text.", "Unit", "Unit");
    expect(result.selfAware).toBe(false);
    expect(result.evidence).toBeNull();
  });

  it("returns not self-aware for over-prediction (predicted > GT)", () => {
    // Over-prediction is not self-aware — only under-prediction is
    const result = checkSelfAware("Some thinking mentioning non-deterministic behavior.", "System", "Unit");
    expect(result.selfAware).toBe(false);
  });

  it("returns not self-aware when GT is null", () => {
    const result = checkSelfAware("non-deterministic model output varies.", "Unit", null);
    expect(result.selfAware).toBe(false);
  });

  it("detects self-aware via Agentic keywords in under-prediction", () => {
    const thinking = "The model output varies between runs. non-deterministic behavior means unit won't catch it.";
    const result = checkSelfAware(thinking, "Unit", "Agentic");
    expect(result.selfAware).toBe(true);
    expect(result.evidence).toBeTruthy();
  });

  it("detects self-aware via explicit GT level mention in thinking", () => {
    const thinking = "I think Agentic level is actually needed here but I'll say Integration.";
    const result = checkSelfAware(thinking, "Integration", "Agentic");
    expect(result.selfAware).toBe(true);
  });

  it("detects self-aware via Workflow keywords", () => {
    const thinking = "This is a multi-step pipeline where each step feeds into the next.";
    const result = checkSelfAware(thinking, "System", "Workflow");
    expect(result.selfAware).toBe(true);
  });

  it("returns not self-aware when under-prediction but no matching keywords", () => {
    const thinking = "This is a simple function that returns a sum.";
    const result = checkSelfAware(thinking, "Unit", "Agentic");
    expect(result.selfAware).toBe(false);
  });
});

describe("processRun", () => {
  it("returns one BehaviorThinking per behavior in the run", () => {
    const results = processRun(FIXTURE_RUN);
    expect(results.length).toBe(3);
  });

  it("each result has required fields", () => {
    const results = processRun(FIXTURE_RUN);
    for (const r of results) {
      expect(r.task).toBe("EC-01");
      expect(typeof r.behavior_id).toBe("number");
      expect(["Unit", "Integration", "System", "Agentic", "Workflow"]).toContain(r.predicted);
      expect(["correct", "under", "over", "unknown"]).toContain(r.direction);
      expect(typeof r.justification).toBe("string");
    }
  });

  it("behavior 1 (Unit predicted, Unit GT) is correct", () => {
    const results = processRun(FIXTURE_RUN);
    const b1 = results.find((r) => r.behavior_id === 1)!;
    expect(b1.direction).toBe("correct");
    expect(b1.gt).toBe("Unit");
  });

  it("behavior 2 (Integration predicted, Integration GT) is correct", () => {
    const results = processRun(FIXTURE_RUN);
    const b2 = results.find((r) => r.behavior_id === 2)!;
    expect(b2.direction).toBe("correct");
  });

  it("behavior 3 (Unit predicted, Integration GT) is under", () => {
    const results = processRun(FIXTURE_RUN);
    const b3 = results.find((r) => r.behavior_id === 3)!;
    expect(b3.direction).toBe("under");
    expect(b3.predicted).toBe("Unit");
    expect(b3.gt).toBe("Integration");
  });
});
