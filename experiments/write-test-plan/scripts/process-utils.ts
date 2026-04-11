import { spawnSync, type SpawnSyncOptionsWithStringEncoding, type SpawnSyncReturns } from "node:child_process";

export function runCommandSync(
  command: string,
  args: string[],
  options: SpawnSyncOptionsWithStringEncoding,
): SpawnSyncReturns<string> {
  const proc = spawnSync(command, args, options);
  if (proc.error) {
    throw new Error(`${command} failed to start: ${proc.error.message}`);
  }
  return proc;
}
