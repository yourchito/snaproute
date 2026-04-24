import fs from 'fs';
import path from 'path';
import { SnaprouteConfig, DEFAULT_CONFIG } from './snaproute.config';

const CONFIG_FILE_NAMES = [
  'snaproute.config.ts',
  'snaproute.config.js',
  'snaproute.config.json',
];

/**
 * Searches for a snaproute config file starting from the given directory,
 * walking up to the filesystem root. Returns the resolved config or defaults.
 */
export async function loadConfig(cwd: string = process.cwd()): Promise<SnaprouteConfig> {
  const configPath = findConfigFile(cwd);

  if (!configPath) {
    return DEFAULT_CONFIG;
  }

  try {
    if (configPath.endsWith('.json')) {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<SnaprouteConfig>;
      return { ...DEFAULT_CONFIG, ...parsed };
    }

    // For .ts / .js configs, use dynamic require (works after ts-node or build)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(configPath);
    const userConfig: Partial<SnaprouteConfig> = mod.default ?? mod;
    return { ...DEFAULT_CONFIG, ...userConfig };
  } catch (err) {
    console.warn(`[snaproute] Failed to load config at ${configPath}:`, err);
    return DEFAULT_CONFIG;
  }
}

function findConfigFile(startDir: string): string | null {
  let current = path.resolve(startDir);

  while (true) {
    for (const name of CONFIG_FILE_NAMES) {
      const candidate = path.join(current, name);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    const parent = path.dirname(current);
    if (parent === current) break; // reached filesystem root
    current = parent;
  }

  return null;
}
