/**
 * @module config
 *
 * Public API for snaproute configuration resolution.
 *
 * Usage:
 *   import { loadConfig, defineConfig, DEFAULT_CONFIG } from './config';
 *
 *   // In snaproute.config.ts:
 *   export default defineConfig({ apiDir: 'src/app/api', routerType: 'app' });
 *
 *   // In CLI or programmatic usage:
 *   const config = await loadConfig();
 */

export { loadConfig } from './loadConfig';
export {
  defineConfig,
  DEFAULT_CONFIG,
} from './snaproute.config';
export type {
  SnaprouteConfig,
  HttpMethod,
} from './snaproute.config';
