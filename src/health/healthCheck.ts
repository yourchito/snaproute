import * as fs from "fs";
import * as path from "path";

export interface HealthCheckResult {
  status: "ok" | "warn" | "error";
  routesDir: string;
  routeCount: number;
  configFound: boolean;
  historyFound: boolean;
  issues: string[];
  warnings: string[];
}

export function runHealthCheck(outputDir: string, configDir: string = process.cwd()): HealthCheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const routesDirExists = fs.existsSync(outputDir);
  let routeCount = 0;

  if (!routesDirExists) {
    issues.push(`Routes directory not found: ${outputDir}`);
  } else {
    try {
      const files = fs.readdirSync(outputDir, { recursive: true }) as string[];
      routeCount = files.filter((f) => f.endsWith(".ts") || f.endsWith(".js")).length;
      if (routeCount === 0) {
        warnings.push("Routes directory exists but contains no route files.");
      }
    } catch {
      issues.push(`Failed to read routes directory: ${outputDir}`);
    }
  }

  const configCandidates = ["snaproute.config.ts", "snaproute.config.js"];
  const configFound = configCandidates.some((f) => fs.existsSync(path.join(configDir, f)));
  if (!configFound) {
    warnings.push("No snaproute config file found. Using defaults.");
  }

  const historyPath = path.join(configDir, ".snaproute_history.json");
  const historyFound = fs.existsSync(historyPath);
  if (!historyFound) {
    warnings.push("No route history file found. History tracking may not be active.");
  }

  let status: "ok" | "warn" | "error" = "ok";
  if (issues.length > 0) status = "error";
  else if (warnings.length > 0) status = "warn";

  return {
    status,
    routesDir: outputDir,
    routeCount,
    configFound,
    historyFound,
    issues,
    warnings,
  };
}
