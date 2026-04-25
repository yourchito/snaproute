import fs from "fs";
import path from "path";
import os from "os";
import {
  loadHistory,
  appendHistory,
  clearHistory,
  formatHistoryEntry,
  resolveHistoryPath,
  HistoryEntry,
} from "./routeHistory";

describe("routeHistory", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-history-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("resolveHistoryPath returns correct path", () => {
    const result = resolveHistoryPath(tmpDir);
    expect(result).toBe(path.join(tmpDir, ".snaproute-history.json"));
  });

  it("loadHistory returns empty array when file does not exist", () => {
    const result = loadHistory(tmpDir);
    expect(result).toEqual([]);
  });

  it("appendHistory creates history file with entry", () => {
    appendHistory(
      { route: "users", methods: ["get", "post"], outputDir: "src/pages/api", docsGenerated: false },
      tmpDir
    );
    const history = loadHistory(tmpDir);
    expect(history).toHaveLength(1);
    expect(history[0].route).toBe("users");
    expect(history[0].methods).toEqual(["get", "post"]);
    expect(history[0].timestamp).toBeDefined();
  });

  it("appendHistory accumulates multiple entries", () => {
    appendHistory({ route: "users", methods: ["get"], outputDir: "src/pages/api", docsGenerated: false }, tmpDir);
    appendHistory({ route: "posts", methods: ["post"], outputDir: "src/pages/api", docsGenerated: true }, tmpDir);
    const history = loadHistory(tmpDir);
    expect(history).toHaveLength(2);
  });

  it("clearHistory removes the history file", () => {
    appendHistory({ route: "users", methods: ["get"], outputDir: "src/pages/api", docsGenerated: false }, tmpDir);
    clearHistory(tmpDir);
    expect(fs.existsSync(resolveHistoryPath(tmpDir))).toBe(false);
  });

  it("clearHistory does not throw if file does not exist", () => {
    expect(() => clearHistory(tmpDir)).not.toThrow();
  });

  it("formatHistoryEntry formats correctly without docs", () => {
    const entry: HistoryEntry = {
      route: "users",
      methods: ["get", "post"],
      outputDir: "src/pages/api",
      timestamp: "2024-01-01T00:00:00.000Z",
      docsGenerated: false,
    };
    const result = formatHistoryEntry(entry);
    expect(result).toContain("users");
    expect(result).toContain("GET, POST");
    expect(result).not.toContain("[docs]");
  });

  it("formatHistoryEntry includes [docs] when docsGenerated is true", () => {
    const entry: HistoryEntry = {
      route: "posts",
      methods: ["delete"],
      outputDir: "src/pages/api",
      timestamp: "2024-01-01T00:00:00.000Z",
      docsGenerated: true,
    };
    expect(formatHistoryEntry(entry)).toContain("[docs]");
  });
});
