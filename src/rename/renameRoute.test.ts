import fs from "fs";
import os from "os";
import path from "path";
import { renameRoute, formatRenameResult } from "./renameRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-rename-"));
}

describe("renameRoute", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("renames an existing route file", async () => {
    const routeDir = path.join(tmpDir, "routes", "users");
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, "route.ts"), "// users route");

    const result = await renameRoute("users", "members", path.join(tmpDir, "routes"));

    expect(result.success).toBe(true);
    expect(fs.existsSync(result.newRoutePath)).toBe(true);
    expect(fs.existsSync(result.oldRoutePath)).toBe(false);
  });

  it("returns error if old route does not exist", async () => {
    const result = await renameRoute("nonexistent", "other", path.join(tmpDir, "routes"));

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/);
  });

  it("returns error if new route already exists", async () => {
    const routesDir = path.join(tmpDir, "routes");
    fs.mkdirSync(path.join(routesDir, "users"), { recursive: true });
    fs.mkdirSync(path.join(routesDir, "members"), { recursive: true });
    fs.writeFileSync(path.join(routesDir, "users", "route.ts"), "// users");
    fs.writeFileSync(path.join(routesDir, "members", "route.ts"), "// members");

    const result = await renameRoute("users", "members", routesDir);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });

  it("renames docs file if docsDir is provided", async () => {
    const routesDir = path.join(tmpDir, "routes");
    const docsDir = path.join(tmpDir, "docs");
    fs.mkdirSync(path.join(routesDir, "users"), { recursive: true });
    fs.mkdirSync(path.join(docsDir, "users"), { recursive: true });
    fs.writeFileSync(path.join(routesDir, "users", "route.ts"), "// users");
    fs.writeFileSync(path.join(docsDir, "users", "docs.md"), "# users");

    const result = await renameRoute("users", "members", routesDir, docsDir);

    expect(result.success).toBe(true);
    expect(result.newDocsPath).toBeDefined();
    expect(fs.existsSync(result.newDocsPath!)).toBe(true);
  });
});

describe("formatRenameResult", () => {
  it("formats a successful rename", () => {
    const output = formatRenameResult({
      success: true,
      oldRoutePath: "/routes/users/route.ts",
      newRoutePath: "/routes/members/route.ts",
    });
    expect(output).toMatch(/renamed successfully/);
    expect(output).toMatch(/users/);
    expect(output).toMatch(/members/);
  });

  it("formats a failed rename", () => {
    const output = formatRenameResult({
      success: false,
      oldRoutePath: "/routes/users/route.ts",
      newRoutePath: "/routes/members/route.ts",
      error: "Route file not found",
    });
    expect(output).toMatch(/✖/);
    expect(output).toMatch(/Route file not found/);
  });
});
