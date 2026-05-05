import * as fs from "fs";
import * as path from "path";

export interface RouteStats {
  totalRoutes: number;
  methodCounts: Record<string, number>;
  mostUsedMethods: string[];
  averageMethodsPerRoute: number;
  routeNames: string[];
  generatedAt: string;
}

export interface RouteEntry {
  name: string;
  methods: string[];
}

export function parseRoutesFromDir(outputDir: string): RouteEntry[] {
  if (!fs.existsSync(outputDir)) return [];

  const entries: RouteEntry[] = [];

  const walk = (dir: string) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        walk(fullPath);
      } else if (item.name.endsWith(".ts") || item.name.endsWith(".js")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const methods = extractMethodsFromContent(content);
        const name = path
          .relative(outputDir, fullPath)
          .replace(/\.tsx?$/, "")
          .replace(/\\/g, "/");
        entries.push({ name, methods });
      }
    }
  };

  walk(outputDir);
  return entries;
}

export function extractMethodsFromContent(content: string): string[] {
  const methodPattern = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)/g;
  const methods: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = methodPattern.exec(content)) !== null) {
    methods.push(match[1]);
  }
  return methods;
}

export function computeRouteStats(entries: RouteEntry[]): RouteStats {
  const methodCounts: Record<string, number> = {};

  for (const entry of entries) {
    for (const method of entry.methods) {
      methodCounts[method] = (methodCounts[method] ?? 0) + 1;
    }
  }

  const totalMethods = entries.reduce((sum, e) => sum + e.methods.length, 0);
  const averageMethodsPerRoute =
    entries.length > 0 ? parseFloat((totalMethods / entries.length).toFixed(2)) : 0;

  const mostUsedMethods = Object.entries(methodCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([method]) => method);

  return {
    totalRoutes: entries.length,
    methodCounts,
    mostUsedMethods,
    averageMethodsPerRoute,
    routeNames: entries.map((e) => e.name),
    generatedAt: new Date().toISOString(),
  };
}
