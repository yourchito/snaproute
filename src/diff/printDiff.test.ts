import { describe, it, expect, vi, beforeEach } from "vitest";
import { printDiff, printDiffSummary } from "./printDiff";
import type { DiffResult } from "./diffRoute";

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});

function makeResult(overrides: Partial<DiffResult> = {}): DiffResult {
  return {
    filePath: "src/pages/api/test.ts",
    exists: false,
    lines: [
      { type: "added", content: "export default function handler() {}", lineNumber: 1 },
    ],
    addedCount: 1,
    removedCount: 0,
    ...overrides,
  };
}

describe("printDiff", () => {
  it("calls console.log for a new file diff", () => {
    printDiff(makeResult());
    expect(console.log).toHaveBeenCalled();
  });

  it("labels existing file as Modified", () => {
    printDiff(makeResult({ exists: true }));
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).toContain("Modified");
  });

  it("labels new file as New file", () => {
    printDiff(makeResult({ exists: false }));
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).toContain("New file");
  });

  it("prints added and removed counts", () => {
    printDiff(makeResult({ addedCount: 3, removedCount: 2 }));
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).toContain("+3");
    expect(calls).toContain("-2");
  });
});

describe("printDiffSummary", () => {
  it("summarizes multiple diff results", () => {
    const results = [
      makeResult({ addedCount: 5, removedCount: 1, exists: false }),
      makeResult({ addedCount: 2, removedCount: 3, exists: true }),
    ];
    printDiffSummary(results);
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).toContain("2 file(s)");
    expect(calls).toContain("+7");
    expect(calls).toContain("-4");
    expect(calls).toContain("1 new");
  });

  it("handles empty results array", () => {
    printDiffSummary([]);
    const calls = (console.log as any).mock.calls.flat().join(" ");
    expect(calls).toContain("0 file(s)");
  });
});
