import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  resolveSnapshotDir,
  resolveSnapshotPath,
  loadSnapshot,
  saveSnapshot,
  deleteSnapshot,
  listSnapshots,
} from "./snapshotRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-snapshot-"));
}

describe("resolveSnapshotDir", () => {
  it("returns path under .snaproute/snapshots", () => {
    const result = resolveSnapshotDir("/project/routes");
    expect(result).toBe("/project/routes/.snaproute/snapshots");
  });
});

describe("resolveSnapshotPath", () => {
  it("replaces slashes with double underscores", () => {
    const result = resolveSnapshotPath("/project", "users/[id]");
    expect(result).toContain("users__[id].json");
  });
});

describe("saveSnapshot and loadSnapshot", () => {
  it("saves and loads a snapshot correctly", () => {
    const tmpDir = makeTempDir();
    const route = "api/posts";
    const content = "export default function handler() {}";

    const result = saveSnapshot(tmpDir, route, content);
    expect(result.success).toBe(true);
    expect(result.route).toBe(route);
    expect(result.snapshotPath).toBeDefined();

    const loaded = loadSnapshot(tmpDir, route);
    expect(loaded).not.toBeNull();
    expect(loaded?.route).toBe(route);
    expect(loaded?.content).toBe(content);
    expect(loaded?.createdAt).toBeDefined();
  });

  it("returns null when snapshot does not exist", () => {
    const tmpDir = makeTempDir();
    const loaded = loadSnapshot(tmpDir, "nonexistent/route");
    expect(loaded).toBeNull();
  });

  it("returns error result on write failure", () => {
    const result = saveSnapshot("/invalid/\0/path", "route", "content");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("deleteSnapshot", () => {
  it("deletes an existing snapshot and returns true", () => {
    const tmpDir = makeTempDir();
    saveSnapshot(tmpDir, "api/delete-me", "content");
    const deleted = deleteSnapshot(tmpDir, "api/delete-me");
    expect(deleted).toBe(true);
    expect(loadSnapshot(tmpDir, "api/delete-me")).toBeNull();
  });

  it("returns false when snapshot does not exist", () => {
    const tmpDir = makeTempDir();
    const deleted = deleteSnapshot(tmpDir, "api/ghost");
    expect(deleted).toBe(false);
  });
});

describe("listSnapshots", () => {
  it("returns empty array when snapshot dir does not exist", () => {
    const tmpDir = makeTempDir();
    expect(listSnapshots(tmpDir)).toEqual([]);
  });

  it("lists all saved snapshots", () => {
    const tmpDir = makeTempDir();
    saveSnapshot(tmpDir, "api/users", "a");
    saveSnapshot(tmpDir, "api/posts", "b");
    const list = listSnapshots(tmpDir);
    expect(list).toHaveLength(2);
    expect(list).toContain("api/users");
    expect(list).toContain("api/posts");
  });
});
