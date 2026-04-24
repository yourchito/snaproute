/**
 * run.ts
 * Main CLI runner — parses arguments and dispatches to the appropriate command.
 */

import path from "path";
import fs from "fs";
import { parseArgs } from "./parseArgs";
import { printHelp } from "./index";
import { loadConfig } from "../config";
import { generateRouteTemplate } from "../template/routeTemplate";
import { resolveRoutePath } from "../template/writeRoute";

/**
 * Entry point for the snaproute CLI.
 * Reads process.argv, resolves config, and scaffolds the requested route.
 */
export async function run(argv: string[] = process.argv): Promise<void> {
  const args = parseArgs(argv);

  // Show help and exit
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  // Require a route name
  if (!args.route) {
    console.error("[snaproute] Error: No route name provided.");
    console.error('  Usage: snaproute --route <name> [--methods GET,POST] [--out <dir>]');
    process.exit(1);
  }

  // Load project config (falls back to defaults if not found)
  let config;
  try {
    config = await loadConfig();
  } catch (err) {
    console.error("[snaproute] Failed to load config:", (err as Error).message);
    process.exit(1);
  }

  // Resolve HTTP methods: CLI flag > config default > fallback ["GET"]
  const methods =
    args.methods ??
    config.defaultMethods ??
    ["GET"];

  // Resolve output directory: CLI flag > config outDir > "src/app/api"
  const outDir = args.out ?? config.outDir ?? "src/app/api";

  // Build the full output file path
  const outputPath = resolveRoutePath(args.route, outDir);

  // Check if the file already exists to avoid accidental overwrites
  if (fs.existsSync(outputPath) && !args.force) {
    console.error(`[snaproute] Error: Route already exists at "${outputPath}".`);
    console.error("  Use --force to overwrite.");
    process.exit(1);
  }

  // Generate the route file content
  const content = generateRouteTemplate({
    routeName: args.route,
    methods,
    typescript: config.typescript ?? true,
    includeJsdoc: config.includeJsdoc ?? true,
  });

  // Ensure the output directory exists
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });

  // Write the scaffolded route file
  fs.writeFileSync(outputPath, content, "utf-8");

  console.log(`[snaproute] ✔ Route scaffolded: ${outputPath}`);
  console.log(`  Methods : ${methods.join(", ")}`);
  if (config.includeJsdoc) {
    console.log("  JSDoc   : enabled");
  }
}
