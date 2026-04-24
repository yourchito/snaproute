import {
  validateRouteName,
  validateMethods,
  validateOutputDir,
  validateRouteInput,
} from "./validateRoute";

describe("validateRouteName", () => {
  it("returns valid for a simple route name", () => {
    const result = validateRouteName("users");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns valid for a nested route name", () => {
    const result = validateRouteName("users/[id]/posts");
    expect(result.valid).toBe(true);
  });

  it("returns error for empty name", () => {
    const result = validateRouteName("");
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/empty/);
  });

  it("returns error for invalid characters", () => {
    const result = validateRouteName("users@home");
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/invalid characters/);
  });

  it("returns error for malformed dynamic segment", () => {
    const result = validateRouteName("users/[id");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("malformed"))).toBe(true);
  });
});

describe("validateMethods", () => {
  it("returns valid for standard methods", () => {
    const result = validateMethods(["GET", "POST"]);
    expect(result.valid).toBe(true);
  });

  it("is case-insensitive", () => {
    const result = validateMethods(["get", "post"]);
    expect(result.valid).toBe(true);
  });

  it("returns error for empty methods array", () => {
    const result = validateMethods([]);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/At least one/);
  });

  it("returns error for unknown method", () => {
    const result = validateMethods(["FETCH"]);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/not a valid HTTP method/);
  });

  it("returns error for duplicate methods", () => {
    const result = validateMethods(["GET", "GET"]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Duplicate"))).toBe(true);
  });
});

describe("validateOutputDir", () => {
  it("returns valid for a relative path", () => {
    const result = validateOutputDir("src/app/api");
    expect(result.valid).toBe(true);
  });

  it("returns error for empty string", () => {
    const result = validateOutputDir("");
    expect(result.valid).toBe(false);
  });

  it("returns error for absolute path", () => {
    const result = validateOutputDir("/absolute/path");
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/relative/);
  });
});

describe("validateRouteInput", () => {
  it("returns valid when all inputs are correct", () => {
    const result = validateRouteInput("users/[id]", ["GET", "DELETE"], "src/app/api");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("aggregates errors from all validators", () => {
    const result = validateRouteInput("", [], "/bad/path");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
