import { loadHistory, formatHistoryEntry } from "./routeHistory";

export function printHistory(cwd?: string): void {
  const history = loadHistory(cwd);

  if (history.length === 0) {
    console.log("No scaffolded routes found in history.");
    return;
  }

  console.log(`\n📋 Scaffolded Routes History (${history.length} entries):\n`);
  history.forEach((entry, index) => {
    console.log(`  ${index + 1}. ${formatHistoryEntry(entry)}`);
  });
  console.log("");
}

export function printHistorySummary(cwd?: string): void {
  const history = loadHistory(cwd);

  if (history.length === 0) {
    return;
  }

  const routes = history.map((e) => e.route);
  const withDocs = history.filter((e) => e.docsGenerated).length;

  console.log(`\n📊 History Summary:`);
  console.log(`   Total routes scaffolded : ${history.length}`);
  console.log(`   Routes with docs        : ${withDocs}`);
  console.log(`   Unique route names      : ${new Set(routes).size}`);
  console.log("");
}
