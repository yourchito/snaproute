import { HealthCheckResult } from "./healthCheck";

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

function statusBadge(status: HealthCheckResult["status"]): string {
  if (status === "ok") return c.green("✔ OK");
  if (status === "warn") return c.yellow("⚠ WARN");
  return c.red("✖ ERROR");
}

export function printHealthResult(result: HealthCheckResult): void {
  console.log();
  console.log(c.bold("snaproute health check") + "  " + statusBadge(result.status));
  console.log(c.dim("─".repeat(40)));
  console.log(`  Routes dir   : ${result.routesDir}`);
  console.log(`  Route files  : ${result.routeCount}`);
  console.log(`  Config found : ${result.configFound ? c.green("yes") : c.yellow("no")}`);
  console.log(`  History found: ${result.historyFound ? c.green("yes") : c.yellow("no")}`);

  if (result.issues.length > 0) {
    console.log();
    console.log(c.red(c.bold("Errors:")));
    for (const issue of result.issues) {
      console.log(c.red(`  ✖ ${issue}`));
    }
  }

  if (result.warnings.length > 0) {
    console.log();
    console.log(c.yellow(c.bold("Warnings:")));
    for (const warn of result.warnings) {
      console.log(c.yellow(`  ⚠ ${warn}`));
    }
  }

  console.log();
}

export function printHealthSummary(result: HealthCheckResult): void {
  const badge = statusBadge(result.status);
  const detail =
    result.status === "ok"
      ? `${result.routeCount} route(s) found, all checks passed.`
      : result.status === "warn"
      ? `${result.warnings.length} warning(s) detected.`
      : `${result.issues.length} error(s) detected.`;
  console.log(`Health: ${badge} — ${detail}`);
}
