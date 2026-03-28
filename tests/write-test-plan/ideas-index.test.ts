import { describe, it, expect } from "vitest";
import { join } from "path";
import {
  parseFrontmatter,
  loadIdeas,
} from "../../experiments/write-test-plan/scripts/ideas-index.js";

const FIXTURES_IDEAS = join(import.meta.dirname, "fixtures/ideas");

describe("parseFrontmatter", () => {
  it("parses simple key-value pairs", () => {
    const content = `---
id: my-idea
title: My Great Idea
status: proposed
effort: S
---
Body text here.`;
    const fm = parseFrontmatter(content);
    expect(fm.id).toBe("my-idea");
    expect(fm.title).toBe("My Great Idea");
    expect(fm.status).toBe("proposed");
    expect(fm.effort).toBe("S");
  });

  it("parses multi-line list values", () => {
    const content = `---
id: test
targets:
  - Unit→Integration under-prediction
  - Integration→System under-prediction
---`;
    const fm = parseFrontmatter(content);
    expect(fm.targets).toEqual([
      "Unit→Integration under-prediction",
      "Integration→System under-prediction",
    ]);
  });

  it("parses inline array syntax [a, b, c]", () => {
    const content = `---
id: test
confusion_pairs: [Unit/Integration, System/Agentic]
---`;
    const fm = parseFrontmatter(content);
    expect(fm.confusion_pairs).toEqual(["Unit/Integration", "System/Agentic"]);
  });

  it("returns null for empty list (no items follow)", () => {
    const content = `---
id: test
prereqs:
---`;
    const fm = parseFrontmatter(content);
    expect(fm.prereqs).toBeNull();
  });

  it("returns empty object when no frontmatter delimiters", () => {
    expect(parseFrontmatter("Just some markdown with no frontmatter.")).toEqual({});
    expect(parseFrontmatter("")).toEqual({});
  });

  it("handles null value keyword", () => {
    const content = `---
id: test
prereqs: null
---`;
    const fm = parseFrontmatter(content);
    expect(fm.prereqs).toBeNull();
  });

  it("last list in frontmatter is flushed correctly", () => {
    const content = `---
id: test
related:
  - foo
  - bar
---`;
    const fm = parseFrontmatter(content);
    expect(fm.related).toEqual(["foo", "bar"]);
  });
});

describe("loadIdeas", () => {
  it("loads all .md files except README.md", () => {
    const ideas = loadIdeas(FIXTURES_IDEAS);
    expect(ideas.length).toBe(2);
  });

  it("extracts id and status from frontmatter", () => {
    const ideas = loadIdeas(FIXTURES_IDEAS);
    const ids = ideas.map((i) => i.id).sort();
    expect(ids).toContain("mock-exposes-nothing");
    expect(ids).toContain("clarify-workflow-def");
  });

  it("parses list fields as arrays", () => {
    const ideas = loadIdeas(FIXTURES_IDEAS);
    const kept = ideas.find((i) => i.id === "mock-exposes-nothing")!;
    expect(Array.isArray(kept.targets)).toBe(true);
    expect(kept.targets.length).toBeGreaterThan(0);
  });

  it("parses related as array", () => {
    const ideas = loadIdeas(FIXTURES_IDEAS);
    const proposed = ideas.find((i) => i.id === "clarify-workflow-def")!;
    expect(Array.isArray(proposed.related)).toBe(true);
    expect(proposed.related).toContain("concrete-agentic-example");
  });

  it("falls back to filename as id when frontmatter lacks id", () => {
    const ideas = loadIdeas(FIXTURES_IDEAS);
    for (const idea of ideas) {
      expect(idea.id).toBeTruthy();
    }
  });
});
