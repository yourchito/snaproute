import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  lockRoute,
  unlockRoute,
  isRouteLocked,
  listLockedRoutes,
  resolveLockFilePath,
} from "./lockRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-lock-"));
}

describe("lockRoute", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("locks a route successfully", () => {
    const result = lockRoute(tmpDir, "users");
    expect(result.success).toBe(true);
    expect(result.action).toBe("lock");
    expect(result.message).toContain("users");
  });

  it("returns alreadyLocked when locking again", () => {
    lockRoute(tmpDir, "users");
    const result = lockRoute(tmpDir, "users");
    expect(result.success).toBe(false);
    expect(result.alreadyLocked).toBe(true);
  });

  it("stores reason in lock entry", () => {
    lockRoute(tmpDir, "orders", "Do not modify");
    const entries = listLockedRoutes(tmpDir);
    expect(entries[0].reason).toBe("Do not modify");
  });

  it("unlocks a locked route", () => {
    lockRoute(tmpDir, "products");
    const result = unlockRoute(tmpDir, "products");
    expect(result.success).toBe(true);
    expect(result.action).toBe("unlock");
  });

  it("fails to unlock a non-locked route", () => {
    const result = unlockRoute(tmpDir, "unknown");
    expect(result.success).toBe(false);
  });

  it("isRouteLocked returns true for locked route", () => {
    lockRoute(tmpDir, "auth");
    expect(isRouteLocked(tmpDir, "auth")).toBe(true);
  });

  it("isRouteLocked returns false for unlocked route", () => {
    expect(isRouteLocked(tmpDir, "auth")).toBe(false);
  });

  it("listLockedRoutes returns all locked entries", () => {
    lockRoute(tmpDir, "a");
    lockRoute(tmpDir, "b");
    const entries = listLockedRoutes(tmpDir);
    expect(entries).toHaveLength(2);
    expect(entries.map((e) => e.route)).toContain("a");
    expect(entries.map((e) => e.route)).toContain("b");
  });

  it("persists locks to the correct file path", () => {
    lockRoute(tmpDir, "persist");
    const lockFile = resolveLockFilePath(tmpDir);
    expect(fs.existsSync(lockFile)).toBe(true);
    const raw = JSON.parse(fs.readFileSync(lockFile, "utf-8"));
    expect(raw.locked[0].route).toBe("persist");
  });

  it("returns empty list when no locks file exists", () => {
    const entries = listLockedRoutes(tmpDir);
    expect(entries).toEqual([]);
  });
});
