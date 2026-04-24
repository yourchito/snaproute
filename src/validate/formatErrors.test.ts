import chalk from "chalk";
import {
  formatValidationErrors,
  reportValidationErrors,
  formatSuccess,
  formatWarning,
} from "./formatErrors";

// Disable chalk colors in tests for easier string matching
beforeAll(() => {
  chalk.level = 0;
});

describe("formatValidationErrors", () => {
  it("returns empty string when no errors", () => {
    expect(formatValidationErrors([])).toBe("");
  });

  it("includes a header line", () => {
    const result = formatValidationErrors(["Something went wrong."]);
    expect(result).toContain("Validation failed");
  });

  it("includes context in header when provided", () => {
    const result = formatValidationErrors(["Bad input."], "route name");
    expect(result).toContain("route name");
  });

  it("lists each error on its own line", () => {
    const result = formatValidationErrors(["Error one.", "Error two."]);
    expect(result).toContain("Error one.");
    expect(result).toContain("Error two.");
  });
});

describe("reportValidationErrors", () => {
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    stderrSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it("returns true and does not print when no errors", () => {
    const result = reportValidationErrors([]);
    expect(result).toBe(true);
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it("returns false and prints to stderr when errors exist", () => {
    const result = reportValidationErrors(["Something failed."]);
    expect(result).toBe(false);
    expect(stderrSpy).toHaveBeenCalledTimes(1);
  });
});

describe("formatSuccess", () => {
  it("includes the message in the output", () => {
    const result = formatSuccess("Route created!");
    expect(result).toContain("Route created!");
  });
});

describe("formatWarning", () => {
  it("includes the message in the output", () => {
    const result = formatWarning("Config not found, using defaults.");
    expect(result).toContain("Config not found, using defaults.");
  });
});
