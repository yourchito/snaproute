import { describe, it, expect, vi, beforeEach } from "vitest";
import { summarizeBatchResults } from "./batchScaffold";

// Mock dependencies used by batchScaffold
vi.mock("../scaffold/scaffoldRoute", () => ({
  scaffoldRoute: vi.fn(),
}));

vi.mock("../validate/validateRoute", () => ({
  validateRouteInput: vi.fn(),
}));

import { scaffoldRoute } from "../scaffold/scaffoldRoute";
import { validateRouteInput } from "../validate/validateRoute";

const mockScaffold = vi.mocked(scaffoldRoute);
const mockValidate = vi.mocked(validateRouteInput);

describe("summarizeBatchResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct counts for all successful results", () => {
    const results = [
      { route: "users", success: true },
      { route: "posts", success: true },
      { route: "comments", success: true },
    ];

    const summary = summarizeBatchResults(results);

    expect(summary.total).toBe(3);
    expect(summary.succeeded).toBe(3);
    expect(summary.failed).toBe(0);
    expect(summary.failures).toHaveLength(0);
  });

  it("returns correct counts when some routes fail", () => {
    const results = [
      { route: "users", success: true },
      { route: "bad-route", success: false, error: "Invalid route name" },
      { route: "posts", success: true },
      { route: "another-bad", success: false, error: "Output dir missing" },
    ];

    const summary = summarizeBatchResults(results);

    expect(summary.total).toBe(4);
    expect(summary.succeeded).toBe(2);
    expect(summary.failed).toBe(2);
    expect(summary.failures).toHaveLength(2);
    expect(summary.failures[0]).toMatchObject({
      route: "bad-route",
      error: "Invalid route name",
    });
    expect(summary.failures[1]).toMatchObject({
      route: "another-bad",
      error: "Output dir missing",
    });
  });

  it("returns correct counts when all routes fail", () => {
    const results = [
      { route: "bad1", success: false, error: "Error A" },
      { route: "bad2", success: false, error: "Error B" },
    ];

    const summary = summarizeBatchResults(results);

    expect(summary.total).toBe(2);
    expect(summary.succeeded).toBe(0);
    expect(summary.failed).toBe(2);
    expect(summary.failures).toHaveLength(2);
  });

  it("handles an empty results array", () => {
    const summary = summarizeBatchResults([]);

    expect(summary.total).toBe(0);
    expect(summary.succeeded).toBe(0);
    expect(summary.failed).toBe(0);
    expect(summary.failures).toHaveLength(0);
  });

  it("includes route name in each failure entry", () => {
    const results = [
      { route: "broken", success: false, error: "Something went wrong" },
    ];

    const summary = summarizeBatchResults(results);

    expect(summary.failures[0].route).toBe("broken");
    expect(summary.failures[0].error).toBe("Something went wrong");
  });

  it("does not include successful routes in failures list", () => {
    const results = [
      { route: "ok", success: true },
      { route: "fail", success: false, error: "oops" },
    ];

    const summary = summarizeBatchResults(results);
    const failureRoutes = summary.failures.map((f) => f.route);

    expect(failureRoutes).not.toContain("ok");
    expect(failureRoutes).toContain("fail");
  });
});
