import type { AuditResult, AuditEntry, AuditIssue } from "./auditRoutes";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  gray: "\x1b[90m",
};

function severityColor(severity: AuditIssue["severity"]): string {
  if (severity === "error") return c.red;
  if (severity === "warning") return c.yellow;
  return c.cyan;
}

function severityLabel(severity: AuditIssue["severity"]): string {
  if (severity === "error") return "ERR ";
  if (severity === "warning") return "WARN";
  return "INFO";
}

export function printAuditEntry(entry: AuditEntry): void {
  if (entry.issues.length === 0) {
    console.log(`${c.green}✔${c.reset} ${c.bold}${entry.route}${c.reset}`);
    return;
  }
  console.log(`\n${c.bold}${entry.route}${c.reset}`);
  for (const issue of entry.issues) {
    const col = severityColor(issue.severity);
    const label = severityLabel(issue.severity);
    console.log(`  ${col}[${label}]${c.reset} ${issue.message}`);
  }
}

export function printAuditResult(result: AuditResult): void {
  if (result.totalRoutes === 0) {
    console.log(`${c.gray}No route files found.${c.reset}`);
    return;
  }
  for (const entry of result.entries) {
    printAuditEntry(entry);
  }
  console.log("");
  printAuditSummary(result);
}

export function printAuditSummary(result: AuditResult): void {
  const { totalRoutes, totalIssues, errorCount, warningCount } = result;
  const clean = totalRoutes - result.entries.filter((e) => e.issues.length > 0).length;
  console.log(
    `${c.bold}Audit Summary:${c.reset} ${totalRoutes} route(s) scanned — ` +
      `${c.red}${errorCount} error(s)${c.reset}, ` +
      `${c.yellow}${warningCount} warning(s)${c.reset}, ` +
      `${c.green}${clean} clean${c.reset}`
  );
  if (totalIssues === 0) {
    console.log(`${c.green}All routes passed audit.${c.reset}`);
  }
}
