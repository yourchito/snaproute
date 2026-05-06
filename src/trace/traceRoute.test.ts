import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  appendTrace,
  clearTrace,
  formatTraceEntry,
  loadTrace,
  resolveTraceFilePath,
  traceRoute,
} from "./traceRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-trace-"));
}

describe("resolveTraceFilePath", () => {
  it("returns correct path inside .snaproute dir", () => {
    const result = resolveTraceFilePath("/some/dir");
    expect(result).toBe("/some/dir/.snaproute/trace.json");
  });
});

describe("loadTrace", () => {
  it("returns empty array when file does not exist", () => {
    const dir = makeTempDir();
    expect(loadTrace(dir)).toEqual([]);
  });

  it("returns empty array on malformed JSON", () => {
    const dir = makeTempDir();
    const filePath = resolveTraceFilePath(dir);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "not-json", "utf-8");
    expect(loadTrace(dir)).toEqual([]);
  });
});

describe("appendTrace", () => {
  it("creates a trace entry and persists it", () => {
    const dir = makeTempDir();
    const entry = appendTrace(dir, "users/[id]", "scaffold");
    expect(entry.route).toBe("users/[id]");
    expect(entry.action).toBe("scaffold");
    expect(entry.timestamp).toBeTruthy();
    const loaded = loadTrace(dir);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].route).toBe("users/[id]");
  });

  it("appends multiple entries", () => {
    const dir = makeTempDir();
    appendTrace(dir, "posts", "scaffold");
    appendTrace(dir, "posts", "rename", { to: "articles" });
    expect(loadTrace(dir)).toHaveLength(2);
  });

  it("stores meta when provided", () => {
    const dir = makeTempDir();
    const entry = appendTrace(dir, "items", "clone", { from: "products" });
    expect(entry.meta).toEqual({ from: "products" });
  });
});

describe("traceRoute", () => {
  it("returns only entries for the given route", () => {
    const dir = makeTempDir();
    appendTrace(dir, "users", "scaffold");
    appendTrace(dir, "posts", "scaffold");
    appendTrace(dir, "users", "rename");
    const result = traceRoute(dir, "users");
    expect(result.route).toBe("users");
    expect(result.total).toBe(2);
    expect(result.entries.every((e) => e.route === "users")).toBe(true);
  });

  it("returns zero entries for unknown route", () => {
    const dir = makeTempDir();
    const result = traceRoute(dir, "unknown");
    expect(result.total).toBe(0);
  });
});

describe("clearTrace", () => {
  it("removes the trace file", () => {
    const dir = makeTempDir();
    appendTrace(dir, "users", "scaffold");
    clearTrace(dir);
    expect(loadTrace(dir)).toEqual([]);
  });

  it("does not throw if file does not exist", () => {
    const dir = makeTempDir();
    expect(() => clearTrace(dir)).not.toThrow();
  });
});

describe("formatTraceEntry", () => {
  it("formats an entry without meta", () => {
    const entry = { route: "users", action: "scaffold", timestamp: "2024-01-01T00:00:00.000Z" };
    expect(formatTraceEntry(entry)).toContain("users — scaffold");
  });

  it("includes meta in formatted output", () => {
    const entry = { route: "users", action: "clone", timestamp: "2024-01-01T00:00:00.000Z", meta: { from: "posts" } };
    const result = formatTraceEntry(entry);
    expect(result).toContain("clone");
    expect(result).toContain("from");
  });
});
