import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  resolveNamespaceFilePath,
  loadNamespaces,
  saveNamespaces,
  addRouteToNamespace,
  removeRouteFromNamespace,
  getRoutesInNamespace,
  getAllNamespaces,
} from "./namespaceRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-ns-"));
}

describe("resolveNamespaceFilePath", () => {
  it("returns path inside .snaproute dir", () => {
    const result = resolveNamespaceFilePath("/some/dir");
    expect(result).toBe("/some/dir/.snaproute/namespaces.json");
  });
});

describe("loadNamespaces", () => {
  it("returns empty object when file does not exist", () => {
    expect(loadNamespaces("/nonexistent/path/namespaces.json")).toEqual({});
  });

  it("returns parsed map from existing file", () => {
    const dir = makeTempDir();
    const filePath = path.join(dir, "namespaces.json");
    fs.writeFileSync(filePath, JSON.stringify({ auth: ["login", "logout"] }));
    expect(loadNamespaces(filePath)).toEqual({ auth: ["login", "logout"] });
  });

  it("returns empty object on malformed JSON", () => {
    const dir = makeTempDir();
    const filePath = path.join(dir, "namespaces.json");
    fs.writeFileSync(filePath, "not-json");
    expect(loadNamespaces(filePath)).toEqual({});
  });
});

describe("addRouteToNamespace", () => {
  it("adds a route to a new namespace", () => {
    const dir = makeTempDir();
    const result = addRouteToNamespace(dir, "auth", "login");
    expect(result.success).toBe(true);
    expect(getRoutesInNamespace(dir, "auth")).toContain("login");
  });

  it("does not add duplicate route", () => {
    const dir = makeTempDir();
    addRouteToNamespace(dir, "auth", "login");
    const result = addRouteToNamespace(dir, "auth", "login");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already in namespace/);
  });

  it("adds multiple routes to same namespace", () => {
    const dir = makeTempDir();
    addRouteToNamespace(dir, "api", "users");
    addRouteToNamespace(dir, "api", "posts");
    const routes = getRoutesInNamespace(dir, "api");
    expect(routes).toContain("users");
    expect(routes).toContain("posts");
  });
});

describe("removeRouteFromNamespace", () => {
  it("removes an existing route", () => {
    const dir = makeTempDir();
    addRouteToNamespace(dir, "auth", "login");
    const result = removeRouteFromNamespace(dir, "auth", "login");
    expect(result.success).toBe(true);
    expect(getRoutesInNamespace(dir, "auth")).not.toContain("login");
  });

  it("removes namespace key when empty", () => {
    const dir = makeTempDir();
    addRouteToNamespace(dir, "auth", "login");
    removeRouteFromNamespace(dir, "auth", "login");
    const all = getAllNamespaces(dir);
    expect(all["auth"]).toBeUndefined();
  });

  it("returns failure for non-existent route", () => {
    const dir = makeTempDir();
    const result = removeRouteFromNamespace(dir, "auth", "ghost");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found/);
  });
});

describe("getAllNamespaces", () => {
  it("returns all namespaces", () => {
    const dir = makeTempDir();
    addRouteToNamespace(dir, "auth", "login");
    addRouteToNamespace(dir, "admin", "dashboard");
    const all = getAllNamespaces(dir);
    expect(Object.keys(all)).toEqual(expect.arrayContaining(["auth", "admin"]));
  });
});
