import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { compareRoutes } from "./compareRoutes";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-compare-"));
}

function writeRoute(dir: string, routePath: string, content: string): void {
  const full = path.join(dir, routePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

const GET_HANDLER = `export async function GET() { return Response.json({}) }`;
const POST_HANDLER = `export async function POST() { return Response.json({}) }`;
const GET_POST = `${GET_HANDLER}\n${POST_HANDLER}`;

let dirA: string;
let dirB: string;

beforeEach(() => {
  dirA = makeTempDir();
  dirB = makeTempDir();
});

afterEach(() => {
  fs.rmSync(dirA, { recursive: true, force: true });
  fs.rmSync(dirB, { recursive: true, force: true });
});

describe("compareRoutes", () => {
  it("returns matching routes present in both dirs", () => {
    writeRoute(dirA, "users/route.ts", GET_HANDLER);
    writeRoute(dirB, "users/route.ts", GET_HANDLER);
    const result = compareRoutes(dirA, dirB);
    expect(result.matching).toContain("users/route.ts");
    expect(result.onlyInA).toHaveLength(0);
    expect(result.onlyInB).toHaveLength(0);
  });

  it("detects routes only in A", () => {
    writeRoute(dirA, "posts/route.ts", GET_HANDLER);
    const result = compareRoutes(dirA, dirB);
    expect(result.onlyInA).toContain("posts/route.ts");
    expect(result.matching).toHaveLength(0);
  });

  it("detects routes only in B", () => {
    writeRoute(dirB, "comments/route.ts", POST_HANDLER);
    const result = compareRoutes(dirA, dirB);
    expect(result.onlyInB).toContain("comments/route.ts");
  });

  it("detects method differences for shared routes", () => {
    writeRoute(dirA, "users/route.ts", GET_HANDLER);
    writeRoute(dirB, "users/route.ts", GET_POST);
    const result = compareRoutes(dirA, dirB);
    expect(result.methodDiff["users/route.ts"]).toBeDefined();
    expect(result.methodDiff["users/route.ts"].a).toEqual(["GET"]);
    expect(result.methodDiff["users/route.ts"].b).toContain("POST");
  });

  it("returns no methodDiff when methods match", () => {
    writeRoute(dirA, "users/route.ts", GET_POST);
    writeRoute(dirB, "users/route.ts", GET_POST);
    const result = compareRoutes(dirA, dirB);
    expect(result.methodDiff).toEqual({});
  });

  it("handles non-existent directories gracefully", () => {
    const result = compareRoutes("/nonexistent-a", "/nonexistent-b");
    expect(result.matching).toHaveLength(0);
    expect(result.onlyInA).toHaveLength(0);
    expect(result.onlyInB).toHaveLength(0);
  });
});
