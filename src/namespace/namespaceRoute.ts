import * as fs from 'fs';
import * as path from 'path';

export type NamespaceMap = Record<string, string[]>;

export function resolveNamespaceFilePath(baseDir: string): string {
  return path.join(baseDir, '.snaproute', 'namespaces.json');
}

export function loadNamespaces(baseDir: string): NamespaceMap {
  const filePath = resolveNamespaceFilePath(baseDir);
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as NamespaceMap;
  } catch {
    return {};
  }
}

export function saveNamespaces(baseDir: string, namespaces: NamespaceMap): void {
  const filePath = resolveNamespaceFilePath(baseDir);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(namespaces, null, 2), 'utf-8');
}

export function addRouteToNamespace(
  baseDir: string,
  namespace: string,
  route: string
): { success: boolean; message: string } {
  const namespaces = loadNamespaces(baseDir);
  if (!namespaces[namespace]) namespaces[namespace] = [];
  if (namespaces[namespace].includes(route)) {
    return { success: false, message: `Route "${route}" already exists in namespace "${namespace}".` };
  }
  namespaces[namespace].push(route);
  saveNamespaces(baseDir, namespaces);
  return { success: true, message: `Route "${route}" added to namespace "${namespace}".` };
}

export function removeRouteFromNamespace(
  baseDir: string,
  namespace: string,
  route: string
): { success: boolean; message: string } {
  const namespaces = loadNamespaces(baseDir);
  if (!namespaces[namespace]) {
    return { success: false, message: `Namespace "${namespace}" does not exist.` };
  }
  const idx = namespaces[namespace].indexOf(route);
  if (idx === -1) {
    return { success: false, message: `Route "${route}" not found in namespace "${namespace}".` };
  }
  namespaces[namespace].splice(idx, 1);
  saveNamespaces(baseDir, namespaces);
  return { success: true, message: `Route "${route}" removed from namespace "${namespace}".` };
}

export function listNamespaces(baseDir: string): NamespaceMap {
  return loadNamespaces(baseDir);
}

export function getRoutesInNamespace(baseDir: string, namespace: string): string[] {
  const namespaces = loadNamespaces(baseDir);
  return namespaces[namespace] ?? [];
}
