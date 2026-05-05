import type { DiffResult, DiffLine } from "./diffRoute";

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";

function colorLine(line: DiffLine): string {
  switch (line.type) {
    case "added":
      return `${GREEN}+ ${line.content}${RESET}`;
    case "removed":
      return `${RED}- ${line.content}${RESET}`;
    case "unchanged":
      return `${DIM}  ${line.content}${RESET}`;
  }
}

export function printDiff(result: DiffResult): void {
  const label = result.exists ? "Modified" : "New file";
  console.log(`\n${BOLD}${CYAN}[${label}] ${result.filePath}${RESET}`);
  console.log(`${DIM}${"-".repeat(60)}${RESET}`);

  const visibleLines = result.lines.filter(
    (l) => l.type !== "unchanged" || isNearChange(result.lines, result.lines.indexOf(l))
  );

  for (const line of visibleLines) {
    console.log(colorLine(line));
  }

  console.log(`${DIM}${"-".repeat(60)}${RESET}`);
  console.log(
    `${GREEN}+${result.addedCount} added${RESET}  ${RED}-${result.removedCount} removed${RESET}\n`
  );
}

function isNearChange(lines: DiffLine[], index: number, context = 2): boolean {
  for (let i = Math.max(0, index - context); i <= Math.min(lines.length - 1, index + context); i++) {
    if (lines[i].type !== "unchanged") return true;
  }
  return false;
}

export function printDiffSummary(results: DiffResult[]): void {
  const totalAdded = results.reduce((s, r) => s + r.addedCount, 0);
  const totalRemoved = results.reduce((s, r) => s + r.removedCount, 0);
  const newFiles = results.filter((r) => !r.exists).length;
  const modifiedFiles = results.filter((r) => r.exists).length;
  console.log(`${BOLD}Diff summary:${RESET} ${results.length} file(s) — ${CYAN}${newFiles} new${RESET}, ${YELLOW}${modifiedFiles} modified${RESET}, ${GREEN}+${totalAdded}${RESET}/${RED}-${totalRemoved}${RESET} lines`);
}
