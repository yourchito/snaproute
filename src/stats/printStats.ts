import type { RouteStats } from "./routeStats";

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  dim: "\x1b[2m",
};

function c(color: keyof typeof COLORS, text: string): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

export function printStats(stats: RouteStats): void {
  console.log();
  console.log(c("bold", c("cyan", "📊 snaproute — Route Statistics")));
  console.log(c("dim", "─".repeat(40)));

  console.log(
    `  ${c("bold", "Total routes:")}         ${c("green", String(stats.totalRoutes))}`
  );
  console.log(
    `  ${c("bold", "Avg methods/route:")}    ${c("yellow", String(stats.averageMethodsPerRoute))}`
  );

  if (stats.mostUsedMethods.length > 0) {
    console.log(
      `  ${c("bold", "Most used methods:")}    ${stats.mostUsedMethods
        .map((m) => c("magenta", m))
        .join(", ")}`
    );
  }

  console.log();
  console.log(c("bold", "  Method breakdown:"));
  for (const [method, count] of Object.entries(stats.methodCounts)) {
    const bar = "█".repeat(Math.min(count, 20));
    console.log(
      `    ${c("cyan", method.padEnd(8))} ${c("green", bar)} ${c("dim", `(${count})`)} `
    );
  }

  if (stats.routeNames.length > 0) {
    console.log();
    console.log(c("bold", "  Routes:"));
    for (const name of stats.routeNames) {
      console.log(`    ${c("dim", "•")} ${name}`);
    }
  }

  console.log();
  console.log(c("dim", `  Generated at: ${stats.generatedAt}`));
  console.log();
}

export function printStatsSummary(stats: RouteStats): void {
  console.log(
    `${c("cyan", "stats")} ${stats.totalRoutes} route(s) found across ${
      Object.keys(stats.methodCounts).length
    } method type(s)`
  );
}
