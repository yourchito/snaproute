import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  resolveAliasFilePath,
  loadAliases,
  saveAliases,
  addAlias,
  resolveAlias,
  removeAlias,
} from "./aliasRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-alias-test-"));
}

describe("resolveAliasFilePath", () => {
  it("returns a path ending in .snaproute-aliases.json", () => {
    const result = resolveAliasFilePath("/some/dir");
    expect(result).toMatch(/\.snaproute-aliases\.json$/);
  });

  it("resolves relative to provided base dir", () => {
    const result = resolveAliasFilePath("/my/project");
    expect(result).toBe("/my/project/.snaproute-aliases.json");
  });
});

describe("loadAliases", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty object when alias file does not exist", () => {
    const aliases = loadAliases(tmpDir);
    expect(aliases).toEqual({});
  });

  it("returns parsed aliases when file exists", () => {
    const aliasFile = resolveAliasFilePath(tmpDir);
    fs.writeFileSync(aliasFile, JSON.stringify({ users: "api/users" }), "utf-8");
    const aliases = loadAliases(tmpDir);
    expect(aliases).toEqual({ users: "api/users" });
  });
});

describe("saveAliases", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("writes aliases to file as formatted JSON", () => {
    saveAliases(tmpDir, { posts: "api/posts" });
    const aliasFile = resolveAliasFilePath(tmpDir);
    const content = fs.readFileSync(aliasFile, "utf-8");
    expect(JSON.parse(content)).toEqual({ posts: "api/posts" });
  });
});

describe("addAlias", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("adds a new alias and returns success result", () => {
    const result = addAlias(tmpDir, "auth", "api/auth/login");
    expect(result.success).toBe(true);
    expect(result.alias).toBe("auth");
    expect(result.target).toBe("api/auth/login");
    const aliases = loadAliases(tmpDir);
    expect(aliases["auth"]).toBe("api/auth/login");
  });

  it("returns failure if alias already exists", () => {
    addAlias(tmpDir, "auth", "api/auth/login");
    const result = addAlias(tmpDir, "auth", "api/auth/register");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/i);
  });
});

describe("resolveAlias", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns the target path for a known alias", () => {
    addAlias(tmpDir, "products", "api/products");
    const target = resolveAlias(tmpDir, "products");
    expect(target).toBe("api/products");
  });

  it("returns null for an unknown alias", () => {
    const target = resolveAlias(tmpDir, "nonexistent");
    expect(target).toBeNull();
  });
});

describe("removeAlias", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("removes an existing alias and returns success", () => {
    addAlias(tmpDir, "orders", "api/orders");
    const result = removeAlias(tmpDir, "orders");
    expect(result.success).toBe(true);
    expect(resolveAlias(tmpDir, "orders")).toBeNull();
  });

  it("returns failure when alias does not exist", () => {
    const result = removeAlias(tmpDir, "ghost");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });
});
