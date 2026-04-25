import fs from "fs";
import path from "path";
import os from "os";
import { undoLastRoute, formatUndoResult } from "./undoRoute";
import { appendHistory, clearHistory } from "../history/routeHistory";

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-undo-"));
}

describe("undoLastRoute", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns error when history is empty", () => {
    const historyPath = path.join(tmpDir, "history.json");
    const result = undoLastRoute(historyPath);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no history/i);
    expect(result.entry).toBeNull();
  });

  it("removes files listed in last history entry", () => {
    const historyPath = path.join(tmpDir, "history.json");
    const routeFile = path.join(tmpDir, "users.ts");
    fs.writeFileSync(routeFile, "export default function handler() {}");

    appendHistory(
      { routeName: "users", methods: ["GET"], files: [routeFile], createdAt: new Date().toISOString() },
      historyPath
    );

    const result = undoLastRoute(historyPath);
    expect(result.success).toBe(true);
    expect(result.removedFiles).toContain(routeFile);
    expect(fs.existsSync(routeFile)).toBe(false);
  });

  it("handles already-missing files gracefully", () => {
    const historyPath = path.join(tmpDir, "history.json");
    const ghostFile = path.join(tmpDir, "ghost.ts");

    appendHistory(
      { routeName: "ghost", methods: ["POST"], files: [ghostFile], createdAt: new Date().toISOString() },
      historyPath
    );

    const result = undoLastRoute(historyPath);
    expect(result.success).toBe(true);
    expect(result.removedFiles.some((f) => f.includes("ghost.ts"))).toBe(true);
  });
});

describe("formatUndoResult", () => {
  it("formats a successful undo result", () => {
    const result = {
      success: true,
      removedFiles: ["/app/api/users.ts"],
      entry: { routeName: "users", methods: ["GET"], files: ["/app/api/users.ts"], createdAt: "2024-01-01T00:00:00.000Z" },
    };
    const output = formatUndoResult(result);
    expect(output).toMatch(/✔/);
    expect(output).toMatch(/users/);
    expect(output).toMatch(/users\.ts/);
  });

  it("formats a failed undo result", () => {
    const result = { success: false, removedFiles: [], entry: null, error: "No history entries found." };
    const output = formatUndoResult(result);
    expect(output).toMatch(/✖/);
    expect(output).toMatch(/No history entries found/);
  });
});
