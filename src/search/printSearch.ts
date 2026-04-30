import type { SearchResult } from "./searchRoutes";

const COLORS = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};

export function printSearchResults(results: SearchResult[], query: string): void {
  if (results.length === 0) {
    console.log(`${COLORS.yellow}No routes found matching "${query}".${COLORS.reset}`);
    return;
  }

  console.log(
    `\n${COLORS.bold}Found ${results.length} route(s) matching "${COLORS.cyan}${query}${COLORS.reset}${COLORS.bold}":${COLORS.reset}\n`
  );

  for (const result of results) {
    const methodsStr =
      result.methods.length > 0
        ? result.methods.map((m) => `${COLORS.green}${m}${COLORS.reset}`).join(", ")
        : `${COLORS.dim}none${COLORS.reset}`;

    const matchLabel = `${COLORS.dim}[matched on: ${result.matchedOn}]${COLORS.reset}`;

    console.log(`  ${COLORS.cyan}${result.routeName}${COLORS.reset}`);
    console.log(`    Methods : ${methodsStr}`);
    console.log(`    File    : ${COLORS.dim}${result.file}${COLORS.reset}`);
    console.log(`    ${matchLabel}\n`);
  }
}

export function printSearchSummary(count: number, query: string): void {
  const label = count === 1 ? "result" : "results";
  console.log(`${COLORS.dim}Search complete — ${count} ${label} for "${query}".${COLORS.reset}`);
}
