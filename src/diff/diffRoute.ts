import fs from "fs";
import path from "path";

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber: number;
}

export interface DiffResult {
  filePath: string;
  exists: boolean;
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
}

export function diffRoute(
  filePath: string,
  newContent: string
): DiffResult {
  const exists = fs.existsSync(filePath);

  if (!exists) {
    const lines = newContent.split("\n").map((content, i) => ({
      type: "added" as const,
      content,
      lineNumber: i + 1,
    }));
    return {
      filePath,
      exists: false,
      lines,
      addedCount: lines.length,
      removedCount: 0,
    };
  }

  const existing = fs.readFileSync(filePath, "utf-8");
  const oldLines = existing.split("\n");
  const newLines = newContent.split("\n");

  const diffLines: DiffLine[] = [];
  const maxLen = Math.max(oldLines.length, newLines.length);
  let addedCount = 0;
  let removedCount = 0;

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === undefined) {
      diffLines.push({ type: "added", content: newLine, lineNumber: i + 1 });
      addedCount++;
    } else if (newLine === undefined) {
      diffLines.push({ type: "removed", content: oldLine, lineNumber: i + 1 });
      removedCount++;
    } else if (oldLine !== newLine) {
      diffLines.push({ type: "removed", content: oldLine, lineNumber: i + 1 });
      diffLines.push({ type: "added", content: newLine, lineNumber: i + 1 });
      removedCount++;
      addedCount++;
    } else {
      diffLines.push({ type: "unchanged", content: oldLine, lineNumber: i + 1 });
    }
  }

  return { filePath, exists: true, lines: diffLines, addedCount, removedCount };
}
