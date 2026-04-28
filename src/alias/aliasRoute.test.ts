import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach } from "vitest";
import {
  addAlias,
  resolveAlias,
  removeAlias,
  loadAliases,
  resolveAliasFilePath,
} from "./aliasRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-alias-"));
}

describe("resolveAliasFilePath", () => {
  it("returns correct path inside outputDir", () => {
    const result = resolveAliasFilePath("/some/dir");
    expect(result).toBe("/some/dir/.snaproute-aliases.json");
  });
});

describe("addAlias", () => {
  it("adds a valid alias successfully", () => {
    const dir = makeTempDir();
    const result = addAlias("my-alias", "users/profile", dir);
    expect(result.success).toBe(true);
    expect(result.alias).toBe("my-alias");
    expect(result.routeName).toBe("users/profile");
    expect(result.resolvedPath).toContain("users/profile");
  });

  it("rejects invalid alias characters", () => {
    const dir = makeTempDir();
    const result = addAlias("my alias!", "users", dir);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid alias/);
  });

  it("rejects duplicate alias", () => {
    const dir = makeTempDir();
    addAlias("dup", "route-a", dir);
    const result = addAlias("dup", "route-b", dir);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });

  it("persists alias to file", () => {
    const dir = makeTempDir();
    addAlias("saved", "orders", dir);
    const entries = loadAliases(dir);
    expect(entries).toHaveLength(1);
    expect(entries[0].alias).toBe("saved");
    expect(entries[0].routeName).toBe("orders");
  });
});

describe("resolveAlias", () => {
  it("returns matching alias entry", () => {
    const dir = makeTempDir();
    addAlias("find-me", "products", dir);
    const entry = resolveAlias("find-me", dir);
    expect(entry).toBeDefined();
    expect(entry?.routeName).toBe("products");
  });

  it("returns undefined for unknown alias", () => {
    const dir = makeTempDir();
    const entry = resolveAlias("ghost", dir);
    expect(entry).toBeUndefined();
  });
});

describe("removeAlias", () => {
  it("removes an existing alias", () => {
    const dir = makeTempDir();
    addAlias("to-remove", "items", dir);
    const removed = removeAlias("to-remove", dir);
    expect(removed).toBe(true);
    expect(loadAliases(dir)).toHaveLength(0);
  });

  it("returns false when alias does not exist", () => {
    const dir = makeTempDir();
    const removed = removeAlias("nonexistent", dir);
    expect(removed).toBe(false);
  });
});
