import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  addRouteToGroup,
  removeRouteFromGroup,
  listGroup,
  listAllGroups,
  loadGroups,
  resolveGroupFilePath,
} from "./groupRoutes";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-group-"));
}

describe("resolveGroupFilePath", () => {
  it("returns the correct path", () => {
    const result = resolveGroupFilePath("/some/dir");
    expect(result).toBe("/some/dir/.snaproute/groups.json");
  });
});

describe("loadGroups", () => {
  it("returns empty object when file does not exist", () => {
    const dir = makeTempDir();
    expect(loadGroups(dir)).toEqual({});
  });

  it("returns parsed groups when file exists", () => {
    const dir = makeTempDir();
    const snapDir = path.join(dir, ".snaproute");
    fs.mkdirSync(snapDir);
    fs.writeFileSync(path.join(snapDir, "groups.json"), JSON.stringify({ auth: ["login"] }));
    expect(loadGroups(dir)).toEqual({ auth: ["login"] });
  });
});

describe("addRouteToGroup", () => {
  it("adds a route to a new group", () => {
    const dir = makeTempDir();
    const result = addRouteToGroup(dir, "auth", "login");
    expect(result.success).toBe(true);
    expect(listGroup(dir, "auth")).toContain("login");
  });

  it("does not add duplicate route to group", () => {
    const dir = makeTempDir();
    addRouteToGroup(dir, "auth", "login");
    const result = addRouteToGroup(dir, "auth", "login");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already in group/);
  });

  it("can add multiple routes to the same group", () => {
    const dir = makeTempDir();
    addRouteToGroup(dir, "users", "getUser");
    addRouteToGroup(dir, "users", "createUser");
    expect(listGroup(dir, "users")).toEqual(["getUser", "createUser"]);
  });
});

describe("removeRouteFromGroup", () => {
  it("removes a route from a group", () => {
    const dir = makeTempDir();
    addRouteToGroup(dir, "auth", "login");
    const result = removeRouteFromGroup(dir, "auth", "login");
    expect(result.success).toBe(true);
    expect(listGroup(dir, "auth")).not.toContain("login");
  });

  it("deletes group when last route is removed", () => {
    const dir = makeTempDir();
    addRouteToGroup(dir, "auth", "login");
    removeRouteFromGroup(dir, "auth", "login");
    expect(listAllGroups(dir).find((g) => g.name === "auth")).toBeUndefined();
  });

  it("returns failure when route not in group", () => {
    const dir = makeTempDir();
    const result = removeRouteFromGroup(dir, "auth", "nonexistent");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found in group/);
  });
});

describe("listAllGroups", () => {
  it("returns all groups with their routes", () => {
    const dir = makeTempDir();
    addRouteToGroup(dir, "auth", "login");
    addRouteToGroup(dir, "users", "getUser");
    const groups = listAllGroups(dir);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.name)).toContain("auth");
    expect(groups.map((g) => g.name)).toContain("users");
  });

  it("returns empty array when no groups exist", () => {
    const dir = makeTempDir();
    expect(listAllGroups(dir)).toEqual([]);
  });
});
