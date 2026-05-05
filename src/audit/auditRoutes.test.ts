import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { auditRoutes } from "./auditRoutes";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-audit-"));
}

function writeRoute(dir: string, name: string, content: string): void {
  const full = path.join(dir, name);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

describe("auditRoutes", () => {
  it("returns empty result for missing directory", () => {
    const result = auditRoutes("/nonexistent/path/xyz");
    expect(result.totalRoutes).toBe(0);
    expect(result.totalIssues).toBe(0);
  });

  it("detects missing default export", () => {
    const dir = makeTempDir();
    writeRoute(dir, "users.ts", "export function GET() {}");
    const result = auditRoutes(dir);
    const entry = result.entries.find((e) => e.route === "users");
    expect(entry).toBeDefined();
    expect(entry!.issues.some((i) => i.message.includes("default export"))).toBe(true);
    expect(result.errorCount).toBeGreaterThan(0);
  });

  it("detects missing HTTP method", () => {
    const dir = makeTempDir();
    writeRoute(dir, "health.ts", "export default function handler(req: any, res: any) {}");
    const result = auditRoutes(dir);
    const entry = result.entries.find((e) => e.route === "health");
    expect(entry!.issues.some((i) => i.message.includes("HTTP method"))).toBe(true);
  });

  it("detects any type usage", () => {
    const dir = makeTempDir();
    writeRoute(
      dir,
      "posts.ts",
      "export default function handler(req: any, res: any) {}\nexport const GET = true;"
    );
    const result = auditRoutes(dir);
    const entry = result.entries.find((e) => e.route === "posts");
    expect(entry!.issues.some((i) => i.message.includes("'any'"))).toBe(true);
  });

  it("passes a clean route with no issues", () => {
    const dir = makeTempDir();
    const content = [
      "import { NextApiRequest, NextApiResponse } from 'next';",
      "export default function handler(req: NextApiRequest, res: NextApiResponse) {",
      "  if (req.method === 'GET') res.status(200).json({});",
      "}",
    ].join("\n");
    writeRoute(dir, "clean.ts", content);
    const result = auditRoutes(dir);
    const entry = result.entries.find((e) => e.route === "clean");
    expect(entry!.issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("aggregates counts across multiple files", () => {
    const dir = makeTempDir();
    writeRoute(dir, "a.ts", "export function GET() {}");
    writeRoute(dir, "b.ts", "export function GET() {}");
    const result = auditRoutes(dir);
    expect(result.totalRoutes).toBe(2);
    expect(result.errorCount).toBeGreaterThanOrEqual(2);
  });
});
