import { describe, it, expect, vi, beforeEach } from "vitest";
import { printEnvResult, printEnvSummary } from "./printEnv";
import type { EnvCheckResult } from "./envCheck";

function makeResult(overrides: Partial<EnvCheckResult> = {}): EnvCheckResult {
  return {
    route: "users.ts",
    missingVars: [],
    presentVars: [],
    warnings: [],
    ...overrides,
  };
}

describe("printEnvResult", () => {
  beforeEach(() => { vi.spyOn(console, "log").mockImplementation(() => {}); });

  it("prints a message when no vars are referenced", () => {
    printEnvResult(makeResult());
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("No environment variables referenced")
    );
  });

  it("prints present vars with a checkmark", () => {
    printEnvResult(makeResult({ presentVars: ["API_KEY"] }));
    const calls = (console.log as ReturnType<typeof vi.fn>).mock.calls.flat().join(" ");
    expect(calls).toContain("API_KEY");
  });

  it("prints missing vars with a cross", () => {
    printEnvResult(makeResult({ missingVars: ["DB_URL"], warnings: ["1 variable(s) not set."] }));
    const calls = (console.log as ReturnType<typeof vi.fn>).mock.calls.flat().join(" ");
    expect(calls).toContain("DB_URL");
    expect(calls).toContain("not set");
  });
});

describe("printEnvSummary", () => {
  beforeEach(() => { vi.spyOn(console, "log").mockImplementation(() => {}); });

  it("prints correct totals", () => {
    const results: EnvCheckResult[] = [
      makeResult({ presentVars: ["A", "B"], missingVars: ["C"] }),
      makeResult({ presentVars: ["D"], missingVars: [] }),
    ];
    printEnvSummary(results);
    const calls = (console.log as ReturnType<typeof vi.fn>).mock.calls.flat().join(" ");
    expect(calls).toContain("2");
    expect(calls).toContain("3");
    expect(calls).toContain("1");
  });

  it("shows 0 missing in green when all vars present", () => {
    const results: EnvCheckResult[] = [
      makeResult({ presentVars: ["X"] }),
    ];
    printEnvSummary(results);
    const calls = (console.log as ReturnType<typeof vi.fn>).mock.calls.flat().join(" ");
    expect(calls).toContain("0");
  });
});
