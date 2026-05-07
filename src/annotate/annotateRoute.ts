import fs from "fs";
import path from "path";

export interface RouteAnnotation {
  route: string;
  note: string;
  author?: string;
  createdAt: string;
}

export interface AnnotationStore {
  annotations: RouteAnnotation[];
}

export interface AnnotateResult {
  success: boolean;
  route: string;
  action: "added" | "removed" | "listed";
  annotations?: RouteAnnotation[];
  message?: string;
}

export function resolveAnnotationFilePath(outputDir: string): string {
  return path.join(outputDir, ".snaproute", "annotations.json");
}

export function loadAnnotations(filePath: string): AnnotationStore {
  if (!fs.existsSync(filePath)) return { annotations: [] };
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as AnnotationStore;
  } catch {
    return { annotations: [] };
  }
}

export function saveAnnotations(filePath: string, store: AnnotationStore): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
}

export function addAnnotation(
  outputDir: string,
  route: string,
  note: string,
  author?: string
): AnnotateResult {
  const filePath = resolveAnnotationFilePath(outputDir);
  const store = loadAnnotations(filePath);
  const entry: RouteAnnotation = {
    route,
    note,
    author,
    createdAt: new Date().toISOString(),
  };
  store.annotations.push(entry);
  saveAnnotations(filePath, store);
  return { success: true, route, action: "added", message: `Annotation added to "${route}".` };
}

export function removeAnnotations(outputDir: string, route: string): AnnotateResult {
  const filePath = resolveAnnotationFilePath(outputDir);
  const store = loadAnnotations(filePath);
  const before = store.annotations.length;
  store.annotations = store.annotations.filter((a) => a.route !== route);
  const removed = before - store.annotations.length;
  saveAnnotations(filePath, store);
  return {
    success: removed > 0,
    route,
    action: "removed",
    message: removed > 0 ? `Removed ${removed} annotation(s) from "${route}".` : `No annotations found for "${route}".`,
  };
}

export function getAnnotations(outputDir: string, route: string): AnnotateResult {
  const filePath = resolveAnnotationFilePath(outputDir);
  const store = loadAnnotations(filePath);
  const annotations = store.annotations.filter((a) => a.route === route);
  return { success: true, route, action: "listed", annotations };
}
