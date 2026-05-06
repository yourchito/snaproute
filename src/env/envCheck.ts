import fs from "fs";
import path from "path";

export interface EnvCheckResult {
  route: string;
  missingVars: string[];
  presentVars: string[];
  warnings: string[];
}

const ENV_VAR_PATTERN = /process\.env\.([A-Z_][A-Z0-9_]*)/g;

export function extractEnvVars(content: string): string[] {
  const matches = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = ENV_VAR_PATTERN.exec(content)) !== null) {
    matches.add(match[1]);
  }
  ENV_VAR_PATTERN.lastIndex = 0;
  return Array.from(matches);
}

export function checkEnvVars(
  vars: string[],
  env: Record<string, string | undefined> = process.env
): { missing: string[]; present: string[] } {
  const missing: string[] = [];
  const present: string[] = [];
  for (const v of vars) {
    if (env[v] !== undefined) {
      present.push(v);
    } else {
      missing.push(v);
    }
  }
  return { missing, present };
}

export function envCheck(
  routePath: string,
  env: Record<string, string | undefined> = process.env
): EnvCheckResult {
  if (!fs.existsSync(routePath)) {
    throw new Error(`Route file not found: ${routePath}`);
  }
  const content = fs.readFileSync(routePath, "utf-8");
  const vars = extractEnvVars(content);
  const { missing, present } = checkEnvVars(vars, env);
  const warnings: string[] = [];
  if (missing.length > 0) {
    warnings.push(
      `${missing.length} environment variable(s) referenced but not set.`
    );
  }
  return {
    route: path.basename(routePath),
    missingVars: missing,
    presentVars: present,
    warnings,
  };
}
