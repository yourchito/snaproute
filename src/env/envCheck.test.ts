import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { extractEnvVars, checkEnvVars, envCheck } from "./envCheck";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-env-"));
}

function writeRoute(dir: string, name: string, content: string): string {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

describe("extractEnvVars", () => {
  it("extracts single env var", () => {
    expect(extractEnvVars("const x = process.env.API_KEY;")).toEqual(["API_KEY"]);
  });

  it("extracts multiple unique env vars", () => {
    const content = "process.env.DB_URL; process.env.API_KEY; process.env.DB_URL;";
    const vars = extractEnvVars(content);
    expect(vars).toContain("DB_URL");
    expect(vars).toContain("API_KEY");
    expect(vars).toHaveLength(2);
  });

  it("returns empty array when no env vars", () => {
    expect(extractEnvVars("const x = 42;")).toEqual([]);
  });
});

describe("checkEnvVars", () => {
  it("classifies present and missing vars", () => {
    const env = { API_KEY: "secret" };
    const { present, missing } = checkEnvVars(["API_KEY", "DB_URL"], env);
    expect(present).toEqual(["API_KEY"]);
    expect(missing).toEqual(["DB_URL"]);
  });

  it("returns all present when all set", () => {
    const env = { A: "1", B: "2" };
    const { missing } = checkEnvVars(["A", "B"], env);
    expect(missing).toHaveLength(0);
  });
});

describe("envCheck", () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("detects missing env vars in a route file", () => {
    const file = writeRoute(tmpDir, "users.ts", "const k = process.env.SECRET_KEY;");
    const result = envCheck(file, {});
    expect(result.missingVars).toContain("SECRET_KEY");
    expect(result.presentVars).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("reports present vars correctly", () => {
    const file = writeRoute(tmpDir, "auth.ts", "const k = process.env.JWT_SECRET;");
    const result = envCheck(file, { JWT_SECRET: "abc" });
    expect(result.presentVars).toContain("JWT_SECRET");
    expect(result.missingVars).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("throws when file does not exist", () => {
    expect(() => envCheck(path.join(tmpDir, "ghost.ts"), {})).toThrow(
      "Route file not found"
    );
  });
});
