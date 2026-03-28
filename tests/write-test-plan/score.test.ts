import { describe, it, expect } from "vitest";
import { sufficiency, precision, scoreOutput, buildMetrics } from "../../experiments/write-test-plan/scripts/score.js";
import { LEVEL_INDEX, IterationResult } from "../../experiments/write-test-plan/src/schema.js";
import type { ProbeOutput, GroundTruth } from "../../experiments/write-test-plan/src/schema.js";

const LEVELS = ["Unit", "Integration", "System", "Agentic", "Workflow"] as const;

function makeProbeOutput(overrides: Partial<ProbeOutput> = {}): ProbeOutput {
  return {
    task_id: "EC-01",
    condition: "treatment",
    behaviors: [
      {
        behavior_id: 1,
        description: "Returns correct sum for two positive integers",
        minimum_level: "Unit",
        justification: "A unit test can call the function directly without any external dependencies.",
        test_description: "Call add(2, 3) and assert it returns 5.",
        plan_consistent: true,
        level_probabilities: { Unit: 0.85, Integration: 0.10, System: 0.03, Agentic: 0.01, Workflow: 0.01 },
      },
    ],
    ...overrides,
  };
}

function makeGroundTruth(overrides: Partial<GroundTruth> = {}): GroundTruth {
  return {
    task_id: "EC-01",
    behaviors: [{ behavior_id: 1, ground_truth_level: "Unit" }],
    ...overrides,
  };
}

describe("LEVEL_INDEX", () => {
  it("has all 5 levels in order", () => {
    expect(LEVEL_INDEX["Unit"]).toBe(0);
    expect(LEVEL_INDEX["Integration"]).toBe(1);
    expect(LEVEL_INDEX["System"]).toBe(2);
    expect(LEVEL_INDEX["Agentic"]).toBe(3);
    expect(LEVEL_INDEX["Workflow"]).toBe(4);
  });
});

describe("sufficiency", () => {
  it("returns 1.0 for exact match", () => {
    for (const level of LEVELS) expect(sufficiency(level, level)).toBe(1.0);
  });

  it("returns 1.0 for over-prediction (predicted higher than GT)", () => {
    expect(sufficiency("Integration", "Unit")).toBe(1.0);
    expect(sufficiency("System", "Unit")).toBe(1.0);
    expect(sufficiency("Workflow", "Integration")).toBe(1.0);
  });

  it("returns 0.4 for under by 1 level", () => {
    expect(sufficiency("Unit", "Integration")).toBe(0.4);
    expect(sufficiency("Integration", "System")).toBe(0.4);
    expect(sufficiency("System", "Agentic")).toBe(0.4);
    expect(sufficiency("Agentic", "Workflow")).toBe(0.4);
  });

  it("returns 0.15 for under by 2 levels", () => {
    expect(sufficiency("Unit", "System")).toBe(0.15);
    expect(sufficiency("Integration", "Agentic")).toBe(0.15);
    expect(sufficiency("System", "Workflow")).toBe(0.15);
  });

  it("returns 0.05 for under by 3+ levels", () => {
    expect(sufficiency("Unit", "Agentic")).toBe(0.05);
    expect(sufficiency("Unit", "Workflow")).toBe(0.05);
    expect(sufficiency("Integration", "Workflow")).toBe(0.05);
  });
});

describe("precision", () => {
  it("returns 1.0 for exact match", () => {
    for (const level of LEVELS) expect(precision(level, level)).toBe(1.0);
  });

  it("returns 0.65 for distance of 1 in either direction", () => {
    expect(precision("Unit", "Integration")).toBe(0.65);
    expect(precision("Integration", "Unit")).toBe(0.65);
    expect(precision("System", "Agentic")).toBe(0.65);
    expect(precision("Agentic", "System")).toBe(0.65);
  });

  it("returns 0.3 for distance of 2", () => {
    expect(precision("Unit", "System")).toBe(0.3);
    expect(precision("System", "Unit")).toBe(0.3);
    expect(precision("Integration", "Agentic")).toBe(0.3);
  });

  it("returns 0.0 for distance of 3+", () => {
    expect(precision("Unit", "Agentic")).toBe(0.0);
    expect(precision("Unit", "Workflow")).toBe(0.0);
    expect(precision("Agentic", "Unit")).toBe(0.0);
  });
});

describe("scoreOutput", () => {
  it("scores a perfect prediction: suff=1, prec=1, total≈1", () => {
    const output = makeProbeOutput();
    const gt = makeGroundTruth();
    const result = scoreOutput(output, gt);

    expect(result.sufficiency).toBe(1.0);
    expect(result.precision).toBe(1.0);
    expect(result.consistency).toBe(1.0);
    expect(result.total).toBeCloseTo(1.0);
    expect(result.under_test_count).toBe(0);
    expect(result.over_test_count).toBe(0);
  });

  it("under-prediction reduces sufficiency and precision", () => {
    const output = makeProbeOutput({
      behaviors: [{
        behavior_id: 1,
        description: "Saves to DB",
        minimum_level: "Unit",
        justification: "Can mock the DB driver and verify the call.",
        test_description: "Mock DB and assert insert was called.",
        plan_consistent: true,
        level_probabilities: { Unit: 0.7, Integration: 0.2, System: 0.05, Agentic: 0.03, Workflow: 0.02 },
      }],
    });
    const gt = makeGroundTruth({
      behaviors: [{ behavior_id: 1, ground_truth_level: "Integration" }],
    });
    const result = scoreOutput(output, gt);

    expect(result.sufficiency).toBe(0.4);  // under by 1
    expect(result.precision).toBe(0.65);  // distance 1
    expect(result.under_test_count).toBe(1);
    expect(result.over_test_count).toBe(0);
  });

  it("over-prediction: full sufficiency, reduced precision", () => {
    const output = makeProbeOutput({
      behaviors: [{
        behavior_id: 1,
        description: "Returns sum",
        minimum_level: "System",
        justification: "Needs real infrastructure to test addition.",
        test_description: "Deploy the full system and call the endpoint.",
        plan_consistent: true,
        level_probabilities: { Unit: 0.05, Integration: 0.1, System: 0.7, Agentic: 0.1, Workflow: 0.05 },
      }],
    });
    const gt = makeGroundTruth({
      behaviors: [{ behavior_id: 1, ground_truth_level: "Unit" }],
    });
    const result = scoreOutput(output, gt);

    expect(result.sufficiency).toBe(1.0);
    expect(result.precision).toBe(0.3);  // distance 2
    expect(result.under_test_count).toBe(0);
    expect(result.over_test_count).toBe(1);
  });

  it("plan_consistent=false with note gives 0.5 consistency", () => {
    const output = makeProbeOutput({
      behaviors: [{
        behavior_id: 1,
        description: "Returns sum",
        minimum_level: "Unit",
        justification: "Direct function call suffices.",
        test_description: "Call the function.",
        plan_consistent: false,
        plan_consistent_note: "Actually needs Integration to test DB interaction.",
        level_probabilities: { Unit: 0.5, Integration: 0.4, System: 0.05, Agentic: 0.03, Workflow: 0.02 },
      }],
    });
    const gt = makeGroundTruth();
    const result = scoreOutput(output, gt);
    expect(result.consistency).toBe(0.5);
  });

  it("plan_consistent=false without note gives 0.0 consistency", () => {
    const output = makeProbeOutput({
      behaviors: [{
        behavior_id: 1,
        description: "Returns sum",
        minimum_level: "Unit",
        justification: "Direct function call suffices.",
        test_description: "Call the function.",
        plan_consistent: false,
        level_probabilities: { Unit: 0.5, Integration: 0.4, System: 0.05, Agentic: 0.03, Workflow: 0.02 },
      }],
    });
    const gt = makeGroundTruth();
    const result = scoreOutput(output, gt);
    expect(result.consistency).toBe(0.0);
  });

  it("computes cross-entropy loss from level_probabilities", () => {
    const output = makeProbeOutput({
      behaviors: [{
        behavior_id: 1,
        description: "Returns sum",
        minimum_level: "Unit",
        justification: "Pure function.",
        test_description: "Call directly.",
        plan_consistent: true,
        level_probabilities: { Unit: 1.0, Integration: 0.0, System: 0.0, Agentic: 0.0, Workflow: 0.0 },
      }],
    });
    const gt = makeGroundTruth();
    const result = scoreOutput(output, gt);
    // p_correct = 1.0, clamped to 1.0, loss = -log(1.0) * weight(Unit=1) = 0
    expect(result.total_loss).toBeCloseTo(0.0, 3);
  });

  it("clamps near-zero probability to avoid infinite loss", () => {
    const output = makeProbeOutput({
      behaviors: [{
        behavior_id: 1,
        description: "Returns sum",
        minimum_level: "Unit",
        justification: "Pure function.",
        test_description: "Call directly.",
        plan_consistent: true,
        level_probabilities: { Unit: 0.0, Integration: 1.0, System: 0.0, Agentic: 0.0, Workflow: 0.0 },
      }],
    });
    const gt = makeGroundTruth();  // GT is Unit
    const result = scoreOutput(output, gt);
    // p_correct ≈ 0, clamped to 0.001 → loss = -log(0.001) * 1 ≈ 6.9
    expect(result.total_loss).toBeCloseTo(-Math.log(0.001), 2);
    expect(isFinite(result.total_loss)).toBe(true);
  });

  it("throws on task_id mismatch", () => {
    const output = makeProbeOutput({ task_id: "EC-02" });
    const gt = makeGroundTruth({ task_id: "EC-01" });
    expect(() => scoreOutput(output, gt)).toThrow("task_id mismatch");
  });

  it("throws when behavior has no GT entry", () => {
    const output = makeProbeOutput({
      behaviors: [{
        behavior_id: 99,
        description: "Unknown behavior",
        minimum_level: "Unit",
        justification: "Justification text here.",
        test_description: "Test description here.",
        plan_consistent: true,
        level_probabilities: { Unit: 1, Integration: 0, System: 0, Agentic: 0, Workflow: 0 },
      }],
    });
    const gt = makeGroundTruth();  // only has behavior_id: 1
    expect(() => scoreOutput(output, gt)).toThrow("No GT for behavior_id 99");
  });

  it("row weights match GT level: Unit=1, Integration=2, System=3, Agentic=4, Workflow=4", () => {
    const expectedWeights: Record<string, number> = {
      Unit: 1, Integration: 2, System: 3, Agentic: 4, Workflow: 4,
    };
    for (const [level, weight] of Object.entries(expectedWeights)) {
      const output = makeProbeOutput({
        behaviors: [{
          behavior_id: 1,
          description: "Behavior",
          minimum_level: level as never,
          justification: "Justification text here.",
          test_description: "Test description here.",
          plan_consistent: true,
          level_probabilities: { Unit: 0.2, Integration: 0.2, System: 0.2, Agentic: 0.2, Workflow: 0.2 },
        }],
      });
      const gt = makeGroundTruth({
        behaviors: [{ behavior_id: 1, ground_truth_level: level as never }],
      });
      const result = scoreOutput(output, gt);
      expect(result.rows[0].weight).toBe(weight);
    }
  });

  it("counts critical misses for System+ behaviors", () => {
    const output = makeProbeOutput({
      behaviors: [
        {
          behavior_id: 1,
          description: "System behavior under-predicted",
          minimum_level: "Unit",  // under by 2
          justification: "Can be unit tested.",
          test_description: "Call function directly.",
          plan_consistent: true,
          level_probabilities: { Unit: 0.7, Integration: 0.2, System: 0.05, Agentic: 0.03, Workflow: 0.02 },
        },
      ],
    });
    const gt = makeGroundTruth({
      behaviors: [{ behavior_id: 1, ground_truth_level: "System" }],
    });
    const result = scoreOutput(output, gt);
    expect(result.critical_miss_count).toBe(1);
    expect(result.critical_total).toBe(1);
  });
});

describe("buildMetrics", () => {
  it("returns empty object for empty results array", () => {
    expect(buildMetrics([])).toEqual({});
  });

  it("returns all expected keys for a single result", () => {
    const output = makeProbeOutput();
    const gt = makeGroundTruth();
    const result = scoreOutput(output, gt);
    const metrics = buildMetrics([result]);
    expect(metrics).toHaveProperty("sufficiency");
    expect(metrics).toHaveProperty("precision");
    expect(metrics).toHaveProperty("consistency");
    expect(metrics).toHaveProperty("structure");
    expect(metrics).toHaveProperty("critical_miss_rate");
    expect(metrics).toHaveProperty("loss");
    expect(metrics).toHaveProperty("score");
  });

  it("score is 0–100 (not 0–1)", () => {
    const result = scoreOutput(makeProbeOutput(), makeGroundTruth());
    const { score } = buildMetrics([result]);
    expect(score).toBeGreaterThan(1);  // not a 0-1 fraction
    expect(score).toBeLessThanOrEqual(100);
  });

  it("critical_miss_rate is 0 when no System+ behaviors missed", () => {
    const result = scoreOutput(makeProbeOutput(), makeGroundTruth());
    expect(buildMetrics([result]).critical_miss_rate).toBe(0);
  });

  it("critical_miss_rate is 1.0 when all System+ behaviors are missed", () => {
    const output = makeProbeOutput({
      behaviors: [{
        behavior_id: 1, description: "System behavior", minimum_level: "Unit",
        justification: "j", test_description: "t", plan_consistent: true,
        level_probabilities: { Unit: 1, Integration: 0, System: 0, Agentic: 0, Workflow: 0 },
      }],
    });
    const gt = makeGroundTruth({ behaviors: [{ behavior_id: 1, ground_truth_level: "System" }] });
    const result = scoreOutput(output, gt);
    expect(buildMetrics([result]).critical_miss_rate).toBe(1.0);
  });

  it("averages sub-metrics across multiple results", () => {
    const perfect = scoreOutput(makeProbeOutput(), makeGroundTruth());
    const under = scoreOutput(
      makeProbeOutput({
        behaviors: [{
          behavior_id: 1, description: "d", minimum_level: "Unit",
          justification: "j", test_description: "t", plan_consistent: true,
          level_probabilities: { Unit: 0.7, Integration: 0.2, System: 0.05, Agentic: 0.03, Workflow: 0.02 },
        }],
      }),
      makeGroundTruth({ behaviors: [{ behavior_id: 1, ground_truth_level: "Integration" }] })
    );
    const metrics = buildMetrics([perfect, under]);
    // Sufficiency should be average of 1.0 and 0.4 = 0.7
    expect(metrics.sufficiency).toBeCloseTo(0.7, 5);
  });

  it("loss is sum (not average) across results", () => {
    const r1 = scoreOutput(makeProbeOutput(), makeGroundTruth());
    const r2 = scoreOutput(makeProbeOutput(), makeGroundTruth());
    expect(buildMetrics([r1, r2]).loss).toBeCloseTo(r1.total_loss + r2.total_loss, 5);
  });
});

describe("IterationResult schema — metrics field backward compat", () => {
  const base = {
    iteration: 1, timestamp: "2026-03-28T12:00:00Z",
    commit: "abc1234", run_dir: "20260328-120000", idea_id: null,
    score: 87.2, loss: 368.08, delta: -10,
    status: "keep" as const, description: "test iteration",
    section: "LEVEL-DEFS", edit_type: "replace" as const,
  };

  it("parses existing records without metrics field (backward compat)", () => {
    expect(() => IterationResult.parse(base)).not.toThrow();
    const result = IterationResult.parse(base);
    expect(result.metrics).toBeUndefined();
  });

  it("parses new records with metrics field", () => {
    const withMetrics = { ...base, metrics: { sufficiency: 0.72, precision: 0.65, loss: 368.08, score: 87.2 } };
    const result = IterationResult.parse(withMetrics);
    expect(result.metrics?.sufficiency).toBe(0.72);
  });

  it("metrics values must be numbers", () => {
    const bad = { ...base, metrics: { sufficiency: "high" } };
    expect(() => IterationResult.parse(bad)).toThrow();
  });
});
