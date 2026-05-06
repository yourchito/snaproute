import { MigrateResult, formatMigrateResult } from "./migrateRoute";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

export function printMigrateResult(result: MigrateResult, dryRun = false): void {
  const label = dryRun ? `${c.yellow}[DRY RUN]${c.reset} ` : "";
  console.log(`\n${c.bold}${label}Migration Result:${c.reset}`);
  if (result.entries.length === 0) {
    console.log(`  ${c.dim}No route files found in source directory.${c.reset}`);
    return;
  }
  console.log(formatMigrateResult(result));
}

export function printMigrateSummary(result: MigrateResult, dryRun = false): void {
  const label = dryRun ? ` ${c.yellow}(dry run)${c.reset}` : "";
  console.log(`\n${c.bold}Summary${label}:${c.reset}`);
  console.log(`  ${c.green}Moved  :${c.reset} ${result.moved}`);
  console.log(`  ${c.yellow}Skipped:${c.reset} ${result.skipped}`);
  console.log(`  ${c.red}Errors :${c.reset} ${result.errors}`);
  if (dryRun) {
    console.log(`\n  ${c.dim}Run without --dry-run to apply changes.${c.reset}`);
  }
}
