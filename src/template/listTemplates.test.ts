import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  listBuiltinTemplates,
  listCustomTemplates,
  listAllTemplates,
  findTemplate,
} from "./listTemplates";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-templates-"));
}

describe("listBuiltinTemplates", () => {
  it("returns at least the default template", () => {
    const templates = listBuiltinTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.map((t) => t.name)).toContain("default");
  });

  it("each entry has required fields", () => {
    for (const t of listBuiltinTemplates()) {
      expect(typeof t.name).toBe("string");
      expect(typeof t.description).toBe("string");
      expect(Array.isArray(t.methods)).toBe(true);
      expect(typeof t.hasAuth).toBe("boolean");
      expect(typeof t.hasValidation).toBe("boolean");
    }
  });
});

describe("listCustomTemplates", () => {
  it("returns empty array when dir does not exist", () => {
    const result = listCustomTemplates("/nonexistent/path/xyz");
    expect(result).toEqual([]);
  });

  it("returns entries for .ts files in the directory", () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, "myCustom.ts"), "// template");
    fs.writeFileSync(path.join(dir, "another.ts"), "// template");
    const result = listCustomTemplates(dir);
    expect(result.map((t) => t.name)).toContain("myCustom");
    expect(result.map((t) => t.name)).toContain("another");
    fs.rmSync(dir, { recursive: true });
  });

  it("ignores non-ts/js files", () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, "readme.md"), "# docs");
    const result = listCustomTemplates(dir);
    expect(result.length).toBe(0);
    fs.rmSync(dir, { recursive: true });
  });
});

describe("listAllTemplates", () => {
  it("includes builtin templates when no dir provided", () => {
    const result = listAllTemplates();
    expect(result.map((t) => t.name)).toContain("default");
  });

  it("merges builtin and custom templates", () => {
    const dir = makeTempDir();
    fs.writeFileSync(path.join(dir, "special.ts"), "// custom");
    const result = listAllTemplates(dir);
    expect(result.map((t) => t.name)).toContain("default");
    expect(result.map((t) => t.name)).toContain("special");
    fs.rmSync(dir, { recursive: true });
  });
});

describe("findTemplate", () => {
  it("finds a builtin template by name", () => {
    const t = findTemplate("crud");
    expect(t).toBeDefined();
    expect(t?.name).toBe("crud");
  });

  it("returns undefined for unknown template", () => {
    expect(findTemplate("nonexistent")).toBeUndefined();
  });
});
