import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  formatContent,
  formatRoute,
  normalizeImports,
  normalizeIndentation,
  ensureTrailingNewline,
} from "./formatRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-format-"));
}

describe("normalizeImports", () => {
  it("sorts import lines alphabetically", () => {
    const input = `import z from 'z';\nimport a from 'a';\nimport m from 'm';\n\nexport default function() {}`;
    const result = normalizeImports(input);
    expect(result.startsWith("import a")).toBe(true);
    expect(result.indexOf("import a")).toBeLessThan(result.indexOf("import m"));
    expect(result.indexOf("import m")).toBeLessThan(result.indexOf("import z"));
  });

  it("leaves non-import content intact", () => {
    const input = `import fs from 'fs';\n\nconst x = 1;`;
    const result = normalizeImports(input);
    expect(result).toContain("const x = 1;");
  });
});

describe("normalizeIndentation", () => {
  it("replaces tabs with two spaces", () => {
    const input = `function foo() {\n\treturn 1;\n}`;
    const result = normalizeIndentation(input);
    expect(result).toContain("  return 1;");
    expect(result).not.toContain("\t");
  });

  it("does not modify lines without tab indentation", () => {
    const input = `  const x = 1;`;
    expect(normalizeIndentation(input)).toBe(`  const x = 1;`);
  });
});

describe("ensureTrailingNewline", () => {
  it("adds newline if missing", () => {
    expect(ensureTrailingNewline("hello")).toBe("hello\n");
  });

  it("does not double newline", () => {
    expect(ensureTrailingNewline("hello\n")).toBe("hello\n");
  });
});

describe("formatRoute", () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("returns error if file not found", () => {
    const result = formatRoute(path.join(tmpDir, "missing.ts"));
    expect(result.error).toBe("File not found");
    expect(result.changed).toBe(false);
  });

  it("returns changed=false if content is already formatted", () => {
    const file = path.join(tmpDir, "route.ts");
    const content = `import fs from 'fs';\n\nexport default function handler() {}\n`;
    fs.writeFileSync(file, content);
    const result = formatRoute(file);
    expect(result.changed).toBe(false);
    expect(result.error).toBeUndefined();
  });

  it("formats file and returns changed=true", () => {
    const file = path.join(tmpDir, "route.ts");
    const content = `import z from 'z';\nimport a from 'a';\n\nexport default function handler() {}\n`;
    fs.writeFileSync(file, content);
    const result = formatRoute(file);
    expect(result.changed).toBe(true);
    const written = fs.readFileSync(file, "utf-8");
    expect(written.indexOf("import a")).toBeLessThan(written.indexOf("import z"));
  });
});
