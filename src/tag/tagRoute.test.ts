import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  resolveTagFilePath,
  loadTags,
  addTag,
  removeTag,
  listTagsForRoute,
  listRoutesByTag,
} from "./tagRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-tag-"));
}

describe("resolveTagFilePath", () => {
  it("returns path inside .snaproute folder", () => {
    const result = resolveTagFilePath("/some/output");
    expect(result).toBe("/some/output/.snaproute/tags.json");
  });
});

describe("loadTags", () => {
  it("returns empty object when file does not exist", () => {
    const result = loadTags("/nonexistent/tags.json");
    expect(result).toEqual({});
  });

  it("returns parsed store from existing file", () => {
    const dir = makeTempDir();
    const tagFile = path.join(dir, "tags.json");
    fs.writeFileSync(tagFile, JSON.stringify({ users: ["auth", "v1"] }), "utf-8");
    const result = loadTags(tagFile);
    expect(result).toEqual({ users: ["auth", "v1"] });
  });
});

describe("addTag", () => {
  it("adds a new tag to a route", () => {
    const dir = makeTempDir();
    const tagFile = resolveTagFilePath(dir);
    const result = addTag(tagFile, "users", "auth");
    expect(result.success).toBe(true);
    expect(result.tags).toContain("auth");
  });

  it("returns failure when tag already exists", () => {
    const dir = makeTempDir();
    const tagFile = resolveTagFilePath(dir);
    addTag(tagFile, "users", "auth");
    const result = addTag(tagFile, "users", "auth");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already exists/);
  });
});

describe("removeTag", () => {
  it("removes an existing tag from a route", () => {
    const dir = makeTempDir();
    const tagFile = resolveTagFilePath(dir);
    addTag(tagFile, "posts", "public");
    const result = removeTag(tagFile, "posts", "public");
    expect(result.success).toBe(true);
    expect(result.tags).not.toContain("public");
  });

  it("returns failure when tag does not exist", () => {
    const dir = makeTempDir();
    const tagFile = resolveTagFilePath(dir);
    const result = removeTag(tagFile, "posts", "ghost");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found/);
  });
});

describe("listTagsForRoute", () => {
  it("returns tags for a known route", () => {
    const dir = makeTempDir();
    const tagFile = resolveTagFilePath(dir);
    addTag(tagFile, "orders", "v2");
    addTag(tagFile, "orders", "admin");
    expect(listTagsForRoute(tagFile, "orders")).toEqual(["v2", "admin"]);
  });

  it("returns empty array for unknown route", () => {
    const dir = makeTempDir();
    const tagFile = resolveTagFilePath(dir);
    expect(listTagsForRoute(tagFile, "unknown")).toEqual([]);
  });
});

describe("listRoutesByTag", () => {
  it("returns all routes with a given tag", () => {
    const dir = makeTempDir();
    const tagFile = resolveTagFilePath(dir);
    addTag(tagFile, "users", "auth");
    addTag(tagFile, "admin", "auth");
    addTag(tagFile, "posts", "public");
    const routes = listRoutesByTag(tagFile, "auth");
    expect(routes).toContain("users");
    expect(routes).toContain("admin");
    expect(routes).not.toContain("posts");
  });
});
