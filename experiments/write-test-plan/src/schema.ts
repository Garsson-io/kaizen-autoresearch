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

/** Ordered list of all levels, lowest to highest. */
export const LEVELS = Level.options;

/** Map from level name to its ordinal index (Unit=0 … Workflow=4). */
export const LEVEL_INDEX: Record<string, number> = Object.fromEntries(
  LEVELS.map((l, i) => [l, i])
);

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
  plan_consistent_note: z.string().nullish(),

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
  }),
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

/**
 * Schema for iteration results log (autoresearch-results.jsonl).
 * One JSON object per line, appended after each iteration.
 */
export const IterationResult = z.object({
  /** Sequential counter starting at 0 (baseline) */
  iteration: z.number().int().min(0),
  /** ISO 8601 timestamp */
  timestamp: z.string(),
  /** Short git hash (7 chars), null if reverted */
  commit: z.string().nullable(),
  /** Run directory name (e.g. "20260328-124120"), null if no run */
  run_dir: z.string().nullable(),
  /** Idea id from ideas/ that was tried, null for baseline */
  idea_id: z.string().nullable(),
  /** Legacy weighted average score 0-100 (higher is better) */
  score: z.number().nullable(),
  /** Weighted cross-entropy loss (lower is better) */
  loss: z.number().nullable(),
  /** Change from previous best (negative = improved for loss) */
  delta: z.number().nullable(),
  /** Model used for this iteration (e.g. claude-haiku-4-5-20251001, gpt-5.3-codex) */
  model: z.string().nullable().optional(),
  /** Experiment-specific sub-metrics captured at eval time (keys are scorer-defined) */
  metrics: z.record(z.string(), z.number()).optional(),
  /** baseline | keep | discard | crash | no-op | hook-blocked */
  status: z.enum(["baseline", "keep", "discard", "crash", "no-op", "hook-blocked"]),
  /** One-sentence description of what was tried */
  description: z.string(),
  /** Which named section of treatment.md was changed */
  section: z.string().nullable(),
  /** add | remove | replace */
  edit_type: z.enum(["add", "remove", "replace"]).nullable(),
});
export type IterationResult = z.infer<typeof IterationResult>;

/**
 * Schema for run statistics (run-stats.jsonl).
 * One JSON object per eval run, appended by run-stats.ts --append-log.
 */
export const RunStats = z.object({
  /** Run directory name (e.g. "20260328-150512") */
  run_dir: z.string(),
  /** Number of probes in this run */
  probes: z.number().int().min(0),
  /** Total wall-clock time across all probes (seconds) */
  total_duration_s: z.number(),
  /** Total API cost (USD) */
  total_cost_usd: z.number(),
  /** Total input tokens (including cache) */
  total_input_tokens: z.number().int(),
  /** Total output tokens */
  total_output_tokens: z.number().int(),
  /** Average time per probe (seconds) */
  avg_duration_s: z.number(),
  /** Average cost per probe (USD) */
  avg_cost_usd: z.number(),
  /** Average input tokens per probe */
  avg_input_tokens: z.number(),
  /** Average output tokens per probe */
  avg_output_tokens: z.number(),
  /** Model used */
  model: z.string(),
  /** Number of tools available to probes */
  tools_available: z.number().int(),
  /** Number of MCP servers connected */
  mcp_servers: z.number().int(),
});
export type RunStats = z.infer<typeof RunStats>;

/**
 * One row in explore-log.jsonl — result of one variation in a pre-screening explore run.
 * Stored separately from IterationResult to avoid polluting autoresearch-results.jsonl.
 */
export const ExploreResult = z.object({
  timestamp: z.string(),
  idea_id: z.string(),
  variation: z.string(),       // e.g. "v1-anti-lazy", "v2-role-anchor"
  run_dir: z.string(),         // relative path, e.g. "runs/explore/role-anchor-v2-20260328-163118"
  tasks: z.array(z.string()), // subset used, e.g. ["ec-04","ec-10"]
  baseline_loss: z.number(),
  variation_loss: z.number(),
  delta: z.number(),           // variation_loss - baseline_loss (negative = better)
  prompt_diff: z.string(),
  winner: z.boolean(),
});
export type ExploreResult = z.infer<typeof ExploreResult>;

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
