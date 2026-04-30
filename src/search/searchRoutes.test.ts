import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { searchRoutes } from "./searchRoutes";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-search-"));
}

function writeRoute(dir: string, name: string, content: string): void {
  fs.writeFileSync(path.join(dir, `${name}.ts`), content, "utf-8");
}

const sampleContent = `
export async function GET() { return new Response('ok'); }
export async function POST() { return new Response('created'); }
`;

describe("searchRoutes", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty array when outputDir does not exist", () => {
    const results = searchRoutes({ query: "users", outputDir: "/nonexistent/path" });
    expect(results).toEqual([]);
  });

  it("finds a route by name", () => {
    writeRoute(tmpDir, "users", sampleContent);
    const results = searchRoutes({ query: "users", outputDir: tmpDir });
    expect(results).toHaveLength(1);
    expect(results[0].routeName).toBe("users");
    expect(results[0].matchedOn).toBe("name");
  });

  it("finds a route by method", () => {
    writeRoute(tmpDir, "orders", sampleContent);
    const results = searchRoutes({ query: "post", outputDir: tmpDir });
    expect(results).toHaveLength(1);
    expect(results[0].matchedOn).toBe("method");
  });

  it("finds a route by tag", () => {
    writeRoute(tmpDir, "products", "export function GET() {}");
    const tags = { products: ["shop", "catalog"] };
    const results = searchRoutes({ query: "catalog", outputDir: tmpDir, tags });
    expect(results).toHaveLength(1);
    expect(results[0].matchedOn).toBe("tag");
  });

  it("returns no results when query does not match", () => {
    writeRoute(tmpDir, "health", "export function GET() {}");
    const results = searchRoutes({ query: "zzznomatch", outputDir: tmpDir });
    expect(results).toHaveLength(0);
  });

  it("extracts methods correctly", () => {
    writeRoute(tmpDir, "items", sampleContent);
    const results = searchRoutes({ query: "items", outputDir: tmpDir });
    expect(results[0].methods).toContain("GET");
    expect(results[0].methods).toContain("POST");
  });
});
