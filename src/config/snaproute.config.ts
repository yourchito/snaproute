export interface SnaprouteConfig {
  /**
   * Root directory for Next.js API routes
   * @default 'src/app/api' or 'pages/api'
   */
  apiDir: string;

  /**
   * Output directory for generated documentation
   * @default 'docs/api'
   */
  docsDir: string;

  /**
   * Default HTTP methods to scaffold when none are specified
   * @default ['GET', 'POST']
   */
  defaultMethods: HttpMethod[];

  /**
   * Whether to use the App Router (Next.js 13+) or Pages Router
   * @default 'app'
   */
  routerType: 'app' | 'pages';

  /**
   * Whether to auto-generate JSDoc comments in scaffolded files
   * @default true
   */
  generateDocs: boolean;

  /**
   * TypeScript strict mode for generated handlers
   * @default true
   */
  strict: boolean;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export const DEFAULT_CONFIG: SnaprouteConfig = {
  apiDir: 'src/app/api',
  docsDir: 'docs/api',
  defaultMethods: ['GET', 'POST'],
  routerType: 'app',
  generateDocs: true,
  strict: true,
};

export function defineConfig(config: Partial<SnaprouteConfig>): SnaprouteConfig {
  return { ...DEFAULT_CONFIG, ...config };
}
