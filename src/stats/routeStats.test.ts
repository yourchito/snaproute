import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  parseRoutesFromDir,
  extractMethodsFromContent,
  computeRouteStats,
} from "./routeStats";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-stats-"));
}

function writeRoute(dir: string, name: string, content: string): void {
  const fullPath = path.join(dir, name);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf-8");
}

describe("extractMethodsFromContent", () => {
  it("extracts exported HTTP method functions", () => {
    const content = `
      export async function GET(req: Request) {}
      export function POST(req: Request) {}
    `;
    expect(extractMethodsFromContent(content)).toEqual(["GET", "POST"]);
  });

  it("ignores non-exported or non-HTTP functions", () => {
    const content = `
      function helper() {}
      export function getData() {}
    `;
    expect(extractMethodsFromContent(content)).toEqual([]);
  });

  it("returns empty array for empty content", () => {
    expect(extractMethodsFromContent("")).toEqual([]);
  });

  it("extracts all supported HTTP methods", () => {
    const content = `
      export function GET() {}
      export function POST() {}
      export function PUT() {}
      export function PATCH() {}
      export function DELETE() {}
      export function HEAD() {}
      export function OPTIONS() {}
    `;
    expect(extractMethodsFromContent(content)).toEqual(
      ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
    );
  });
});

describe("parseRoutesFromDir", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty array if directory does not exist", () => {
    expect(parseRoutesFromDir("/nonexistent/path")).toEqual([]);
  });

  it("parses routes from .ts files", () => {
    writeRoute(tmpDir, "users/route.ts", "export async function GET() {} export function POST() {}");
    const entries = parseRoutesFromDir(tmpDir);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("users/route");
    expect(entries[0].methods).toEqual(["GET", "POST"]);
  });

  it("walks nested directories", () => {
    writeRoute(tmpDir, "a/route.ts", "export function GET() {}");
    writeRoute(tmpDir, "b/c/route.ts", "export function DELETE() {}");
    const entries = parseRoutesFromDir(tmpDir);
    expect(entries).toHaveLength(2);
  });
});

describe("computeRouteStats", () => {
  it("computes correct stats from entries", () => {
    const entries = [
      { name: "users", methods: ["GET", "POST"] },
      { name: "posts", methods: ["GET"] },
      { name: "auth", methods: ["POST", "DELETE"] },
    ];
    const stats = computeRouteStats(entries);
    expect(stats.totalRoutes).toBe(3);
    expect(stats.methodCounts["GET"]).toBe(2);
    expect(stats.methodCounts["POST"]).toBe(2);
    expect(stats.methodCounts["DELETE"]).toBe(1);
    expect(stats.averageMethodsPerRoute).toBe(1.67);
    expect(stats.mostUsedMethods[0]).toBe("GET");
  });

  it("returns zero stats for empty entries", () => {
    const stats = computeRouteStats([]);
    expect(stats.totalRoutes).toBe(0);
    expect(stats.averageMethodsPerRoute).toBe(0);
    expect(stats.mostUsedMethods).toEqual([]);
  });
});
