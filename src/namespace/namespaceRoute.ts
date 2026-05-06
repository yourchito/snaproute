import * as fs from "fs";
import * as path from "path";

export interface NamespaceEntry {
  route: string;
  namespace: string;
  addedAt: string;
}

export interface NamespaceMap {
  [namespace: string]: string[];
}

export function resolveNamespaceFilePath(outputDir: string): string {
  return path.join(outputDir, ".snaproute", "namespaces.json");
}

export function loadNamespaces(filePath: string): NamespaceMap {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as NamespaceMap;
  } catch {
    return {};
  }
}

export function saveNamespaces(filePath: string, map: NamespaceMap): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(map, null, 2), "utf-8");
}

export function addRouteToNamespace(
  outputDir: string,
  namespace: string,
  route: string
): { success: boolean; message: string } {
  const filePath = resolveNamespaceFilePath(outputDir);
  const map = loadNamespaces(filePath);
  if (!map[namespace]) map[namespace] = [];
  if (map[namespace].includes(route)) {
    return { success: false, message: `Route "${route}" is already in namespace "${namespace}".` };
  }
  map[namespace].push(route);
  saveNamespaces(filePath, map);
  return { success: true, message: `Route "${route}" added to namespace "${namespace}".` };
}

export function removeRouteFromNamespace(
  outputDir: string,
  namespace: string,
  route: string
): { success: boolean; message: string } {
  const filePath = resolveNamespaceFilePath(outputDir);
  const map = loadNamespaces(filePath);
  if (!map[namespace] || !map[namespace].includes(route)) {
    return { success: false, message: `Route "${route}" not found in namespace "${namespace}".` };
  }
  map[namespace] = map[namespace].filter((r) => r !== route);
  if (map[namespace].length === 0) delete map[namespace];
  saveNamespaces(filePath, map);
  return { success: true, message: `Route "${route}" removed from namespace "${namespace}".` };
}

export function getRoutesInNamespace(outputDir: string, namespace: string): string[] {
  const filePath = resolveNamespaceFilePath(outputDir);
  const map = loadNamespaces(filePath);
  return map[namespace] ?? [];
}

export function getAllNamespaces(outputDir: string): NamespaceMap {
  const filePath = resolveNamespaceFilePath(outputDir);
  return loadNamespaces(filePath);
}
