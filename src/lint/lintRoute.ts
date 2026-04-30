import * as fs from "fs";
import * as path from "path";

export interface LintIssue {
  line: number;
  message: string;
  severity: "error" | "warning";
}

export interface LintResult {
  filePath: string;
  issues: LintIssue[];
  ok: boolean;
}

const RULES: Array<{
  name: string;
  severity: "error" | "warning";
  check: (lines: string[], filePath: string) => LintIssue[];
}> = [
  {
    name: "no-default-export-missing",
    severity: "error",
    check: (lines) => {
      const hasDefault = lines.some((l) => /export default/.test(l));
      if (!hasDefault) {
        return [{ line: 0, message: "Missing default export in route file.", severity: "error" }];
      }
      return [];
    },
  },
  {
    name: "handler-typed",
    severity: "warning",
    check: (lines) => {
      const issues: LintIssue[] = [];
      lines.forEach((line, i) => {
        if (/function handler\(/.test(line) && !/NextApiRequest/.test(line)) {
          issues.push({
            line: i + 1,
            message: "Handler function should use typed NextApiRequest/NextApiResponse parameters.",
            severity: "warning",
          });
        }
      });
      return issues;
    },
  },
  {
    name: "no-console",
    severity: "warning",
    check: (lines) => {
      const issues: LintIssue[] = [];
      lines.forEach((line, i) => {
        if (/console\.log/.test(line)) {
          issues.push({
            line: i + 1,
            message: "Avoid using console.log in route handlers.",
            severity: "warning",
          });
        }
      });
      return issues;
    },
  },
  {
    name: "method-check",
    severity: "error",
    check: (lines) => {
      const hasMethodCheck = lines.some((l) => /req\.method/.test(l));
      if (!hasMethodCheck) {
        return [
          {
            line: 0,
            message: "Route handler should check req.method to guard HTTP methods.",
            severity: "error",
          },
        ];
      }
      return [];
    },
  },
];

export function lintRoute(filePath: string): LintResult {
  if (!fs.existsSync(filePath)) {
    return {
      filePath,
      issues: [{ line: 0, message: `File not found: ${filePath}`, severity: "error" }],
      ok: false,
    };
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const issues: LintIssue[] = [];

  for (const rule of RULES) {
    const found = rule.check(lines, filePath);
    issues.push(...found);
  }

  return {
    filePath,
    issues,
    ok: issues.filter((i) => i.severity === "error").length === 0,
  };
}
