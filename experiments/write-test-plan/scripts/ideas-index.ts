#!/usr/bin/env npx tsx
/**
 * ideas-index.ts — Extract frontmatter from all ideas/*.md as a structured index.
 *
 * Usage:
 *   npx tsx scripts/ideas-index.ts              # YAML frontmatter blocks (default)
 *   npx tsx scripts/ideas-index.ts --json       # JSON array of all ideas
 *   npx tsx scripts/ideas-index.ts --table      # Aligned table for terminal
 *   npx tsx scripts/ideas-index.ts --by-status  # Grouped by status
 *   npx tsx scripts/ideas-index.ts --by-target  # Grouped by target pattern
 */

import { readdirSync, readFileSync } from "fs";
import { join, basename } from "path";

interface IdeaFrontmatter {
  id: string;
  title: string;
  status: string;
  effort: string;
  expected_impact: string;
  targets: string[];
  confusion_pairs: string[];
  change_type: string;
  risk: string;
  prereqs?: string;
  related?: string[];
  file: string;
}

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result: Record<string, unknown> = {};
  let currentKey = "";
  let currentList: string[] | null = null;

  for (const line of yaml.split("\n")) {
    // List item
    if (line.match(/^\s+-\s+/) && currentList !== null) {
      currentList.push(line.replace(/^\s+-\s+/, "").trim());
      continue;
    }

    // Flush previous list
    if (currentList !== null) {
      result[currentKey] = currentList;
      currentList = null;
    }

    // Key: value
    const kvMatch = line.match(/^(\w[\w_-]*):\s*(.*)/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();

      if (value === "" || value === "null") {
        // Could be a list starting on next line, or null
        currentList = [];
      } else if (value.startsWith("[") && value.endsWith("]")) {
        // Inline array: [a, b, c]
        result[currentKey] = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim());
      } else {
        result[currentKey] = value;
      }
    }
  }

  // Flush final list
  if (currentList !== null) {
    result[currentKey] = currentList.length > 0 ? currentList : null;
  }

  return result;
}

function loadIdeas(dir: string): IdeaFrontmatter[] {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();

  return files.map((f) => {
    const content = readFileSync(join(dir, f), "utf8");
    const fm = parseFrontmatter(content);
    return {
      id: (fm.id as string) || basename(f, ".md"),
      title: (fm.title as string) || "",
      status: (fm.status as string) || "unknown",
      effort: (fm.effort as string) || "unknown",
      expected_impact: (fm.expected_impact as string) || "unknown",
      targets: (fm.targets as string[]) || [],
      confusion_pairs: (fm.confusion_pairs as string[]) || [],
      change_type: (fm.change_type as string) || "unknown",
      risk: (fm.risk as string) || "",
      prereqs: (fm.prereqs as string) || undefined,
      related: (fm.related as string[]) || undefined,
      file: f,
    };
  });
}

function printYaml(ideas: IdeaFrontmatter[]) {
  for (const idea of ideas) {
    console.log(`--- ${idea.id} ---`);
    console.log(`title: ${idea.title}`);
    console.log(`status: ${idea.status}`);
    console.log(`effort: ${idea.effort}`);
    console.log(`expected_impact: ${idea.expected_impact}`);
    console.log(`targets: ${idea.targets.join(", ")}`);
    console.log(`confusion_pairs: ${idea.confusion_pairs.join(", ")}`);
    console.log(`change_type: ${idea.change_type}`);
    console.log(`risk: ${idea.risk}`);
    console.log("");
  }
}

function printJson(ideas: IdeaFrontmatter[]) {
  console.log(JSON.stringify(ideas, null, 2));
}

function printTable(ideas: IdeaFrontmatter[]) {
  const statusEmoji: Record<string, string> = {
    proposed: " ",
    trying: "~",
    kept: "+",
    rejected: "x",
    parked: "-",
  };

  // Header
  console.log(
    `${"STATUS".padEnd(4)} ${"ID".padEnd(32)} ${"EFFORT".padEnd(7)} ${"IMPACT".padEnd(7)} ${"TYPE".padEnd(14)} TARGETS`
  );
  console.log("-".repeat(100));

  for (const idea of ideas) {
    const s = statusEmoji[idea.status] || "?";
    console.log(
      `[${s}]  ${idea.id.padEnd(32)} ${idea.effort.padEnd(7)} ${idea.expected_impact.padEnd(7)} ${idea.change_type.padEnd(14)} ${idea.targets.join(", ")}`
    );
  }

  console.log("");
  console.log(
    `Legend: [ ] proposed  [~] trying  [+] kept  [x] rejected  [-] parked`
  );
  console.log(`Total: ${ideas.length} ideas`);

  const counts = ideas.reduce(
    (acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  console.log(
    `Breakdown: ${Object.entries(counts)
      .map(([k, v]) => `${v} ${k}`)
      .join(", ")}`
  );
}

function printByStatus(ideas: IdeaFrontmatter[]) {
  const groups: Record<string, IdeaFrontmatter[]> = {};
  for (const idea of ideas) {
    (groups[idea.status] ||= []).push(idea);
  }

  const order = ["kept", "trying", "proposed", "rejected", "parked"];
  for (const status of order) {
    if (!groups[status]) continue;
    console.log(`\n## ${status.toUpperCase()} (${groups[status].length})\n`);
    for (const idea of groups[status]) {
      console.log(
        `- **${idea.id}** [${idea.effort}/${idea.expected_impact}] — ${idea.title}`
      );
      console.log(`  targets: ${idea.targets.join(", ")}`);
    }
  }
}

function printByTarget(ideas: IdeaFrontmatter[]) {
  const groups: Record<string, IdeaFrontmatter[]> = {};
  for (const idea of ideas) {
    for (const target of idea.targets) {
      (groups[target] ||= []).push(idea);
    }
  }

  for (const [target, targetIdeas] of Object.entries(groups).sort()) {
    console.log(`\n## ${target} (${targetIdeas.length} ideas)\n`);
    for (const idea of targetIdeas) {
      const s =
        idea.status === "kept"
          ? "+"
          : idea.status === "rejected"
            ? "x"
            : " ";
      console.log(
        `[${s}] ${idea.id} [${idea.effort}/${idea.expected_impact}] — ${idea.risk.slice(0, 80)}`
      );
    }
  }
}

// Main
import { PATHS } from "./paths";
const ideas = loadIdeas(PATHS.ideas);
const flag = process.argv[2];

switch (flag) {
  case "--json":
    printJson(ideas);
    break;
  case "--table":
    printTable(ideas);
    break;
  case "--by-status":
    printByStatus(ideas);
    break;
  case "--by-target":
    printByTarget(ideas);
    break;
  default:
    printYaml(ideas);
}
