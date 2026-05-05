import fs from "fs";
import path from "path";

export interface RouteCompareResult {
  routeA: string;
  routeB: string;
  matching: string[];
  onlyInA: string[];
  onlyInB: string[];
  methodDiff: Record<string, { a: string[]; b: string[] }>;
}

const METHOD_REGEX = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)/g;

function extractMethods(content: string): string[] {
  const methods: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = METHOD_REGEX.exec(content)) !== null) {
    methods.push(match[1]);
  }
  METHOD_REGEX.lastIndex = 0;
  return methods;
}

function collectRouteFiles(dir: string): Map<string, string> {
  const result = new Map<string, string>();
  if (!fs.existsSync(dir)) return result;
  const walk = (current: string, base: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full, base);
      } else if (entry.name === "route.ts" || entry.name === "route.js") {
        const rel = path.relative(base, full);
        result.set(rel, fs.readFileSync(full, "utf-8"));
      }
    }
  };
  walk(dir, dir);
  return result;
}

export function compareRoutes(
  dirA: string,
  dirB: string
): RouteCompareResult {
  const routesA = collectRouteFiles(dirA);
  const routesB = collectRouteFiles(dirB);

  const keysA = new Set(routesA.keys());
  const keysB = new Set(routesB.keys());

  const matching: string[] = [];
  const onlyInA: string[] = [];
  const onlyInB: string[] = [];
  const methodDiff: Record<string, { a: string[]; b: string[] }> = {};

  for (const key of keysA) {
    if (keysB.has(key)) {
      matching.push(key);
      const methodsA = extractMethods(routesA.get(key)!);
      const methodsB = extractMethods(routesB.get(key)!);
      const setA = new Set(methodsA);
      const setB = new Set(methodsB);
      const isDiff =
        methodsA.some((m) => !setB.has(m)) ||
        methodsB.some((m) => !setA.has(m));
      if (isDiff) {
        methodDiff[key] = { a: methodsA, b: methodsB };
      }
    } else {
      onlyInA.push(key);
    }
  }

  for (const key of keysB) {
    if (!keysA.has(key)) {
      onlyInB.push(key);
    }
  }

  return {
    routeA: dirA,
    routeB: dirB,
    matching,
    onlyInA,
    onlyInB,
    methodDiff,
  };
}
