import fs from 'fs';
import path from 'path';
import { generateRouteTemplate, type RouteTemplateOptions } from './routeTemplate';
import type { SnapRouteConfig } from '../config/snaproute.config';

export interface WriteRouteResult {
  filePath: string;
  created: boolean;
  skipped: boolean;
}

/**
 * Writes a route file to disk based on the provided options and config.
 * If the file already exists and `overwrite` is false, the write is skipped.
 *
 * @param options - Template options for the route (e.g. route name, methods)
 * @param config - Partial SnapRoute configuration (e.g. routesDir)
 * @param overwrite - Whether to overwrite an existing route file (default: false)
 * @returns A result object indicating whether the file was created or skipped
 */
export async function writeRoute(
  options: RouteTemplateOptions,
  config: Partial<SnapRouteConfig>,
  overwrite = false
): Promise<WriteRouteResult> {
  const baseDir = config.routesDir ?? 'src/app/api';
  const routeDir = path.join(process.cwd(), baseDir, options.routeName);
  const filePath = path.join(routeDir, 'route.ts');

  if (fs.existsSync(filePath) && !overwrite) {
    return { filePath, created: false, skipped: true };
  }

  const content = generateRouteTemplate(options, config);

  try {
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (err) {
    throw new Error(
      `Failed to write route file at "${filePath}": ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  return { filePath, created: true, skipped: false };
}

/**
 * Resolves the absolute file path for a given route name and config.
 *
 * @param routeName - The name/segment of the route (e.g. "users/[id]")
 * @param config - Partial SnapRoute configuration (e.g. routesDir)
 * @returns The absolute path to the route.ts file
 */
export function resolveRoutePath(
  routeName: string,
  config: Partial<SnapRouteConfig>
): string {
  const baseDir = config.routesDir ?? 'src/app/api';
  return path.join(process.cwd(), baseDir, routeName, 'route.ts');
}
