import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { exportRoutes, serializeEntries, buildExportEntries, ExportEntry } from "./exportRoutes";
import { appendHistory } from "../history/routeHistory";
import { addAlias } from "../alias/aliasRoute";
import { addTag } from "../tag/tagRoute";
import { pinRoute } from "../pin/pinRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-export-"));
}

const sampleEntries: ExportEntry[] = [
  {
    name: "users",
    methods: ["GET", "POST"],
    outputDir: "src/pages/api",
    alias: "user-api",
    tags: ["auth", "rest"],
    pinned: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    name: "posts",
    methods: ["GET"],
    outputDir: "src/pages/api",
    alias: undefined,
    tags: [],
    pinned: false,
    createdAt: "2024-01-02T00:00:00.000Z",
  },
];

describe("serializeEntries", () => {
  it("serializes to JSON", () => {
    const result = serializeEntries(sampleEntries, "json");
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe("users");
  });

  it("serializes to CSV with header", () => {
    const result = serializeEntries(sampleEntries, "csv");
    const lines = result.split("\n");
    expect(lines[0]).toContain("name,methods");
    expect(lines[1]).toContain("users");
    expect(lines[1]).toContain("GET|POST");
  });

  it("serializes to markdown table", () => {
    const result = serializeEntries(sampleEntries, "markdown");
    expect(result).toContain("# Snaproute Export");
    expect(result).toContain("| users |");
    expect(result).toContain("✓");
  });
});

describe("exportRoutes", () => {
  it("returns error when no history exists", () => {
    const tmp = makeTempDir();
    const result = exportRoutes({
      format: "json",
      outputPath: path.join(tmp, "out", "routes.json"),
      historyFile: path.join(tmp, "history.json"),
      aliasFile: path.join(tmp, "aliases.json"),
      tagFile: path.join(tmp, "tags.json"),
      pinFile: path.join(tmp, "pins.json"),
    });
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/No route history/);
  });

  it("writes JSON export file and returns success", () => {
    const tmp = makeTempDir();
    const historyFile = path.join(tmp, "history.json");
    appendHistory({ routeName: "orders", methods: ["GET"], outputDir: "src/pages/api", createdAt: new Date().toISOString() }, historyFile);
    const outPath = path.join(tmp, "out", "routes.json");
    const result = exportRoutes({
      format: "json",
      outputPath: outPath,
      historyFile,
      aliasFile: path.join(tmp, "aliases.json"),
      tagFile: path.join(tmp, "tags.json"),
      pinFile: path.join(tmp, "pins.json"),
    });
    expect(result.success).toBe(true);
    expect(fs.existsSync(outPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(outPath, "utf-8"));
    expect(content[0].name).toBe("orders");
  });
});
