import { ArchiveResult } from "./archiveRoute";

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

function c(color: string, text: string): string {
  return `${color}${text}${RESET}`;
}

export function printArchiveResult(result: ArchiveResult): void {
  if (result.success) {
    console.log(c(GREEN, `✔ Archived: ${result.route}`));
    console.log(c(DIM, `  → ${result.archivePath}`));
  } else {
    console.error(c(RED, `✖ Failed to archive: ${result.route}`));
    console.error(c(DIM, `  ${result.error}`));
  }
}

export function printRestoreResult(result: ArchiveResult): void {
  if (result.success) {
    console.log(c(GREEN, `✔ Restored: ${result.route}`));
    console.log(c(DIM, `  → ${result.archivePath}`));
  } else {
    console.error(c(RED, `✖ Failed to restore: ${result.route}`));
    console.error(c(DIM, `  ${result.error}`));
  }
}

export function printArchiveList(routes: string[]): void {
  if (routes.length === 0) {
    console.log(c(DIM, "No archived routes found."));
    return;
  }
  console.log(c(BOLD, `Archived routes (${routes.length}):`) );
  for (const route of routes) {
    console.log(c(CYAN, `  • ${route}`));
  }
}

export function printArchiveSummary(results: ArchiveResult[]): void {
  const passed = results.filter((r) => r.success).length;
  const failed = results.length - passed;
  console.log(
    c(BOLD, `\nArchive summary: `) +
      c(GREEN, `${passed} succeeded`) +
      (failed > 0 ? " / " + c(RED, `${failed} failed`) : "")
  );
}
