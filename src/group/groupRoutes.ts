import * as fs from "fs";
import * as path from "path";

export interface RouteGroup {
  name: string;
  routes: string[];
}

export interface GroupMap {
  [groupName: string]: string[];
}

export function resolveGroupFilePath(outputDir: string): string {
  return path.join(outputDir, ".snaproute", "groups.json");
}

export function loadGroups(outputDir: string): GroupMap {
  const filePath = resolveGroupFilePath(outputDir);
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as GroupMap;
  } catch {
    return {};
  }
}

export function saveGroups(outputDir: string, groups: GroupMap): void {
  const filePath = resolveGroupFilePath(outputDir);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(groups, null, 2), "utf-8");
}

export function addRouteToGroup(
  outputDir: string,
  groupName: string,
  routeName: string
): { success: boolean; message: string } {
  const groups = loadGroups(outputDir);
  if (!groups[groupName]) groups[groupName] = [];
  if (groups[groupName].includes(routeName)) {
    return { success: false, message: `Route "${routeName}" is already in group "${groupName}".` };
  }
  groups[groupName].push(routeName);
  saveGroups(outputDir, groups);
  return { success: true, message: `Route "${routeName}" added to group "${groupName}".` };
}

export function removeRouteFromGroup(
  outputDir: string,
  groupName: string,
  routeName: string
): { success: boolean; message: string } {
  const groups = loadGroups(outputDir);
  if (!groups[groupName] || !groups[groupName].includes(routeName)) {
    return { success: false, message: `Route "${routeName}" not found in group "${groupName}".` };
  }
  groups[groupName] = groups[groupName].filter((r) => r !== routeName);
  if (groups[groupName].length === 0) delete groups[groupName];
  saveGroups(outputDir, groups);
  return { success: true, message: `Route "${routeName}" removed from group "${groupName}".` };
}

export function listGroup(outputDir: string, groupName: string): string[] {
  const groups = loadGroups(outputDir);
  return groups[groupName] ?? [];
}

export function listAllGroups(outputDir: string): RouteGroup[] {
  const groups = loadGroups(outputDir);
  return Object.entries(groups).map(([name, routes]) => ({ name, routes }));
}
