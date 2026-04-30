import * as fs from "fs";
import * as path from "path";

export interface SearchResult {
  file: string;
  routeName: string;
  methods: string[];
  matchedOn: "name" | "method" | "tag";
}

export interface SearchOptions {
  query: string;
  outputDir: string;
  tags?: Record<string, string[]>;
}

export function searchRoutes(options: SearchOptions): SearchResult[] {
  const { query, outputDir, tags = {} } = options;
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  if (!fs.existsSync(outputDir)) {
    return results;
  }

  const files = fs.readdirSync(outputDir).filter((f) => f.endsWith(".ts"));

  for (const file of files) {
    const filePath = path.join(outputDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const routeName = file.replace(/\.ts$/, "");

    const methodMatches = content.match(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)/g) ?? [];
    const methods = methodMatches.map((m) => m.replace(/.*?(GET|POST|PUT|PATCH|DELETE).*/, "$1"));

    const nameMatch = routeName.toLowerCase().includes(lowerQuery);
    const methodMatch = methods.some((m) => m.toLowerCase().includes(lowerQuery));

    const routeTags = tags[routeName] ?? [];
    const tagMatch = routeTags.some((t) => t.toLowerCase().includes(lowerQuery));

    if (nameMatch) {
      results.push({ file: filePath, routeName, methods, matchedOn: "name" });
    } else if (methodMatch) {
      results.push({ file: filePath, routeName, methods, matchedOn: "method" });
    } else if (tagMatch) {
      results.push({ file: filePath, routeName, methods, matchedOn: "tag" });
    }
  }

  return results;
}
