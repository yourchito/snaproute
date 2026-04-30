import fs from "fs";
import path from "path";

export interface PinnedRoute {
  name: string;
  outputDir: string;
  methods: string[];
  pinnedAt: string;
}

export interface PinStore {
  pins: PinnedRoute[];
}

export function resolvePinFilePath(baseDir: string = process.cwd()): string {
  return path.join(baseDir, ".snaproute", "pins.json");
}

export function loadPins(baseDir?: string): PinStore {
  const filePath = resolvePinFilePath(baseDir);
  if (!fs.existsSync(filePath)) {
    return { pins: [] };
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as PinStore;
  } catch {
    return { pins: [] };
  }
}

export function savePins(store: PinStore, baseDir?: string): void {
  const filePath = resolvePinFilePath(baseDir);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
}

export function pinRoute(
  name: string,
  outputDir: string,
  methods: string[],
  baseDir?: string
): { success: boolean; message: string } {
  const store = loadPins(baseDir);
  const existing = store.pins.find((p) => p.name === name);
  if (existing) {
    return { success: false, message: `Route "${name}" is already pinned.` };
  }
  store.pins.push({ name, outputDir, methods, pinnedAt: new Date().toISOString() });
  savePins(store, baseDir);
  return { success: true, message: `Route "${name}" pinned successfully.` };
}

export function unpinRoute(
  name: string,
  baseDir?: string
): { success: boolean; message: string } {
  const store = loadPins(baseDir);
  const index = store.pins.findIndex((p) => p.name === name);
  if (index === -1) {
    return { success: false, message: `Route "${name}" is not pinned.` };
  }
  store.pins.splice(index, 1);
  savePins(store, baseDir);
  return { success: true, message: `Route "${name}" unpinned successfully.` };
}

export function listPins(baseDir?: string): PinnedRoute[] {
  return loadPins(baseDir).pins;
}
