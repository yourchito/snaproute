import fs from "fs";
import path from "path";

export interface LockEntry {
  route: string;
  lockedAt: string;
  reason?: string;
}

export interface LockStore {
  locked: LockEntry[];
}

export interface LockResult {
  success: boolean;
  route: string;
  action: "lock" | "unlock" | "check";
  message: string;
  alreadyLocked?: boolean;
}

export function resolveLockFilePath(outputDir: string): string {
  return path.join(outputDir, ".snaproute", "locks.json");
}

export function loadLocks(outputDir: string): LockStore {
  const filePath = resolveLockFilePath(outputDir);
  if (!fs.existsSync(filePath)) return { locked: [] };
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as LockStore;
  } catch {
    return { locked: [] };
  }
}

export function saveLocks(outputDir: string, store: LockStore): void {
  const filePath = resolveLockFilePath(outputDir);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
}

export function lockRoute(outputDir: string, route: string, reason?: string): LockResult {
  const store = loadLocks(outputDir);
  const existing = store.locked.find((e) => e.route === route);
  if (existing) {
    return { success: false, route, action: "lock", message: `Route "${route}" is already locked.`, alreadyLocked: true };
  }
  store.locked.push({ route, lockedAt: new Date().toISOString(), reason });
  saveLocks(outputDir, store);
  return { success: true, route, action: "lock", message: `Route "${route}" has been locked.` };
}

export function unlockRoute(outputDir: string, route: string): LockResult {
  const store = loadLocks(outputDir);
  const index = store.locked.findIndex((e) => e.route === route);
  if (index === -1) {
    return { success: false, route, action: "unlock", message: `Route "${route}" is not locked.` };
  }
  store.locked.splice(index, 1);
  saveLocks(outputDir, store);
  return { success: true, route, action: "unlock", message: `Route "${route}" has been unlocked.` };
}

export function isRouteLocked(outputDir: string, route: string): boolean {
  const store = loadLocks(outputDir);
  return store.locked.some((e) => e.route === route);
}

export function listLockedRoutes(outputDir: string): LockEntry[] {
  return loadLocks(outputDir).locked;
}
