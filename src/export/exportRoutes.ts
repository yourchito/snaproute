import * as fs from "fs";
import * as path from "path";
import { loadHistory } from "../history/routeHistory";
import { loadAliases } from "../alias/aliasRoute";
import { loadTags } from "../tag/tagRoute";
import { loadPins } from "../pin/pinRoute";

export type ExportFormat = "json" | "csv" | "markdown";

export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  historyFile?: string;
  aliasFile?: string;
  tagFile?: string;
  pinFile?: string;
}

export interface ExportEntry {
  name: string;
  methods: string[];
  outputDir: string;
  alias?: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
}

export function buildExportEntries(options: ExportOptions): ExportEntry[] {
  const history = loadHistory(options.historyFile);
  const aliases = loadAliases(options.aliasFile);
  const tags = loadTags(options.tagFile);
  const pins = loadPins(options.pinFile);

  return history.map((entry) => ({
    name: entry.routeName,
    methods: entry.methods,
    outputDir: entry.outputDir,
    alias: aliases[entry.routeName],
    tags: tags[entry.routeName] ?? [],
    pinned: pins.includes(entry.routeName),
    createdAt: entry.createdAt,
  }));
}

export function serializeEntries(entries: ExportEntry[], format: ExportFormat): string {
  if (format === "json") {
    return JSON.stringify(entries, null, 2);
  }
  if (format === "csv") {
    const header = "name,methods,outputDir,alias,tags,pinned,createdAt";
    const rows = entries.map((e) =>
      [
        e.name,
        e.methods.join("|"),
        e.outputDir,
        e.alias ?? "",
        e.tags.join("|"),
        String(e.pinned),
        e.createdAt,
      ].join(",")
    );
    return [header, ...rows].join("\n");
  }
  // markdown
  const header = "| Name | Methods | Output Dir | Alias | Tags | Pinned | Created At |";
  const divider = "|------|---------|------------|-------|------|--------|------------|";
  const rows = entries.map(
    (e) =>
      `| ${e.name} | ${e.methods.join(", ")} | ${e.outputDir} | ${e.alias ?? ""} | ${e.tags.join(", ")} | ${e.pinned ? "✓" : ""} | ${e.createdAt} |`
  );
  return ["# Snaproute Export", "", header, divider, ...rows].join("\n");
}

export function exportRoutes(options: ExportOptions): { success: boolean; message: string } {
  const entries = buildExportEntries(options);
  if (entries.length === 0) {
    return { success: false, message: "No route history found to export." };
  }
  const content = serializeEntries(entries, options.format);
  const dir = path.dirname(options.outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(options.outputPath, content, "utf-8");
  return { success: true, message: `Exported ${entries.length} route(s) to ${options.outputPath}` };
}
