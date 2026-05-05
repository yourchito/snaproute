import type { RouteCompareResult } from "./compareRoutes";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";

function c(color: string, text: string): string {
  return `${color}${text}${RESET}`;
}

export function printCompareResult(result: RouteCompareResult): void {
  console.log();
  console.log(c(BOLD, `Comparing routes:`));
  console.log(c(DIM, `  A: ${result.routeA}`));
  console.log(c(DIM, `  B: ${result.routeB}`));
  console.log();

  if (result.matching.length > 0) {
    console.log(c(CYAN, `Matching routes (${result.matching.length}):`) );
    for (const r of result.matching) {
      const diff = result.methodDiff[r];
      if (diff) {
        console.log(
          c(YELLOW, `  ~ ${r}`) +
            c(DIM, `  [A: ${diff.a.join(", ") || "none"} | B: ${diff.b.join(", ") || "none"}]`)
        );
      } else {
        console.log(c(GREEN, `  ✓ ${r}`));
      }
    }
    console.log();
  }

  if (result.onlyInA.length > 0) {
    console.log(c(RED, `Only in A (${result.onlyInA.length}):`) );
    for (const r of result.onlyInA) {
      console.log(c(RED, `  - ${r}`));
    }
    console.log();
  }

  if (result.onlyInB.length > 0) {
    console.log(c(GREEN, `Only in B (${result.onlyInB.length}):`) );
    for (const r of result.onlyInB) {
      console.log(c(GREEN, `  + ${r}`));
    }
    console.log();
  }
}

export function printCompareSummary(result: RouteCompareResult): void {
  const total =
    result.matching.length + result.onlyInA.length + result.onlyInB.length;
  const diffs = Object.keys(result.methodDiff).length;
  console.log(
    c(BOLD, `Summary:`) +
      ` ${total} route(s) compared — ` +
      c(GREEN, `${result.matching.length} shared`) +
      `, ` +
      c(RED, `${result.onlyInA.length} only in A`) +
      `, ` +
      c(GREEN, `${result.onlyInB.length} only in B`) +
      (diffs > 0 ? `, ` + c(YELLOW, `${diffs} method diff(s)`) : ``)
  );
}
