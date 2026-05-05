import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  printGroupResult,
  printRoutesInGroup,
  printAllGroups,
  printGroupSummary,
} from "./printGroups";
import { RouteGroups } from "./groupRoutes";

describe("printGroupResult", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints action with route and group", () => {
    printGroupResult("added", "auth", "users/login");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("added"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("auth"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("users/login"));
  });

  it("prints action with group only", () => {
    printGroupResult("removed", "auth");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("removed"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("auth"));
  });
});

describe("printRoutesInGroup", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints routes in a group", () => {
    printRoutesInGroup("auth", ["users/login", "users/logout"]);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("auth"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("users/login"));
  });

  it("prints empty message when no routes", () => {
    printRoutesInGroup("empty", []);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("no routes"));
  });
});

describe("printAllGroups", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints all groups and their routes", () => {
    const groups: RouteGroups = {
      auth: ["users/login"],
      data: ["products", "orders"],
    };
    printAllGroups(groups);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("auth"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("data"));
  });

  it("prints message when no groups", () => {
    printAllGroups({});
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("No groups"));
  });
});

describe("printGroupSummary", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints summary with correct counts", () => {
    const groups: RouteGroups = { auth: ["login", "logout"], data: ["products"] };
    printGroupSummary(groups);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("2 groups"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("3 routes"));
  });

  it("uses singular for single group and route", () => {
    const groups: RouteGroups = { auth: ["login"] };
    printGroupSummary(groups);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("1 group,"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("1 route"));
  });
});
