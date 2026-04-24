import * as fs from "fs";
import * as path from "path";
import { generateRouteTemplate } from "../template/routeTemplate";
import { resolveRoutePath } from "../template/writeRoute";
import { SnapRouteConfig } from "../config/snaproute.config";

export interface ScaffoldOptions {
  routeName: string;
  methods: string[];
  outputDir: string;
  typescript?: boolean;
  overwrite?: boolean;
}

export interface ScaffoldResult {
  success: boolean;
  filePath: string;
  message: string;
}

export function scaffoldRoute(
  options: ScaffoldOptions,
  config?: Partial<SnapRouteConfig>
): ScaffoldResult {
  const { routeName, methods, outputDir, typescript = true, overwrite = false } = options;

  const resolvedPath = resolveRoutePath(routeName, outputDir);
  const ext = typescript ? "ts" : "js";
  const filePath = `${resolvedPath}.${ext}`;

  if (fs.existsSync(filePath) && !overwrite) {
    return {
      success: false,
      filePath,
      message: `Route already exists at ${filePath}. Use --overwrite to replace it.`,
    };
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const template = generateRouteTemplate(routeName, methods, { typescript, ...config });

  fs.writeFileSync(filePath, template, "utf-8");

  return {
    success: true,
    filePath,
    message: `Route scaffolded successfully at ${filePath}`,
  };
}
