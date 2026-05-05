import fs from "fs";
import path from "path";
import os from "os";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { watchRoutes, resolveWatchDir, WatchEvent } from "./watchRoutes";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-watch-"));
}

describe("resolveWatchDir", () => {
  it("returns absolute path unchanged", () => {
    const abs = "/some/absolute/path";
    expect(resolveWatchDir(abs)).toBe(abs);
  });

  it("resolves relative path against cwd", () => {
    const result = resolveWatchDir("src/routes");
    expect(result).toBe(path.resolve(process.cwd(), "src/routes"));
  });
});

describe("watchRoutes", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("throws if directory does not exist", () => {
    expect(() =>
      watchRoutes({ dir: "/nonexistent/path/xyz" })
    ).toThrow("Watch directory does not exist");
  });

  it("returns a session with stop and events", () => {
    const session = watchRoutes({ dir: tmpDir });
    expect(typeof session.stop).toBe("function");
    expect(Array.isArray(session.events)).toBe(true);
    session.stop();
  });

  it("captures add event when a .ts file is created", async () => {
    const collected: WatchEvent[] = [];
    const session = watchRoutes({
      dir: tmpDir,
      onEvent: (e) => collected.push(e),
    });

    await new Promise((r) => setTimeout(r, 100));
    fs.writeFileSync(path.join(tmpDir, "test.ts"), "export default {}");
    await new Promise((r) => setTimeout(r, 300));

    session.stop();

    const tsEvents = collected.filter((e) => e.filePath.endsWith(".ts"));
    expect(tsEvents.length).toBeGreaterThan(0);
    expect(["add", "change"]).toContain(tsEvents[0].type);
  });

  it("ignores non-.ts files", async () => {
    const collected: WatchEvent[] = [];
    const session = watchRoutes({
      dir: tmpDir,
      onEvent: (e) => collected.push(e),
    });

    await new Promise((r) => setTimeout(r, 100));
    fs.writeFileSync(path.join(tmpDir, "notes.md"), "# hello");
    await new Promise((r) => setTimeout(r, 300));

    session.stop();
    expect(collected).toHaveLength(0);
  });
});
