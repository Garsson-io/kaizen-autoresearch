import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

let spawnImpl: ((...args: unknown[]) => FakeChild) | undefined;

class FakeChild extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  kill = vi.fn((signal?: string) => {
    if (signal === "SIGTERM") {
      this.emit("close", 143);
    }
    return true;
  });
}

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return {
    ...actual,
    spawn: (...args: unknown[]) => {
      if (!spawnImpl) throw new Error(`spawn not configured: ${JSON.stringify(args)}`);
      return spawnImpl(...args);
    },
  };
});

import { runEvalProcess } from "../../experiments/write-test-plan/scripts/run-eval-process.js";

describe("runEvalProcess", () => {
  beforeEach(() => {
    spawnImpl = undefined;
  });

  it("captures stdout/stderr and resolves on exit 0", async () => {
    spawnImpl = () => {
      const child = new FakeChild();
      setTimeout(() => {
        child.stdout.emit("data", Buffer.from("hello"));
        child.stderr.emit("data", Buffer.from("warn"));
        child.emit("close", 0);
      }, 1);
      return child;
    };

    const out = await runEvalProcess({ args: ["--single", "ec-04"] });
    expect(out.stdout).toBe("hello");
    expect(out.stderr).toBe("warn");
  });

  it("times out and suggests single/mock mode", async () => {
    let childRef: FakeChild | undefined;
    spawnImpl = () => {
      childRef = new FakeChild();
      return childRef;
    };

    await expect(runEvalProcess({ args: [], timeoutMs: 5 })).rejects.toThrow(
      /Full eval can be long; try --single ec-XX or mock mode\./,
    );
    expect(childRef?.kill).toHaveBeenCalledWith("SIGTERM");
  });
});
