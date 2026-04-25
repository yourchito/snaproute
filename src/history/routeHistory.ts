import fs from "fs";
import path from "path";

export interface HistoryEntry {
  route: string;
  methods: string[];
  outputDir: string;
  timestamp: string;
  docsGenerated: boolean;
}

const HISTORY_FILE = ".snaproute-history.json";

export function resolveHistoryPath(cwd: string = process.cwd()): string {
  return path.join(cwd, HISTORY_FILE);
}

export function loadHistory(cwd?: string): HistoryEntry[] {
  const historyPath = resolveHistoryPath(cwd);
  if (!fs.existsSync(historyPath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(historyPath, "utf-8");
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function appendHistory(
  entry: Omit<HistoryEntry, "timestamp">,
  cwd?: string
): void {
  const historyPath = resolveHistoryPath(cwd);
  const existing = loadHistory(cwd);
  const newEntry: HistoryEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };
  existing.push(newEntry);
  fs.writeFileSync(historyPath, JSON.stringify(existing, null, 2), "utf-8");
}

export function clearHistory(cwd?: string): void {
  const historyPath = resolveHistoryPath(cwd);
  if (fs.existsSync(historyPath)) {
    fs.unlinkSync(historyPath);
  }
}

export function formatHistoryEntry(entry: HistoryEntry): string {
  const methods = entry.methods.join(", ").toUpperCase();
  const docs = entry.docsGenerated ? " [docs]" : "";
  return `[${entry.timestamp}] ${entry.route} (${methods}) -> ${entry.outputDir}${docs}`;
}
