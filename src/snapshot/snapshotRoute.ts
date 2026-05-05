import * as fs from "fs";
import * as path from "path";

export interface SnapshotEntry {
  route: string;
  content: string;
  createdAt: string;
}

export interface SnapshotResult {
  success: boolean;
  route: string;
  snapshotPath?: string;
  error?: string;
}

export function resolveSnapshotDir(outputDir: string): string {
  return path.join(outputDir, ".snaproute", "snapshots");
}

export function resolveSnapshotPath(outputDir: string, route: string): string {
  const safeName = route.replace(/[\/\\]/g, "__");
  return path.join(resolveSnapshotDir(outputDir), `${safeName}.json`);
}

export function loadSnapshot(outputDir: string, route: string): SnapshotEntry | null {
  const snapshotPath = resolveSnapshotPath(outputDir, route);
  if (!fs.existsSync(snapshotPath)) return null;
  try {
    const raw = fs.readFileSync(snapshotPath, "utf-8");
    return JSON.parse(raw) as SnapshotEntry;
  } catch {
    return null;
  }
}

export function saveSnapshot(outputDir: string, route: string, content: string): SnapshotResult {
  const snapshotDir = resolveSnapshotDir(outputDir);
  const snapshotPath = resolveSnapshotPath(outputDir, route);

  try {
    fs.mkdirSync(snapshotDir, { recursive: true });
    const entry: SnapshotEntry = {
      route,
      content,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(snapshotPath, JSON.stringify(entry, null, 2), "utf-8");
    return { success: true, route, snapshotPath };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, route, error: message };
  }
}

export function deleteSnapshot(outputDir: string, route: string): boolean {
  const snapshotPath = resolveSnapshotPath(outputDir, route);
  if (!fs.existsSync(snapshotPath)) return false;
  fs.rmSync(snapshotPath);
  return true;
}

export function listSnapshots(outputDir: string): string[] {
  const snapshotDir = resolveSnapshotDir(outputDir);
  if (!fs.existsSync(snapshotDir)) return [];
  return fs
    .readdirSync(snapshotDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, "").replace(/__/g, "/"));
}
