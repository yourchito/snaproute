import fs from "fs";
import path from "path";

export interface MigrateOptions {
  fromDir: string;
  toDir: string;
  dryRun?: boolean;
}

export interface MigrateEntry {
  source: string;
  destination: string;
  status: "moved" | "skipped" | "error";
  reason?: string;
}

export interface MigrateResult {
  entries: MigrateEntry[];
  moved: number;
  skipped: number;
  errors: number;
}

export function collectRouteFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .map((f) => path.join(dir, f));
}

export function migrateRoutes(options: MigrateOptions): MigrateResult {
  const { fromDir, toDir, dryRun = false } = options;
  const files = collectRouteFiles(fromDir);
  const entries: MigrateEntry[] = [];

  if (!dryRun && !fs.existsSync(toDir)) {
    fs.mkdirSync(toDir, { recursive: true });
  }

  for (const src of files) {
    const filename = path.basename(src);
    const dest = path.join(toDir, filename);

    if (fs.existsSync(dest)) {
      entries.push({ source: src, destination: dest, status: "skipped", reason: "file already exists" });
      continue;
    }

    try {
      if (!dryRun) {
        fs.copyFileSync(src, dest);
        fs.unlinkSync(src);
      }
      entries.push({ source: src, destination: dest, status: "moved" });
    } catch (err: any) {
      entries.push({ source: src, destination: dest, status: "error", reason: err.message });
    }
  }

  return {
    entries,
    moved: entries.filter((e) => e.status === "moved").length,
    skipped: entries.filter((e) => e.status === "skipped").length,
    errors: entries.filter((e) => e.status === "error").length,
  };
}

export function formatMigrateResult(result: MigrateResult): string {
  const lines: string[] = [];
  for (const entry of result.entries) {
    const icon = entry.status === "moved" ? "✔" : entry.status === "skipped" ? "⚠" : "✖";
    const note = entry.reason ? ` (${entry.reason})` : "";
    lines.push(`  ${icon} ${entry.status.toUpperCase()}: ${entry.source} → ${entry.destination}${note}`);
  }
  return lines.join("\n");
}
