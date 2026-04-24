/**
 * Parses CLI arguments for the snaproute command.
 */

export interface SnaprouteArgs {
  command: "generate" | "help" | "version";
  routeName?: string;
  methods?: string[];
  outputDir?: string;
  withDocs?: boolean;
  dryRun?: boolean;
}

const VALID_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function parseArgs(argv: string[]): SnaprouteArgs {
  const args = argv.slice(2);

  if (args.length === 0 || args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
    return { command: "help" };
  }

  if (args[0] === "version" || args[0] === "--version" || args[0] === "-v") {
    return { command: "version" };
  }

  if (args[0] === "generate" || args[0] === "g") {
    const routeName = args[1];
    if (!routeName) {
      throw new Error("Route name is required for the generate command.");
    }

    const result: SnaprouteArgs = { command: "generate", routeName };

    for (let i = 2; i < args.length; i++) {
      const arg = args[i];

      if ((arg === "--methods" || arg === "-m") && args[i + 1]) {
        const rawMethods = args[++i].toUpperCase().split(",");
        const invalid = rawMethods.filter((m) => !VALID_METHODS.includes(m));
        if (invalid.length > 0) {
          throw new Error(`Invalid HTTP methods: ${invalid.join(", ")}. Valid: ${VALID_METHODS.join(", ")}`);
        }
        result.methods = rawMethods;
      } else if ((arg === "--output" || arg === "-o") && args[i + 1]) {
        result.outputDir = args[++i];
      } else if (arg === "--with-docs") {
        result.withDocs = true;
      } else if (arg === "--dry-run") {
        result.dryRun = true;
      }
    }

    return result;
  }

  throw new Error(`Unknown command: "${args[0]}". Run snaproute --help for usage.`);
}
