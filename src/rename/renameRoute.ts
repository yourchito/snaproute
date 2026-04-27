import fs from "fs";
import path from "path";
import { resolveRoutePath } from "../template/writeRoute";
import { resolveDocsPath } from "../docs/writeDocsFile";
import { resolveHistoryPath, loadHistory, appendHistory } from "../history/routeHistory";

export interface RenameResult {
  success: boolean;
  oldRoutePath: string;
  newRoutePath: string;
  oldDocsPath?: string;
  newDocsPath?: string;
  error?: string;
}

export async function renameRoute(
  oldName: string,
  newName: string,
  outputDir: string,
  docsDir?: string
): Promise<RenameResult> {
  const oldRoutePath = resolveRoutePath(oldName, outputDir);
  const newRoutePath = resolveRoutePath(newName, outputDir);

  if (!fs.existsSync(oldRoutePath)) {
    return {
      success: false,
      oldRoutePath,
      newRoutePath,
      error: `Route file not found: ${oldRoutePath}`,
    };
  }

  if (fs.existsSync(newRoutePath)) {
    return {
      success: false,
      oldRoutePath,
      newRoutePath,
      error: `A route already exists at: ${newRoutePath}`,
    };
  }

  const newRouteDir = path.dirname(newRoutePath);
  fs.mkdirSync(newRouteDir, { recursive: true });
  fs.renameSync(oldRoutePath, newRoutePath);

  let oldDocsPath: string | undefined;
  let newDocsPath: string | undefined;

  if (docsDir) {
    oldDocsPath = resolveDocsPath(oldName, docsDir);
    newDocsPath = resolveDocsPath(newName, docsDir);
    if (fs.existsSync(oldDocsPath)) {
      const newDocsDir = path.dirname(newDocsPath);
      fs.mkdirSync(newDocsDir, { recursive: true });
      fs.renameSync(oldDocsPath, newDocsPath);
    }
  }

  await appendHistory(resolveHistoryPath(outputDir), {
    action: "rename",
    routeName: newName,
    filePath: newRoutePath,
    timestamp: new Date().toISOString(),
    meta: { previousName: oldName },
  });

  return { success: true, oldRoutePath, newRoutePath, oldDocsPath, newDocsPath };
}

export function formatRenameResult(result: RenameResult): string {
  if (!result.success) {
    return `✖ Rename failed: ${result.error}`;
  }
  const lines = [
    `✔ Route renamed successfully`,
    `  ${result.oldRoutePath} → ${result.newRoutePath}`,
  ];
  if (result.oldDocsPath && result.newDocsPath) {
    lines.push(`  ${result.oldDocsPath} → ${result.newDocsPath}`);
  }
  return lines.join("\n");
}
