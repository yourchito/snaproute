import * as fs from "fs";
import * as path from "path";

export interface AuditEntry {
  route: string;
  filePath: string;
  issues: AuditIssue[];
}

export interface AuditIssue {
  severity: "error" | "warning" | "info";
  message: string;
}

export interface AuditResult {
  entries: AuditEntry[];
  totalRoutes: number;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
}

function collectRouteFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectRouteFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      results.push(full);
    }
  }
  return results;
}

function auditFile(filePath: string, baseDir: string): AuditEntry {
  const route = path.relative(baseDir, filePath).replace(/\.ts$/, "");
  const content = fs.readFileSync(filePath, "utf-8");
  const issues: AuditIssue[] = [];

  if (!content.includes("export default")) {
    issues.push({ severity: "error", message: "Missing default export handler" });
  }

  if (!/(GET|POST|PUT|DELETE|PATCH)/.test(content)) {
    issues.push({ severity: "warning", message: "No HTTP method found in handler" });
  }

  if (!content.includes("NextApiRequest") && !content.includes("NextRequest")) {
    issues.push({ severity: "info", message: "No typed request parameter detected" });
  }

  if (content.includes("any")) {
    issues.push({ severity: "warning", message: "Usage of 'any' type detected" });
  }

  return { route, filePath, issues };
}

export function auditRoutes(outputDir: string): AuditResult {
  const files = collectRouteFiles(outputDir);
  const entries = files.map((f) => auditFile(f, outputDir));

  let errorCount = 0;
  let warningCount = 0;
  let totalIssues = 0;

  for (const entry of entries) {
    for (const issue of entry.issues) {
      totalIssues++;
      if (issue.severity === "error") errorCount++;
      if (issue.severity === "warning") warningCount++;
    }
  }

  return {
    entries,
    totalRoutes: files.length,
    totalIssues,
    errorCount,
    warningCount,
  };
}
