import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  resolveCustomTemplateDir,
  resolveCustomTemplatePath,
  saveCustomTemplate,
  deleteCustomTemplate,
} from "./customTemplate";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-custom-template-"));
}

describe("resolveCustomTemplateDir", () => {
  it("returns correct path", () => {
    const result = resolveCustomTemplateDir("/project");
    expect(result).toBe("/project/.snaproute/templates");
  });
});

describe("resolveCustomTemplatePath", () => {
  it("returns correct file path for a named template", () => {
    const result = resolveCustomTemplatePath("/project", "crud");
    expect(result).toBe("/project/.snaproute/templates/crud.ts");
  });
});

describe("saveCustomTemplate", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("saves a new template successfully", () => {
    const result = saveCustomTemplate(tmpDir, {
      name: "my-template",
      content: "export default function handler() {}",
    });
    expect(result.success).toBe(true);
    expect(result.overwritten).toBe(false);
    expect(fs.existsSync(result.path!)).toBe(true);
  });

  it("fails if template exists and overwrite is false", () => {
    saveCustomTemplate(tmpDir, { name: "existing", content: "old" });
    const result = saveCustomTemplate(tmpDir, { name: "existing", content: "new" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already exists/);
  });

  it("overwrites if overwrite is true", () => {
    saveCustomTemplate(tmpDir, { name: "existing", content: "old" });
    const result = saveCustomTemplate(tmpDir, {
      name: "existing",
      content: "new",
      overwrite: true,
    });
    expect(result.success).toBe(true);
    expect(result.overwritten).toBe(true);
  });
});

describe("deleteCustomTemplate", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("deletes an existing template", () => {
    saveCustomTemplate(tmpDir, { name: "to-delete", content: "x" });
    const result = deleteCustomTemplate(tmpDir, "to-delete");
    expect(result.success).toBe(true);
    expect(fs.existsSync(result.path!)).toBe(false);
  });

  it("returns error if template does not exist", () => {
    const result = deleteCustomTemplate(tmpDir, "ghost");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/);
  });
});
