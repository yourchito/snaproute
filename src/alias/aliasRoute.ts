import fs from "fs";
import path from "path";

export interface AliasEntry {
  alias: string;
  routeName: string;
  outputDir: string;
  createdAt: string;
}

export interface AliasResult {
  success: boolean;
  alias: string;
  routeName: string;
  resolvedPath: string;
  error?: string;
}

export function resolveAliasFilePath(outputDir: string): string {
  return path.join(outputDir, ".snaproute-aliases.json");
}

export function loadAliases(outputDir: string): AliasEntry[] {
  const filePath = resolveAliasFilePath(outputDir);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as AliasEntry[];
  } catch {
    return [];
  }
}

export function saveAliases(outputDir: string, entries: AliasEntry[]): void {
  const filePath = resolveAliasFilePath(outputDir);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), "utf-8");
}

export function addAlias(
  alias: string,
  routeName: string,
  outputDir: string
): AliasResult {
  if (!alias || !/^[a-zA-Z0-9_-]+$/.test(alias)) {
    return {
      success: false,
      alias,
      routeName,
      resolvedPath: "",
      error: `Invalid alias "${alias}". Only alphanumeric, dash, and underscore allowed.`,
    };
  }

  const entries = loadAliases(outputDir);
  const existing = entries.find((e) => e.alias === alias);
  if (existing) {
    return {
      success: false,
      alias,
      routeName,
      resolvedPath: "",
      error: `Alias "${alias}" already exists for route "${existing.routeName}".`,
    };
  }

  const resolvedPath = path.join(outputDir, routeName, "route.ts");
  const newEntry: AliasEntry = {
    alias,
    routeName,
    outputDir,
    createdAt: new Date().toISOString(),
  };

  saveAliases(outputDir, [...entries, newEntry]);

  return { success: true, alias, routeName, resolvedPath };
}

export function resolveAlias(
  alias: string,
  outputDir: string
): AliasEntry | undefined {
  const entries = loadAliases(outputDir);
  return entries.find((e) => e.alias === alias);
}

export function removeAlias(alias: string, outputDir: string): boolean {
  const entries = loadAliases(outputDir);
  const filtered = entries.filter((e) => e.alias !== alias);
  if (filtered.length === entries.length) return false;
  saveAliases(outputDir, filtered);
  return true;
}
