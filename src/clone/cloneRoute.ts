import fs from "fs";
import path from "path";

export interface CloneRouteOptions {
  sourceDir: string;
  outputDir: string;
  sourceName: string;
  targetName: string;
}

export interface CloneRouteResult {
  success: boolean;
  sourcePath: string;
  targetPath: string;
  error?: string;
}

export function resolveRoutePath(dir: string, name: string): string {
  const normalized = name.replace(/\/+/g, path.sep);
  return path.join(dir, ...normalized.split(path.sep), "route.ts");
}

export function formatCloneResult(result: CloneRouteResult): string {
  if (!result.success) {
    return `❌ Clone failed: ${result.error}`;
  }
  return `✅ Cloned route\n   From: ${result.sourcePath}\n   To:   ${result.targetPath}`;
}

export function cloneRoute(options: CloneRouteOptions): CloneRouteResult {
  const { sourceDir, outputDir, sourceName, targetName } = options;

  const sourcePath = resolveRoutePath(sourceDir, sourceName);
  const targetPath = resolveRoutePath(outputDir, targetName);

  if (!fs.existsSync(sourcePath)) {
    return {
      success: false,
      sourcePath,
      targetPath,
      error: `Source route not found: ${sourcePath}`,
    };
  }

  if (fs.existsSync(targetPath)) {
    return {
      success: false,
      sourcePath,
      targetPath,
      error: `Target route already exists: ${targetPath}`,
    };
  }

  const targetDir = path.dirname(targetPath);
  fs.mkdirSync(targetDir, { recursive: true });

  const content = fs.readFileSync(sourcePath, "utf-8");
  fs.writeFileSync(targetPath, content, "utf-8");

  return { success: true, sourcePath, targetPath };
}
