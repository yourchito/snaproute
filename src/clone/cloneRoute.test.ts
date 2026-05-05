import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  cloneRoute,
  formatCloneResult,
  resolveRoutePath,
} from "./cloneRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-clone-"));
}

function writeRoute(dir: string, name: string, content: string): string {
  const filePath = resolveRoutePath(dir, name);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

describe("cloneRoute", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("clones an existing route to a new location", () => {
    writeRoute(tmpDir, "users", "export const GET = () => {};\n");

    const result = cloneRoute({
      sourceDir: tmpDir,
      outputDir: tmpDir,
      sourceName: "users",
      targetName: "members",
    });

    expect(result.success).toBe(true);
    expect(fs.existsSync(result.targetPath)).toBe(true);
    const content = fs.readFileSync(result.targetPath, "utf-8");
    expect(content).toContain("export const GET");
  });

  it("returns error if source route does not exist", () => {
    const result = cloneRoute({
      sourceDir: tmpDir,
      outputDir: tmpDir,
      sourceName: "nonexistent",
      targetName: "copy",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Source route not found/);
  });

  it("returns error if target route already exists", () => {
    writeRoute(tmpDir, "users", "export const GET = () => {};\n");
    writeRoute(tmpDir, "members", "export const POST = () => {};\n");

    const result = cloneRoute({
      sourceDir: tmpDir,
      outputDir: tmpDir,
      sourceName: "users",
      targetName: "members",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Target route already exists/);
  });

  it("formats a successful clone result", () => {
    const msg = formatCloneResult({
      success: true,
      sourcePath: "/src/users/route.ts",
      targetPath: "/src/members/route.ts",
    });
    expect(msg).toContain("✅ Cloned route");
    expect(msg).toContain("/src/users/route.ts");
    expect(msg).toContain("/src/members/route.ts");
  });

  it("formats a failed clone result", () => {
    const msg = formatCloneResult({
      success: false,
      sourcePath: "/src/users/route.ts",
      targetPath: "/src/members/route.ts",
      error: "Source route not found",
    });
    expect(msg).toContain("❌ Clone failed");
    expect(msg).toContain("Source route not found");
  });
});
