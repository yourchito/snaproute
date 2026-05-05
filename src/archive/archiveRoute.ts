import fs from "fs";
import path from "path";

export interface ArchiveEntry {
  route: string;
  archivedAt: string;
  originalPath: string;
}

export interface ArchiveResult {
  success: boolean;
  route: string;
  archivePath?: string;
  error?: string;
}

export function resolveArchiveDir(outputDir: string): string {
  return path.join(outputDir, ".snaproute", "archive");
}

export function resolveArchivePath(archiveDir: string, route: string): string {
  const safe = route.replace(/[\/\\]/g, "__");
  return path.join(archiveDir, `${safe}.ts`);
}

export function archiveRoute(
  route: string,
  outputDir: string
): ArchiveResult {
  const routeFile = path.join(outputDir, `${route}.ts`);

  if (!fs.existsSync(routeFile)) {
    return { success: false, route, error: `Route file not found: ${routeFile}` };
  }

  const archiveDir = resolveArchiveDir(outputDir);
  fs.mkdirSync(archiveDir, { recursive: true });

  const archivePath = resolveArchivePath(archiveDir, route);

  if (fs.existsSync(archivePath)) {
    return { success: false, route, error: `Archive already exists: ${archivePath}` };
  }

  const content = fs.readFileSync(routeFile, "utf-8");
  const header = `// archived: ${new Date().toISOString()}\n// original: ${routeFile}\n\n`;
  fs.writeFileSync(archivePath, header + content, "utf-8");
  fs.unlinkSync(routeFile);

  return { success: true, route, archivePath };
}

export function restoreRoute(
  route: string,
  outputDir: string
): ArchiveResult {
  const archiveDir = resolveArchiveDir(outputDir);
  const archivePath = resolveArchivePath(archiveDir, route);

  if (!fs.existsSync(archivePath)) {
    return { success: false, route, error: `No archive found for route: ${route}` };
  }

  const routeFile = path.join(outputDir, `${route}.ts`);
  const dir = path.dirname(routeFile);
  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(routeFile)) {
    return { success: false, route, error: `Route file already exists: ${routeFile}` };
  }

  let content = fs.readFileSync(archivePath, "utf-8");
  content = content.replace(/^\/\/ archived:.*\n\/\/ original:.*\n\n/, "");
  fs.writeFileSync(routeFile, content, "utf-8");
  fs.unlinkSync(archivePath);

  return { success: true, route, archivePath: routeFile };
}

export function listArchives(outputDir: string): string[] {
  const archiveDir = resolveArchiveDir(outputDir);
  if (!fs.existsSync(archiveDir)) return [];
  return fs
    .readdirSync(archiveDir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.replace(/__/g, "/").replace(/\.ts$/, ""));
}

export function formatArchiveResult(result: ArchiveResult): string {
  if (!result.success) return `✖ ${result.route}: ${result.error}`;
  return `✔ ${result.route} → ${result.archivePath}`;
}
