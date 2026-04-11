import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

export function readJsonl<T>(path: string, parseLine: (line: string, index: number) => T): T[] {
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, "utf8").split("\n").filter(Boolean);
  return lines.map((line, idx) => parseLine(line, idx));
}

export function appendJsonl(path: string, row: unknown): void {
  appendFileSync(path, `${JSON.stringify(row)}\n`, "utf8");
}

export function writeJsonl(path: string, rows: unknown[]): void {
  const content = rows.map((row) => JSON.stringify(row)).join("\n");
  writeFileSync(path, content.length > 0 ? `${content}\n` : "", "utf8");
}
