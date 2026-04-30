import { previewRoute } from "./previewRoute";
import { defineConfig } from "../config";
import { RouteInput } from "../validate";

const baseConfig = defineConfig({
  outputDir: "src/pages/api",
  generateDocs: false,
});

const baseInput: RouteInput = {
  name: "users",
  methods: ["GET", "POST"],
};

describe("previewRoute", () => {
  it("returns the expected routePath", () => {
    const result = previewRoute(baseInput, baseConfig);
    expect(result.routePath).toBe("src/pages/api/users.ts");
  });

  it("uses outputDir from input when provided", () => {
    const result = previewRoute(
      { ...baseInput, outputDir: "app/api" },
      baseConfig
    );
    expect(result.routePath).toBe("app/api/users.ts");
  });

  it("returns non-empty templateContent", () => {
    const result = previewRoute(baseInput, baseConfig);
    expect(result.templateContent.length).toBeGreaterThan(0);
    expect(result.templateContent).toContain("users");
  });

  it("returns null docsContent when generateDocs is false", () => {
    const result = previewRoute(baseInput, baseConfig);
    expect(result.docsContent).toBeNull();
  });

  it("returns markdown docsContent when generateDocs is true", () => {
    const configWithDocs = defineConfig({
      outputDir: "src/pages/api",
      generateDocs: true,
    });
    const result = previewRoute(baseInput, configWithDocs);
    expect(result.docsContent).not.toBeNull();
    expect(result.docsContent).toContain("users");
  });

  it("falls back to default outputDir when none provided", () => {
    const configNoDir = defineConfig({ generateDocs: false });
    const result = previewRoute(baseInput, configNoDir);
    expect(result.routePath).toBe("src/pages/api/users.ts");
  });

  it("includes all specified methods in templateContent", () => {
    const result = previewRoute(baseInput, baseConfig);
    for (const method of baseInput.methods) {
      expect(result.templateContent).toContain(method);
    }
  });
});
