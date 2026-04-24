import fs from 'fs';
import path from 'path';
import { generateRouteTemplate, type RouteTemplateOptions } from './routeTemplate';
import type { SnapRouteConfig } from '../config/snaproute.config';

export interface WriteRouteResult {
  filePath: string;
  created: boolean;
  skipped: boolean;
}

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

  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');

  return { filePath, created: true, skipped: false };
}

export function resolveRoutePath(
  routeName: string,
  config: Partial<SnapRouteConfig>
): string {
  const baseDir = config.routesDir ?? 'src/app/api';
  return path.join(process.cwd(), baseDir, routeName, 'route.ts');
}
