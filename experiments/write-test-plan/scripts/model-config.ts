export const SUPPORTED_CLIS = ["claude", "codex"] as const;
export type SupportedCli = (typeof SUPPORTED_CLIS)[number];

export const SUPPORTED_REASONING_EFFORTS = ["low", "medium", "high", "xhigh"] as const;
export type ReasoningEffort = (typeof SUPPORTED_REASONING_EFFORTS)[number];

export const DEFAULT_CODEX_MODEL = "gpt-5.3-codex";
export const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";
export const DEFAULT_REASONING_EFFORT: ReasoningEffort = "medium";

export function isSupportedCli(value: string): value is SupportedCli {
  return (SUPPORTED_CLIS as readonly string[]).includes(value);
}

export function isReasoningEffort(value: string): value is ReasoningEffort {
  return (SUPPORTED_REASONING_EFFORTS as readonly string[]).includes(value);
}

export function defaultModelForCli(cli: SupportedCli): string {
  return cli === "codex" ? DEFAULT_CODEX_MODEL : DEFAULT_CLAUDE_MODEL;
}
