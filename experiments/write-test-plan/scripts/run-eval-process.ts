import { spawn } from "node:child_process";
import { EXP_DIR, PATHS } from "./paths.js";

type RunEvalProcessOpts = {
  args: string[];
  timeoutMs?: number;
  streamStdout?: boolean;
  streamStderr?: boolean;
  cwd?: string;
};

export type RunEvalProcessResult = {
  stdout: string;
  stderr: string;
};

export async function runEvalProcess({
  args,
  timeoutMs,
  streamStdout = false,
  streamStderr = false,
  cwd = EXP_DIR,
}: RunEvalProcessOpts): Promise<RunEvalProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", [PATHS.runEval, ...args], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let timer: NodeJS.Timeout | undefined;

    if (timeoutMs !== undefined) {
      timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 5000).unref();
      }, timeoutMs);
    }

    child.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf-8");
      stdout += text;
      if (streamStdout) process.stdout.write(text);
    });

    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf-8");
      stderr += text;
      if (streamStderr) process.stderr.write(text);
    });

    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (timedOut) {
        reject(
          new Error(
            `run-eval.sh timed out after ${timeoutMs}ms. Full eval can be long; try --single ec-XX or mock mode.`,
          ),
        );
        return;
      }
      if (code !== 0) {
        reject(new Error(stderr.slice(0, 2000) || `run-eval.sh exited ${code}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}
