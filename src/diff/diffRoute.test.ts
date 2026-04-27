import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { diffRoute } from "./diffRoute";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-diff-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("diffRoute", () => {
  it("marks all lines as added when file does not exist", () => {
    const filePath = path.join(tmpDir, "nonexistent.ts");
    const result = diffRoute(filePath, "line1\nline2\nline3");
    expect(result.exists).toBe(false);
    expect(result.addedCount).toBe(3);
    expect(result.removedCount).toBe(0);
    expect(result.lines.every((l) => l.type === "added")).toBe(true);
  });

  it("returns unchanged lines when content is identical", () => {
    const filePath = path.join(tmpDir, "same.ts");
    const content = "const x = 1;\nconst y = 2;";
    fs.writeFileSync(filePath, content);
    const result = diffRoute(filePath, content);
    expect(result.exists).toBe(true);
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
    expect(result.lines.every((l) => l.type === "unchanged")).toBe(true);
  });

  it("detects added and removed lines on change", () => {
    const filePath = path.join(tmpDir, "changed.ts");
    fs.writeFileSync(filePath, "line1\nline2\nline3");
    const result = diffRoute(filePath, "line1\nlineX\nline3");
    expect(result.addedCount).toBe(1);
    expect(result.removedCount).toBe(1);
    const removed = result.lines.filter((l) => l.type === "removed");
    const added = result.lines.filter((l) => l.type === "added");
    expect(removed[0].content).toBe("line2");
    expect(added[0].content).toBe("lineX");
  });

  it("handles new file with empty content", () => {
    const filePath = path.join(tmpDir, "empty.ts");
    const result = diffRoute(filePath, "");
    expect(result.exists).toBe(false);
    expect(result.lines.length).toBe(1);
    expect(result.lines[0].type).toBe("added");
  });

  it("detects extra lines in new content", () => {
    const filePath = path.join(tmpDir, "extra.ts");
    fs.writeFileSync(filePath, "a\nb");
    const result = diffRoute(filePath, "a\nb\nc\nd");
    expect(result.addedCount).toBe(2);
    expect(result.removedCount).toBe(0);
  });
});
