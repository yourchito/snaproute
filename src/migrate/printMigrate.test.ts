import { describe, it, expect, vi, beforeEach } from "vitest";
import { printMigrateResult, printMigrateSummary } from "./printMigrate";
import type { MigrateResult } from "./migrateRoute";

function makeResult(overrides: Partial<MigrateResult> = {}): MigrateResult {
  return {
    entries: [],
    moved: 0,
    skipped: 0,
    errors: 0,
    ...overrides,
  };
}

describe("printMigrateResult", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints dry run label when dryRun is true", () => {
    const result = makeResult({ moved: 1, entries: [{ source: "a.ts", destination: "b.ts", status: "moved" }] });
    printMigrateResult(result, true);
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).toContain("DRY RUN");
  });

  it("prints no files message when entries is empty", () => {
    printMigrateResult(makeResult());
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).toContain("No route files found");
  });

  it("prints entries when present", () => {
    const result = makeResult({
      moved: 1,
      entries: [{ source: "src/users.ts", destination: "dest/users.ts", status: "moved" }],
    });
    printMigrateResult(result);
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).toContain("users.ts");
  });
});

describe("printMigrateSummary", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints moved, skipped, and errors counts", () => {
    const result = makeResult({ moved: 3, skipped: 1, errors: 0 });
    printMigrateSummary(result);
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).toContain("3");
    expect(calls).toContain("1");
  });

  it("prints dry run hint when dryRun is true", () => {
    printMigrateSummary(makeResult(), true);
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).toContain("dry-run");
  });

  it("does not print dry run hint when dryRun is false", () => {
    printMigrateSummary(makeResult(), false);
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).not.toContain("dry-run");
  });
});
