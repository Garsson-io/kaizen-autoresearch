export function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

export function getFlagValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx < 0) return undefined;
  return idx + 1 < args.length ? args[idx + 1] : undefined;
}

export function consumeFlag(args: string[], flag: string, consumed: Set<number>): boolean {
  const idx = args.indexOf(flag);
  if (idx < 0) return false;
  consumed.add(idx);
  return true;
}

export function consumeFlagValue(args: string[], flag: string, consumed: Set<number>): string | undefined {
  const idx = args.indexOf(flag);
  if (idx < 0) return undefined;
  consumed.add(idx);
  if (idx + 1 < args.length) {
    consumed.add(idx + 1);
    return args[idx + 1];
  }
  return undefined;
}
