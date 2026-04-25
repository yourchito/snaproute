import { describe, it, expect } from "vitest";
import { extractParams, generateDocs, formatDocsAsMarkdown } from "./generateDocs";
import type { ParsedArgs } from "../cli/parseArgs";

const baseArgs: ParsedArgs = {
  routeName: "users",
  methods: ["get", "post"],
  outputDir: "pages/api",
  preview: false,
  docs: false,
};

describe("extractParams", () => {
  it("returns empty array for static routes", () => {
    expect(extractParams("users")).toEqual([]);
  });

  it("extracts a single dynamic param", () => {
    expect(extractParams("users/[id]")).toEqual(["id"]);
  });

  it("extracts multiple dynamic params", () => {
    expect(extractParams("users/[userId]/posts/[postId]")).toEqual(["userId", "postId"]);
  });

  it("handles catch-all segments", () => {
    expect(extractParams("blog/[...slug]")).toEqual(["...slug"]);
  });
});

describe("generateDocs", () => {
  it("returns a RouteDoc with correct name and methods", () => {
    const doc = generateDocs(baseArgs);
    expect(doc.name).toBe("users");
    expect(doc.methods).toEqual(["get", "post"]);
  });

  it("extracts params from routeName", () => {
    const doc = generateDocs({ ...baseArgs, routeName: "users/[id]" });
    expect(doc.params).toEqual(["id"]);
  });

  it("uses default outputDir when not provided", () => {
    const doc = generateDocs({ ...baseArgs, outputDir: undefined });
    expect(doc.outputDir).toBe("pages/api");
  });

  it("includes a generatedAt timestamp", () => {
    const doc = generateDocs(baseArgs);
    expect(new Date(doc.generatedAt).toString()).not.toBe("Invalid Date");
  });
});

describe("formatDocsAsMarkdown", () => {
  it("includes the route name as a heading", () => {
    const doc = generateDocs(baseArgs);
    const md = formatDocsAsMarkdown(doc);
    expect(md).toContain("# Route: `users`");
  });

  it("lists all methods", () => {
    const doc = generateDocs(baseArgs);
    const md = formatDocsAsMarkdown(doc);
    expect(md).toContain("`GET`");
    expect(md).toContain("`POST`");
  });

  it("includes dynamic params section when params exist", () => {
    const doc = generateDocs({ ...baseArgs, routeName: "users/[id]" });
    const md = formatDocsAsMarkdown(doc);
    expect(md).toContain("## Dynamic Parameters");
    expect(md).toContain("`id`");
  });

  it("omits dynamic params section for static routes", () => {
    const doc = generateDocs(baseArgs);
    const md = formatDocsAsMarkdown(doc);
    expect(md).not.toContain("## Dynamic Parameters");
  });

  it("includes a handler signature code block", () => {
    const doc = generateDocs(baseArgs);
    const md = formatDocsAsMarkdown(doc);
    expect(md).toContain("## Handler Signature");
    expect(md).toContain("```ts");
    expect(md).toContain("NextApiRequest");
  });
});
