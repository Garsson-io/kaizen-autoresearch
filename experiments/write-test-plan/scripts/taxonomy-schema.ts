/**
 * taxonomy-schema.ts — Canonical schema for taxonomy entries.
 *
 * Every entry stored in a taxonomy file is one JSON object on one line (JSONL).
 * Tools write entries by constructing a TaxonomyEntry and calling JSON.stringify.
 * Tools read entries by calling TaxonomyEntrySchema.safeParse(JSON.parse(line)).
 *
 * Field names are short to keep lines readable:
 *   run  — run label, e.g. "7" or "20260330-200818"
 *   task — corpus task ID, e.g. "EC-01"
 *   b    — behavior number, e.g. 1
 *   pred — what the model predicted, e.g. "Integration"
 *   gt   — ground-truth level, e.g. "Unit"
 *   w    — GT level weight (Unit=1 Integration=2 System=3 Agentic=4 Workflow=4)
 *   j    — model's public justification (full text, no truncation)
 *   t    — model's internal thinking excerpt (optional)
 *   sa   — self-aware: model's thinking contained the correct answer (optional, default false)
 *
 * Computed helpers (not stored, derived on read):
 *   pair — "pred-gt" routing key, e.g. "Integration-Unit"
 */

import { z } from "zod";

export const LEVELS = ["Unit", "Integration", "System", "Agentic", "Workflow"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_WEIGHTS: Record<Level, number> = {
  Unit: 1,
  Integration: 2,
  System: 3,
  Agentic: 4,
  Workflow: 4,
};

export const TaxonomyEntrySchema = z.object({
  run: z.string().min(1),
  task: z.string().regex(/^EC-\d+$/),
  b: z.number().int().positive(),
  pred: z.enum(LEVELS),
  gt: z.enum(LEVELS),
  w: z.number().int().positive(),
  j: z.string().min(1),
  t: z.string().optional(),
  sa: z.boolean().optional(),
});

export type TaxonomyEntry = z.infer<typeof TaxonomyEntrySchema>;

/** Routing pair key derived from an entry: "pred-gt" */
export function entryPair(e: TaxonomyEntry): string {
  return `${e.pred}-${e.gt}`;
}

/** Serialize an entry to its canonical one-line JSONL form */
export function serializeEntry(e: TaxonomyEntry): string {
  return JSON.stringify(e);
}

/** Parse a single line as a TaxonomyEntry. Returns null if the line is not a valid entry. */
export function parseEntryLine(line: string): TaxonomyEntry | null {
  if (!line.startsWith("{")) return null;
  try {
    const result = TaxonomyEntrySchema.safeParse(JSON.parse(line));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/** Extract all TaxonomyEntry objects from file content (JSONL lines only; legacy block lines ignored) */
export function parseEntriesFromContent(content: string): TaxonomyEntry[] {
  return content.split("\n").flatMap(line => {
    const e = parseEntryLine(line.trim());
    return e ? [e] : [];
  });
}
