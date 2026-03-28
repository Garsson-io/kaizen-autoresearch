import { z } from "zod";

/**
 * Schema for the YAML output produced by an agent evaluating a corpus task.
 *
 * The agent must output ONLY a YAML document conforming to this schema.
 * Prose is allowed inside string fields (justification, test_description,
 * plan_consistent_note) but the outer structure must be valid YAML.
 *
 * Validate locally before submitting:
 *   npx tsx src/eval-probe-schema.ts <your-output.yaml>
 */

export const Level = z.enum(["Unit", "Integration", "System", "Agentic", "Workflow"]);
export type Level = z.infer<typeof Level>;

export const BehaviorOutput = z.object({
  /** Integer matching the behavior number in the issue (1-based) */
  behavior_id: z.number().int().min(1).max(10),

  /** Copy the behavior description verbatim from the issue */
  description: z.string().min(5),

  /**
   * The LOWEST level that can catch a real failure for this behavior.
   * One of: Unit | Integration | System | Agentic | Workflow
   */
  minimum_level: Level,

  /**
   * One or more sentences explaining why the next lower level would miss
   * a real failure. Prose is welcome here.
   */
  justification: z.string().min(10),

  /**
   * A concrete description of the test. Prose allowed — describe what the
   * test does, what it asserts, what infrastructure it needs.
   */
  test_description: z.string().min(10),

  /**
   * Self-assessment: does your test_description actually exercise the
   * minimum_level you declared? Set false and explain in plan_consistent_note
   * if there is a gap.
   */
  plan_consistent: z.boolean(),

  /** Required when plan_consistent is false. Explain the gap. */
  plan_consistent_note: z.string().optional(),

  /**
   * Probability distribution over all 5 levels. Each value 0–100 (percent).
   * Will be normalized to sum to 1.0 in the scorer — don't reject if sum != 100.
   */
  level_probabilities: z.object({
    Unit: z.number().min(0),
    Integration: z.number().min(0),
    System: z.number().min(0),
    Agentic: z.number().min(0),
    Workflow: z.number().min(0),
  }).optional(),
});
export type BehaviorOutput = z.infer<typeof BehaviorOutput>;

export const ProbeOutput = z.object({
  /** e.g. EC-04 */
  task_id: z.string().regex(/^EC-\d+$/),

  /** "baseline" or "treatment" */
  condition: z.enum(["baseline", "treatment"]),

  behaviors: z.array(BehaviorOutput).min(1).max(10),
});
export type ProbeOutput = z.infer<typeof ProbeOutput>;

export const GroundTruthBehavior = z.object({
  behavior_id: z.number().int().min(1).max(10),
  ground_truth_level: Level,
  /** Why this level is the minimum — what failure would a lower level miss? */
  reasoning: z.string().optional(),
});

export const GroundTruth = z.object({
  task_id: z.string().regex(/^EC-\d+$/),
  behaviors: z.array(GroundTruthBehavior).min(1).max(10),
});
export type GroundTruth = z.infer<typeof GroundTruth>;

