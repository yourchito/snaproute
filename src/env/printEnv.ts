import type { EnvCheckResult } from "./envCheck";

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

export function printEnvResult(result: EnvCheckResult): void {
  console.log(`\n${c.bold("Env Check")} — ${c.dim(result.route)}`);

  if (result.presentVars.length === 0 && result.missingVars.length === 0) {
    console.log(c.dim("  No environment variables referenced."));
    return;
  }

  for (const v of result.presentVars) {
    console.log(`  ${c.green("✔")} ${v}`);
  }
  for (const v of result.missingVars) {
    console.log(`  ${c.red("✘")} ${v} ${c.dim("(not set)")}`);
  }

  for (const w of result.warnings) {
    console.log(`\n  ${c.yellow("⚠")}  ${w}`);
  }
}

export function printEnvSummary(results: EnvCheckResult[]): void {
  const totalMissing = results.reduce(
    (acc, r) => acc + r.missingVars.length,
    0
  );
  const totalPresent = results.reduce(
    (acc, r) => acc + r.presentVars.length,
    0
  );
  console.log(`\n${c.bold("Summary")}`);
  console.log(`  Routes checked : ${results.length}`);
  console.log(`  Vars present   : ${c.green(String(totalPresent))}`);
  console.log(
    `  Vars missing   : ${
      totalMissing > 0 ? c.red(String(totalMissing)) : c.green("0")
    }`
  );
}
