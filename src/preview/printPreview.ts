import { PreviewResult } from "./previewRoute";

const DIVIDER = "─".repeat(60);

function box(title: string, content: string): string {
  const lines = [
    `\n${DIVIDER}`,
    `  📄 ${title}`,
    DIVIDER,
    content,
    DIVIDER,
  ];
  return lines.join("\n");
}

/**
 * Prints a formatted preview of the route and docs to stdout.
 */
export function printPreview(result: PreviewResult): void {
  console.log(
    `\n🔍 Preview mode — no files will be written.\n`
  );

  console.log(`  Route path: ${result.routePath}`);

  console.log(box("Route Template", result.templateContent));

  if (result.docsContent) {
    console.log(box("Generated Docs (Markdown)", result.docsContent));
  } else {
    console.log(
      `\n  ℹ️  Docs generation is disabled. Enable it in snaproute.config.ts.\n`
    );
  }
}
