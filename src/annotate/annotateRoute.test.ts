import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach } from "vitest";
import {
  resolveAnnotationFilePath,
  loadAnnotations,
  addAnnotation,
  removeAnnotations,
  getAnnotations,
} from "./annotateRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-annotate-"));
}

describe("resolveAnnotationFilePath", () => {
  it("returns path inside .snaproute directory", () => {
    const result = resolveAnnotationFilePath("/project");
    expect(result).toBe("/project/.snaproute/annotations.json");
  });
});

describe("loadAnnotations", () => {
  it("returns empty store when file does not exist", () => {
    const result = loadAnnotations("/nonexistent/path/annotations.json");
    expect(result).toEqual({ annotations: [] });
  });

  it("returns empty store on invalid JSON", () => {
    const dir = makeTempDir();
    const snapDir = path.join(dir, ".snaproute");
    fs.mkdirSync(snapDir);
    const filePath = path.join(snapDir, "annotations.json");
    fs.writeFileSync(filePath, "not-json");
    const result = loadAnnotations(filePath);
    expect(result).toEqual({ annotations: [] });
  });
});

describe("addAnnotation", () => {
  it("creates annotation entry for a route", () => {
    const dir = makeTempDir();
    const result = addAnnotation(dir, "users/[id]", "Needs rate limiting", "alice");
    expect(result.success).toBe(true);
    expect(result.action).toBe("added");
    expect(result.message).toContain("users/[id]");

    const filePath = resolveAnnotationFilePath(dir);
    const store = loadAnnotations(filePath);
    expect(store.annotations).toHaveLength(1);
    expect(store.annotations[0].note).toBe("Needs rate limiting");
    expect(store.annotations[0].author).toBe("alice");
  });

  it("appends multiple annotations to the same route", () => {
    const dir = makeTempDir();
    addAnnotation(dir, "posts", "First note");
    addAnnotation(dir, "posts", "Second note");
    const result = getAnnotations(dir, "posts");
    expect(result.annotations).toHaveLength(2);
  });
});

describe("removeAnnotations", () => {
  it("removes all annotations for a route", () => {
    const dir = makeTempDir();
    addAnnotation(dir, "auth/login", "Check tokens");
    addAnnotation(dir, "auth/login", "Review expiry");
    addAnnotation(dir, "auth/logout", "Unrelated");

    const result = removeAnnotations(dir, "auth/login");
    expect(result.success).toBe(true);
    expect(result.message).toContain("2");

    const remaining = getAnnotations(dir, "auth/login");
    expect(remaining.annotations).toHaveLength(0);

    const other = getAnnotations(dir, "auth/logout");
    expect(other.annotations).toHaveLength(1);
  });

  it("returns failure when no annotations exist for route", () => {
    const dir = makeTempDir();
    const result = removeAnnotations(dir, "nonexistent");
    expect(result.success).toBe(false);
  });
});

describe("getAnnotations", () => {
  it("returns only annotations for the specified route", () => {
    const dir = makeTempDir();
    addAnnotation(dir, "route-a", "Note A");
    addAnnotation(dir, "route-b", "Note B");
    const result = getAnnotations(dir, "route-a");
    expect(result.action).toBe("listed");
    expect(result.annotations).toHaveLength(1);
    expect(result.annotations![0].note).toBe("Note A");
  });
});
