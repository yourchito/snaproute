import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { lintRoute } from "./lintRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-lint-"));
}

function writeFile(dir: string, name: string, content: string): string {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

describe("lintRoute", () => {
  it("returns error if file does not exist", () => {
    const result = lintRoute("/nonexistent/path/route.ts");
    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toMatch(/File not found/);
  });

  it("reports error for missing default export", () => {
    const dir = makeTempDir();
    const file = writeFile(
      dir,
      "route.ts",
      `import { NextApiRequest, NextApiResponse } from 'next';\nfunction handler(req: NextApiRequest, res: NextApiResponse) {\n  if (req.method === 'GET') res.status(200).json({});\n}\n`
    );
    const result = lintRoute(file);
    const errors = result.issues.filter((i) => i.severity === "error" && i.message.includes("default export"));
    expect(errors.length).toBeGreaterThan(0);
    expect(result.ok).toBe(false);
  });

  it("reports warning for untyped handler", () => {
    const dir = makeTempDir();
    const file = writeFile(
      dir,
      "route.ts",
      `export default function handler(req, res) {\n  if (req.method === 'GET') res.status(200).json({});\n}\n`
    );
    const result = lintRoute(file);
    const warnings = result.issues.filter((i) => i.severity === "warning" && i.message.includes("typed"));
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("reports warning for console.log usage", () => {
    const dir = makeTempDir();
    const file = writeFile(
      dir,
      "route.ts",
      `import { NextApiRequest, NextApiResponse } from 'next';\nexport default function handler(req: NextApiRequest, res: NextApiResponse) {\n  console.log('hit');\n  if (req.method === 'GET') res.status(200).json({});\n}\n`
    );
    const result = lintRoute(file);
    const warnings = result.issues.filter((i) => i.message.includes("console.log"));
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("reports error when req.method is not checked", () => {
    const dir = makeTempDir();
    const file = writeFile(
      dir,
      "route.ts",
      `import { NextApiRequest, NextApiResponse } from 'next';\nexport default function handler(req: NextApiRequest, res: NextApiResponse) {\n  res.status(200).json({});\n}\n`
    );
    const result = lintRoute(file);
    const errors = result.issues.filter((i) => i.severity === "error" && i.message.includes("req.method"));
    expect(errors.length).toBeGreaterThan(0);
    expect(result.ok).toBe(false);
  });

  it("passes a well-formed route with no issues", () => {
    const dir = makeTempDir();
    const file = writeFile(
      dir,
      "route.ts",
      `import { NextApiRequest, NextApiResponse } from 'next';\nexport default function handler(req: NextApiRequest, res: NextApiResponse) {\n  if (req.method === 'GET') {\n    res.status(200).json({ ok: true });\n  }\n}\n`
    );
    const result = lintRoute(file);
    const errors = result.issues.filter((i) => i.severity === "error");
    expect(errors.length).toBe(0);
    expect(result.ok).toBe(true);
  });
});
