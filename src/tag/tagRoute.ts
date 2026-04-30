import * as fs from "fs";
import * as path from "path";

export interface TagStore {
  [routeName: string]: string[];
}

export interface TagResult {
  success: boolean;
  message: string;
  routeName?: string;
  tags?: string[];
}

export function resolveTagFilePath(outputDir: string): string {
  return path.join(outputDir, ".snaproute", "tags.json");
}

export function loadTags(tagFilePath: string): TagStore {
  if (!fs.existsSync(tagFilePath)) return {};
  try {
    const raw = fs.readFileSync(tagFilePath, "utf-8");
    return JSON.parse(raw) as TagStore;
  } catch {
    return {};
  }
}

export function saveTags(tagFilePath: string, store: TagStore): void {
  const dir = path.dirname(tagFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tagFilePath, JSON.stringify(store, null, 2), "utf-8");
}

export function addTag(tagFilePath: string, routeName: string, tag: string): TagResult {
  const store = loadTags(tagFilePath);
  const existing = store[routeName] ?? [];
  if (existing.includes(tag)) {
    return { success: false, message: `Tag "${tag}" already exists on route "${routeName}".` };
  }
  store[routeName] = [...existing, tag];
  saveTags(tagFilePath, store);
  return { success: true, message: `Tag "${tag}" added to route "${routeName}".`, routeName, tags: store[routeName] };
}

export function removeTag(tagFilePath: string, routeName: string, tag: string): TagResult {
  const store = loadTags(tagFilePath);
  const existing = store[routeName] ?? [];
  if (!existing.includes(tag)) {
    return { success: false, message: `Tag "${tag}" not found on route "${routeName}".` };
  }
  store[routeName] = existing.filter((t) => t !== tag);
  saveTags(tagFilePath, store);
  return { success: true, message: `Tag "${tag}" removed from route "${routeName}".`, routeName, tags: store[routeName] };
}

export function listTagsForRoute(tagFilePath: string, routeName: string): string[] {
  const store = loadTags(tagFilePath);
  return store[routeName] ?? [];
}

export function listRoutesByTag(tagFilePath: string, tag: string): string[] {
  const store = loadTags(tagFilePath);
  return Object.entries(store)
    .filter(([, tags]) => tags.includes(tag))
    .map(([routeName]) => routeName);
}
