import * as fs from "fs";
import * as path from "path";

export interface TraceEntry {
  route: string;
  action: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface TraceResult {
  route: string;
  entries: TraceEntry[];
  total: number;
}

export function resolveTraceFilePath(outputDir: string): string {
  return path.join(outputDir, ".snaproute", "trace.json");
}

export function loadTrace(outputDir: string): TraceEntry[] {
  const filePath = resolveTraceFilePath(outputDir);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as TraceEntry[];
  } catch {
    return [];
  }
}

export function saveTrace(outputDir: string, entries: TraceEntry[]): void {
  const filePath = resolveTraceFilePath(outputDir);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), "utf-8");
}

export function appendTrace(
  outputDir: string,
  route: string,
  action: string,
  meta?: Record<string, unknown>
): TraceEntry {
  const entries = loadTrace(outputDir);
  const entry: TraceEntry = {
    route,
    action,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
  entries.push(entry);
  saveTrace(outputDir, entries);
  return entry;
}

export function traceRoute(outputDir: string, route: string): TraceResult {
  const all = loadTrace(outputDir);
  const entries = all.filter((e) => e.route === route);
  return { route, entries, total: entries.length };
}

export function clearTrace(outputDir: string): void {
  const filePath = resolveTraceFilePath(outputDir);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function formatTraceEntry(entry: TraceEntry): string {
  const meta = entry.meta ? ` | ${JSON.stringify(entry.meta)}` : "";
  return `[${entry.timestamp}] ${entry.route} — ${entry.action}${meta}`;
}
