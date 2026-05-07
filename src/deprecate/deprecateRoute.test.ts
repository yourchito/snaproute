import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach } from "vitest";
import {
  deprecateRoute,
  undeprecateRoute,
  listDeprecations,
  resolveDeprecationFilePath,
  loadDeprecations,
} from "./deprecateRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-deprecate-"));
}

describe("deprecateRoute", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  it("marks a route as deprecated", () => {
    const result = deprecateRoute("users/[id]", "Legacy endpoint", tmpDir);
    expect(result.action).toBe("deprecated");
    expect(result.route).toBe("users/[id]");
    expect(result.entry?.reason).toBe("Legacy endpoint");
    expect(result.entry?.since).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("stores replacement when provided", () => {
    const result = deprecateRoute("users/[id]", "Old format", tmpDir, "v2/users/[id]");
    expect(result.entry?.replacement).toBe("v2/users/[id]");
  });

  it("returns already-deprecated if route exists", () => {
    deprecateRoute("users/[id]", "First deprecation", tmpDir);
    const result = deprecateRoute("users/[id]", "Second attempt", tmpDir);
    expect(result.action).toBe("already-deprecated");
  });

  it("persists deprecation to disk", () => {
    deprecateRoute("posts", "Deprecated", tmpDir);
    const filePath = resolveDeprecationFilePath(tmpDir);
    const entries = loadDeprecations(filePath);
    expect(entries).toHaveLength(1);
    expect(entries[0].route).toBe("posts");
  });
});

describe("undeprecateRoute", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  it("removes a deprecated route", () => {
    deprecateRoute("orders", "Old", tmpDir);
    const result = undeprecateRoute("orders", tmpDir);
    expect(result.action).toBe("undeprecated");
    expect(result.entry?.route).toBe("orders");
  });

  it("returns not-found if route was never deprecated", () => {
    const result = undeprecateRoute("nonexistent", tmpDir);
    expect(result.action).toBe("not-found");
  });

  it("removes entry from file after undeprecating", () => {
    deprecateRoute("orders", "Old", tmpDir);
    undeprecateRoute("orders", tmpDir);
    const entries = listDeprecations(tmpDir);
    expect(entries).toHaveLength(0);
  });
});

describe("listDeprecations", () => {
  it("returns empty array when no file exists", () => {
    const tmpDir = makeTempDir();
    const entries = listDeprecations(tmpDir);
    expect(entries).toEqual([]);
  });

  it("returns all deprecated routes", () => {
    const tmpDir = makeTempDir();
    deprecateRoute("a", "reason a", tmpDir);
    deprecateRoute("b", "reason b", tmpDir);
    const entries = listDeprecations(tmpDir);
    expect(entries).toHaveLength(2);
    expect(entries.map((e) => e.route)).toContain("a");
    expect(entries.map((e) => e.route)).toContain("b");
  });
});
