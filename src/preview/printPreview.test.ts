import { printPreview } from "./printPreview";
import { PreviewResult } from "./previewRoute";

describe("printPreview", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const baseResult: PreviewResult = {
    routePath: "src/pages/api/users.ts",
    templateContent: "export default function handler() {}",
    docsContent: null,
  };

  it("logs preview mode notice", () => {
    printPreview(baseResult);
    const output = consoleSpy.mock.calls.flat().join(" ");
    expect(output).toContain("Preview mode");
  });

  it("logs the route path", () => {
    printPreview(baseResult);
    const output = consoleSpy.mock.calls.flat().join(" ");
    expect(output).toContain("src/pages/api/users.ts");
  });

  it("logs the template content", () => {
    printPreview(baseResult);
    const output = consoleSpy.mock.calls.flat().join(" ");
    expect(output).toContain("export default function handler");
  });

  it("logs docs disabled message when docsContent is null", () => {
    printPreview(baseResult);
    const output = consoleSpy.mock.calls.flat().join(" ");
    expect(output).toContain("Docs generation is disabled");
  });

  it("logs docs content when provided", () => {
    const resultWithDocs: PreviewResult = {
      ...baseResult,
      docsContent: "## users\n\nGET, POST",
    };
    printPreview(resultWithDocs);
    const output = consoleSpy.mock.calls.flat().join(" ");
    expect(output).toContain("Generated Docs");
    expect(output).toContain("## users");
  });
});
