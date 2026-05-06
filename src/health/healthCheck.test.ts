import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runHealthCheck } from "./healthCheck";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-health-"));
}

function writeRoute(dir: string, name: string, content = "export default {}"): void {
  fs.writeFileSync(path.join(dir, name), content, "utf-8");
}

describe("runHealthCheck", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns ok when routes dir exists with files and config present", () => {
    const routesDir = path.join(tmpDir, "routes");
    fs.mkdirSync(routesDir);
    writeRoute(routesDir, "users.ts");
    fs.writeFileSync(path.join(tmpDir, "snaproute.config.ts"), "", "utf-8");
    fs.writeFileSync(path.join(tmpDir, ".snaproute_history.json"), "[]", "utf-8");

    const result = runHealthCheck(routesDir, tmpDir);
    expect(result.status).toBe("ok");
    expect(result.routeCount).toBe(1);
    expect(result.configFound).toBe(true);
    expect(result.historyFound).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("returns warn when config and history are missing", () => {
    const routesDir = path.join(tmpDir, "routes");
    fs.mkdirSync(routesDir);
    writeRoute(routesDir, "posts.ts");

    const result = runHealthCheck(routesDir, tmpDir);
    expect(result.status).toBe("warn");
    expect(result.configFound).toBe(false);
    expect(result.historyFound).toBe(false);
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
  });

  it("returns error when routes directory does not exist", () => {
    const result = runHealthCheck(path.join(tmpDir, "nonexistent"), tmpDir);
    expect(result.status).toBe("error");
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.routeCount).toBe(0);
  });

  it("returns warn when routes dir is empty", () => {
    const routesDir = path.join(tmpDir, "routes");
    fs.mkdirSync(routesDir);
    fs.writeFileSync(path.join(tmpDir, "snaproute.config.ts"), "", "utf-8");
    fs.writeFileSync(path.join(tmpDir, ".snaproute_history.json"), "[]", "utf-8");

    const result = runHealthCheck(routesDir, tmpDir);
    expect(result.status).toBe("warn");
    expect(result.routeCount).toBe(0);
    expect(result.warnings.some((w) => w.includes("no route files"))).toBe(true);
  });
});
