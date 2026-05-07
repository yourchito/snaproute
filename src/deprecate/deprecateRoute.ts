import fs from "fs";
import path from "path";

export interface DeprecationEntry {
  route: string;
  reason: string;
  since: string;
  replacement?: string;
}

export interface DeprecateResult {
  route: string;
  action: "deprecated" | "undeprecated" | "already-deprecated" | "not-found";
  entry?: DeprecationEntry;
}

export function resolveDeprecationFilePath(outputDir: string): string {
  return path.join(outputDir, ".snaproute", "deprecations.json");
}

export function loadDeprecations(filePath: string): DeprecationEntry[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

export function saveDeprecations(filePath: string, entries: DeprecationEntry[]): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2));
}

export function deprecateRoute(
  route: string,
  reason: string,
  outputDir: string,
  replacement?: string
): DeprecateResult {
  const filePath = resolveDeprecationFilePath(outputDir);
  const entries = loadDeprecations(filePath);
  const existing = entries.find((e) => e.route === route);

  if (existing) {
    return { route, action: "already-deprecated", entry: existing };
  }

  const entry: DeprecationEntry = {
    route,
    reason,
    since: new Date().toISOString().split("T")[0],
    ...(replacement ? { replacement } : {}),
  };

  entries.push(entry);
  saveDeprecations(filePath, entries);
  return { route, action: "deprecated", entry };
}

export function undeprecateRoute(route: string, outputDir: string): DeprecateResult {
  const filePath = resolveDeprecationFilePath(outputDir);
  const entries = loadDeprecations(filePath);
  const index = entries.findIndex((e) => e.route === route);

  if (index === -1) {
    return { route, action: "not-found" };
  }

  const [removed] = entries.splice(index, 1);
  saveDeprecations(filePath, entries);
  return { route, action: "undeprecated", entry: removed };
}

export function listDeprecations(outputDir: string): DeprecationEntry[] {
  const filePath = resolveDeprecationFilePath(outputDir);
  return loadDeprecations(filePath);
}
