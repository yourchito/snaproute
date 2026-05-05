import fs from "fs";
import path from "path";
import { lintRoute } from "../lint/lintRoute";
import { computeRouteStats } from "../stats/routeStats";

export interface WatchEvent {
  type: "add" | "change" | "unlink";
  filePath: string;
  timestamp: Date;
}

export interface WatchOptions {
  dir: string;
  verbose?: boolean;
  onEvent?: (event: WatchEvent) => void;
}

export interface WatchSession {
  stop: () => void;
  events: WatchEvent[];
}

export function resolveWatchDir(dir: string): string {
  return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
}

export function watchRoutes(options: WatchOptions): WatchSession {
  const { dir, verbose = false, onEvent } = options;
  const resolvedDir = resolveWatchDir(dir);
  const events: WatchEvent[] = [];

  if (!fs.existsSync(resolvedDir)) {
    throw new Error(`Watch directory does not exist: ${resolvedDir}`);
  }

  const watcher = fs.watch(
    resolvedDir,
    { recursive: true },
    (eventType, filename) => {
      if (!filename || !filename.endsWith(".ts")) return;

      const filePath = path.join(resolvedDir, filename);
      const type: WatchEvent["type"] =
        eventType === "rename"
          ? fs.existsSync(filePath)
            ? "add"
            : "unlink"
          : "change";

      const event: WatchEvent = { type, filePath, timestamp: new Date() };
      events.push(event);

      if (verbose) {
        console.log(`[watch] ${type}: ${filename}`);
      }

      onEvent?.(event);
    }
  );

  return {
    stop: () => watcher.close(),
    events,
  };
}

export async function runWatchLint(filePath: string): Promise<void> {
  try {
    const results = await lintRoute(filePath);
    if (results.length > 0) {
      console.log(`[lint] Issues in ${path.basename(filePath)}:`);
      results.forEach((r) => console.log(`  ${r.severity}: ${r.message}`));
    }
  } catch {
    // file may have been deleted
  }
}
