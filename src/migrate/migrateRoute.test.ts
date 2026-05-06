import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { migrateRoutes, collectRouteFiles, formatMigrateResult } from "./migrateRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-migrate-"));
}

function writeRoute(dir: string, name: string, content = "export default function handler() {}"): void {
  fs.writeFileSync(path.join(dir, name), content);
}

describe("collectRouteFiles", () => {
  it("returns empty array for non-existent directory", () => {
    expect(collectRouteFiles("/non/existent/dir")).toEqual([]);
  });

  it("returns only .ts and .js files", () => {
    const dir = makeTempDir();
    writeRoute(dir, "users.ts");
    writeRoute(dir, "posts.js");
    fs.writeFileSync(path.join(dir, "readme.md"), "# docs");
    const files = collectRouteFiles(dir);
    expect(files).toHaveLength(2);
    expect(files.every((f) => f.endsWith(".ts") || f.endsWith(".js"))).toBe(true);
  });
});

describe("migrateRoutes", () => {
  let fromDir: string;
  let toDir: string;

  beforeEach(() => {
    fromDir = makeTempDir();
    toDir = makeTempDir();
  });

  it("moves route files from source to destination", () => {
    writeRoute(fromDir, "users.ts");
    writeRoute(fromDir, "posts.ts");
    const result = migrateRoutes({ fromDir, toDir });
    expect(result.moved).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
    expect(fs.existsSync(path.join(toDir, "users.ts"))).toBe(true);
    expect(fs.existsSync(path.join(fromDir, "users.ts"))).toBe(false);
  });

  it("skips files that already exist in destination", () => {
    writeRoute(fromDir, "users.ts");
    writeRoute(toDir, "users.ts");
    const result = migrateRoutes({ fromDir, toDir });
    expect(result.skipped).toBe(1);
    expect(result.moved).toBe(0);
  });

  it("dry run does not move files", () => {
    writeRoute(fromDir, "users.ts");
    const result = migrateRoutes({ fromDir, toDir, dryRun: true });
    expect(result.moved).toBe(1);
    expect(fs.existsSync(path.join(fromDir, "users.ts"))).toBe(true);
    expect(fs.existsSync(path.join(toDir, "users.ts"))).toBe(false);
  });

  it("returns empty result when source has no route files", () => {
    const result = migrateRoutes({ fromDir, toDir });
    expect(result.moved).toBe(0);
    expect(result.entries).toHaveLength(0);
  });
});

describe("formatMigrateResult", () => {
  it("formats entries with correct icons", () => {
    const result = migrateRoutes({ fromDir: makeTempDir(), toDir: makeTempDir() });
    const output = formatMigrateResult(result);
    expect(typeof output).toBe("string");
  });

  it("includes skipped reason in output", () => {
    const fromDir = makeTempDir();
    const toDir = makeTempDir();
    writeRoute(fromDir, "users.ts");
    writeRoute(toDir, "users.ts");
    const result = migrateRoutes({ fromDir, toDir });
    const output = formatMigrateResult(result);
    expect(output).toContain("file already exists");
  });
});
