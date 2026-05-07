import { DeprecateResult, DeprecationEntry } from "./deprecateRoute";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  gray: "\x1b[90m",
  cyan: "\x1b[36m",
};

export function printDeprecateResult(result: DeprecateResult): void {
  const { route, action, entry } = result;

  if (action === "deprecated") {
    console.log(`${c.yellow}⚠ Deprecated:${c.reset} ${c.bold}${route}${c.reset}`);
    if (entry) {
      console.log(`  ${c.gray}Reason:${c.reset}  ${entry.reason}`);
      console.log(`  ${c.gray}Since:${c.reset}   ${entry.since}`);
      if (entry.replacement) {
        console.log(`  ${c.gray}Use instead:${c.reset} ${c.cyan}${entry.replacement}${c.reset}`);
      }
    }
  } else if (action === "undeprecated") {
    console.log(`${c.green}✔ Undeprecated:${c.reset} ${c.bold}${route}${c.reset}`);
  } else if (action === "already-deprecated") {
    console.log(`${c.gray}~ Already deprecated:${c.reset} ${route}`);
    if (entry) {
      console.log(`  ${c.gray}Reason:${c.reset} ${entry.reason}`);
    }
  } else if (action === "not-found") {
    console.log(`${c.red}✘ Not found in deprecations:${c.reset} ${route}`);
  }
}

export function printDeprecationList(entries: DeprecationEntry[]): void {
  if (entries.length === 0) {
    console.log(`${c.gray}No deprecated routes.${c.reset}`);
    return;
  }
  console.log(`${c.bold}Deprecated Routes:${c.reset}`);
  for (const entry of entries) {
    console.log(`  ${c.yellow}⚠${c.reset} ${c.bold}${entry.route}${c.reset}`);
    console.log(`    ${c.gray}Reason:${c.reset} ${entry.reason}`);
    console.log(`    ${c.gray}Since:${c.reset}  ${entry.since}`);
    if (entry.replacement) {
      console.log(`    ${c.gray}Use:${c.reset}    ${c.cyan}${entry.replacement}${c.reset}`);
    }
  }
}

export function printDeprecateSummary(entries: DeprecationEntry[]): void {
  console.log(
    `\n${c.bold}Total deprecated:${c.reset} ${c.yellow}${entries.length}${c.reset} route${
      entries.length !== 1 ? "s" : ""
    }`
  );
}
