import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  archiveRoute,
  restoreRoute,
  listArchives,
  resolveArchiveDir,
  resolveArchivePath,
} from "./archiveRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-archive-"));
}

function writeRoute(dir: string, route: string, content: string): void {
  const full = path.join(dir, `${route}.ts`);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

describe("resolveArchiveDir", () => {
  it("returns correct archive directory", () => {
    expect(resolveArchiveDir("/out")).toBe("/out/.snaproute/archive");
  });
});

describe("resolveArchivePath", () => {
  it("converts slashes to double underscores", () => {
    const result = resolveArchivePath("/archive", "api/users");
    expect(result).toBe("/archive/api__users.ts");
  });
});

describe("archiveRoute", () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("archives an existing route file", () => {
    writeRoute(tmpDir, "api/users", "export default function handler() {}");
    const result = archiveRoute("api/users", tmpDir);
    expect(result.success).toBe(true);
    expect(result.archivePath).toBeDefined();
    expect(fs.existsSync(path.join(tmpDir, "api/users.ts"))).toBe(false);
    expect(fs.existsSync(result.archivePath!)).toBe(true);
  });

  it("returns error if route file does not exist", () => {
    const result = archiveRoute("api/missing", tmpDir);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/);
  });

  it("returns error if archive already exists", () => {
    writeRoute(tmpDir, "api/users", "export default function handler() {}");
    archiveRoute("api/users", tmpDir);
    writeRoute(tmpDir, "api/users", "export default function handler() {}");
    const result = archiveRoute("api/users", tmpDir);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });
});

describe("restoreRoute", () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("restores an archived route", () => {
    writeRoute(tmpDir, "api/users", "export default function handler() {}");
    archiveRoute("api/users", tmpDir);
    const result = restoreRoute("api/users", tmpDir);
    expect(result.success).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "api/users.ts"))).toBe(true);
  });

  it("returns error if no archive exists", () => {
    const result = restoreRoute("api/ghost", tmpDir);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No archive found/);
  });

  it("strips archive header from restored content", () => {
    writeRoute(tmpDir, "api/items", "export const GET = () => {};");
    archiveRoute("api/items", tmpDir);
    restoreRoute("api/items", tmpDir);
    const content = fs.readFileSync(path.join(tmpDir, "api/items.ts"), "utf-8");
    expect(content).not.toMatch(/archived:/);
    expect(content).toContain("export const GET");
  });
});

describe("listArchives", () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("returns empty array when no archives exist", () => {
    expect(listArchives(tmpDir)).toEqual([]);
  });

  it("lists archived routes", () => {
    writeRoute(tmpDir, "api/orders", "export default function handler() {}");
    archiveRoute("api/orders", tmpDir);
    const list = listArchives(tmpDir);
    expect(list).toContain("api/orders");
  });
});
