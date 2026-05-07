import { describe, it, expect, vi, beforeEach } from "vitest";
import { printLockResult, printLockedRoute, printAllLocks, printLockSummary } from "./printLock";
import type { LockResult, LockEntry } from "./lockRoute";

describe("printLockResult", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints success lock message", () => {
    const result: LockResult = { success: true, route: "users", action: "lock", message: 'Route "users" has been locked.' };
    printLockResult(result);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("locked"));
  });

  it("prints success unlock message", () => {
    const result: LockResult = { success: true, route: "users", action: "unlock", message: 'Route "users" has been unlocked.' };
    printLockResult(result);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("unlocked"));
  });

  it("prints failure message with error icon", () => {
    const result: LockResult = { success: false, route: "users", action: "lock", message: 'Route "users" is already locked.' };
    printLockResult(result);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("already locked"));
  });
});

describe("printLockedRoute", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints route name and locked date", () => {
    const entry: LockEntry = { route: "orders", lockedAt: new Date().toISOString() };
    printLockedRoute(entry);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("orders"));
  });

  it("includes reason when provided", () => {
    const entry: LockEntry = { route: "orders", lockedAt: new Date().toISOString(), reason: "stable" };
    printLockedRoute(entry);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("stable"));
  });
});

describe("printAllLocks", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints message when no locks exist", () => {
    printAllLocks([]);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("No routes"));
  });

  it("prints each locked route", () => {
    const entries: LockEntry[] = [
      { route: "a", lockedAt: new Date().toISOString() },
      { route: "b", lockedAt: new Date().toISOString() },
    ];
    printAllLocks(entries);
    expect(console.log).toHaveBeenCalledTimes(3);
  });
});

describe("printLockSummary", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints zero summary", () => {
    printLockSummary([]);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("0 routes"));
  });

  it("prints count summary", () => {
    const entries: LockEntry[] = [{ route: "x", lockedAt: new Date().toISOString() }];
    printLockSummary(entries);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("1 route"));
  });
});
