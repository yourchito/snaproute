import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach } from "vitest";
import {
  resolvePinFilePath,
  loadPins,
  pinRoute,
  unpinRoute,
  listPins,
} from "./pinRoute";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "snaproute-pin-"));
}

describe("resolvePinFilePath", () => {
  it("returns path inside .snaproute directory", () => {
    const result = resolvePinFilePath("/some/project");
    expect(result).toBe("/some/project/.snaproute/pins.json");
  });
});

describe("loadPins", () => {
  it("returns empty store when file does not exist", () => {
    const dir = makeTempDir();
    const store = loadPins(dir);
    expect(store.pins).toEqual([]);
  });

  it("returns empty store on malformed JSON", () => {
    const dir = makeTempDir();
    const filePath = resolvePinFilePath(dir);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "not-json", "utf-8");
    const store = loadPins(dir);
    expect(store.pins).toEqual([]);
  });
});

describe("pinRoute", () => {
  it("pins a new route successfully", () => {
    const dir = makeTempDir();
    const result = pinRoute("users", "src/pages/api", ["GET", "POST"], dir);
    expect(result.success).toBe(true);
    expect(result.message).toContain("users");
    const pins = listPins(dir);
    expect(pins).toHaveLength(1);
    expect(pins[0].name).toBe("users");
    expect(pins[0].methods).toEqual(["GET", "POST"]);
  });

  it("returns failure if route is already pinned", () => {
    const dir = makeTempDir();
    pinRoute("users", "src/pages/api", ["GET"], dir);
    const result = pinRoute("users", "src/pages/api", ["GET"], dir);
    expect(result.success).toBe(false);
    expect(result.message).toContain("already pinned");
  });
});

describe("unpinRoute", () => {
  it("unpins an existing route", () => {
    const dir = makeTempDir();
    pinRoute("orders", "src/pages/api", ["DELETE"], dir);
    const result = unpinRoute("orders", dir);
    expect(result.success).toBe(true);
    expect(listPins(dir)).toHaveLength(0);
  });

  it("returns failure if route is not pinned", () => {
    const dir = makeTempDir();
    const result = unpinRoute("ghost", dir);
    expect(result.success).toBe(false);
    expect(result.message).toContain("not pinned");
  });
});

describe("listPins", () => {
  it("returns all pinned routes", () => {
    const dir = makeTempDir();
    pinRoute("a", "src/pages/api", ["GET"], dir);
    pinRoute("b", "src/pages/api", ["POST"], dir);
    const pins = listPins(dir);
    expect(pins).toHaveLength(2);
    expect(pins.map((p) => p.name)).toEqual(["a", "b"]);
  });
});
