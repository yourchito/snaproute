import { parseArgs } from "./parseArgs";

describe("parseArgs", () => {
  it("returns help command when no args provided", () => {
    expect(parseArgs(["node", "snaproute"])).toEqual({ command: "help" });
  });

  it("returns help command for --help flag", () => {
    expect(parseArgs(["node", "snaproute", "--help"])).toEqual({ command: "help" });
  });

  it("returns version command for --version flag", () => {
    expect(parseArgs(["node", "snaproute", "--version"])).toEqual({ command: "version" });
  });

  it("parses generate command with route name", () => {
    const result = parseArgs(["node", "snaproute", "generate", "users"]);
    expect(result.command).toBe("generate");
    expect(result.routeName).toBe("users");
  });

  it("parses generate shorthand 'g'", () => {
    const result = parseArgs(["node", "snaproute", "g", "posts"]);
    expect(result.command).toBe("generate");
    expect(result.routeName).toBe("posts");
  });

  it("parses --methods flag", () => {
    const result = parseArgs(["node", "snaproute", "generate", "users", "--methods", "GET,POST"]);
    expect(result.methods).toEqual(["GET", "POST"]);
  });

  it("parses --output flag", () => {
    const result = parseArgs(["node", "snaproute", "generate", "users", "--output", "src/pages/api"]);
    expect(result.outputDir).toBe("src/pages/api");
  });

  it("parses --with-docs flag", () => {
    const result = parseArgs(["node", "snaproute", "generate", "users", "--with-docs"]);
    expect(result.withDocs).toBe(true);
  });

  it("parses --dry-run flag", () => {
    const result = parseArgs(["node", "snaproute", "generate", "users", "--dry-run"]);
    expect(result.dryRun).toBe(true);
  });

  it("throws if route name is missing for generate", () => {
    expect(() => parseArgs(["node", "snaproute", "generate"])).toThrow(
      "Route name is required for the generate command."
    );
  });

  it("throws on invalid HTTP methods", () => {
    expect(() =>
      parseArgs(["node", "snaproute", "generate", "users", "--methods", "GET,FETCH"])
    ).toThrow("Invalid HTTP methods: FETCH");
  });

  it("throws on unknown command", () => {
    expect(() => parseArgs(["node", "snaproute", "scaffold"])).toThrow('Unknown command: "scaffold"');
  });
});
