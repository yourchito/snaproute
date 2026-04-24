/**
 * CLI entry point for snaproute.
 * Orchestrates argument parsing and command dispatch.
 */

import { parseArgs } from "./parseArgs";
import { generateRouteTemplate } from "../template/routeTemplate";
import { resolveRoutePath } from "../template/writeRoute";
import { loadConfig } from "../config";

const VERSION = "0.1.0";

function printHelp(): void {
  console.log(`
snaproute v${VERSION} — Scaffold Next.js API routes with typed handlers.

Usage:
  snaproute generate <route-name> [options]
  snaproute g <route-name> [options]

Options:
  --methods, -m   Comma-separated HTTP methods (default: GET)
  --output,  -o   Output directory (overrides config)
  --with-docs     Include JSDoc annotations in generated route
  --dry-run       Preview output without writing files
  --help,    -h   Show this help message
  --version, -v   Show version number

Examples:
  snaproute generate users
  snaproute g posts --methods GET,POST --with-docs
  snaproute g auth/login --methods POST --dry-run
`);
}

export async function run(argv: string[] = process.argv): Promise<void> {
  try {
    const args = parseArgs(argv);

    if (args.command === "help") {
      printHelp();
      return;
    }

    if (args.command === "version") {
      console.log(`snaproute v${VERSION}`);
      return;
    }

    if (args.command === "generate") {
      const config = await loadConfig();
      const methods = args.methods ?? config.defaultMethods ?? ["GET"];
      const outputDir = args.outputDir ?? config.outputDir ?? "pages/api";

      const routePath = resolveRoutePath(outputDir, args.routeName!);
      const template = generateRouteTemplate({
        routeName: args.routeName!,
        methods,
        withDocs: args.withDocs ?? config.withDocs ?? false,
      });

      if (args.dryRun) {
        console.log(`[dry-run] Would write to: ${routePath}\n`);
        console.log(template);
        return;
      }

      const { writeRoute } = await import("../template/writeRoute");
      await writeRoute(routePath, template);
      console.log(`✔ Route created: ${routePath}`);
    }
  } catch (err) {
    console.error(`✖ Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
