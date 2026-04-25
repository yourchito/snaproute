import fs from "fs";
import path from "path";
import { loadHistory, clearHistory, formatHistoryEntry } from "../history/routeHistory";
import type { HistoryEntry } from "../history/routeHistory";

export interface UndoResult {
  success: boolean;
  removedFiles: string[];
  entry: HistoryEntry | null;
  error?: string;
}

export function undoLastRoute(historyPath?: string): UndoResult {
  const history = loadHistory(historyPath);

  if (history.length === 0) {
    return { success: false, removedFiles: [], entry: null, error: "No history entries found." };
  }

  const last = history[history.length - 1];
  const removedFiles: string[] = [];
  const errors: string[] = [];

  for (const filePath of last.files) {
    const resolved = path.resolve(filePath);
    if (fs.existsSync(resolved)) {
      try {
        fs.unlinkSync(resolved);
        removedFiles.push(filePath);
      } catch (err) {
        errors.push(`Failed to remove ${filePath}: ${(err as Error).message}`);
      }
    } else {
      removedFiles.push(filePath + " (already missing)");
    }
  }

  const updatedHistory = history.slice(0, -1);
  clearHistory(historyPath);
  for (const entry of updatedHistory) {
    const { appendHistory } = require("../history/routeHistory");
    appendHistory(entry, historyPath);
  }

  if (errors.length > 0) {
    return { success: false, removedFiles, entry: last, error: errors.join("\n") };
  }

  return { success: true, removedFiles, entry: last };
}

export function formatUndoResult(result: UndoResult): string {
  if (!result.success || !result.entry) {
    return `✖ Undo failed: ${result.error ?? "Unknown error"}`;
  }
  const lines = [
    `✔ Undid route: ${result.entry.routeName}`,
    `  Removed files:`,
    ...result.removedFiles.map((f) => `    - ${f}`),
  ];
  return lines.join("\n");
}
