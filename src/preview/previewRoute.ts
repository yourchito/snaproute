import { SnapRouteConfig } from "../config";
import { generateRouteTemplate } from "../template";
import { generateDocs, formatDocsAsMarkdown } from "../docs";
import { RouteInput } from "../validate";

export interface PreviewResult {
  routePath: string;
  templateContent: string;
  docsContent: string | null;
}

/**
 * Generates a preview of the route template and optional docs
 * without writing anything to disk.
 */
export function previewRoute(
  input: RouteInput,
  config: SnapRouteConfig
): PreviewResult {
  const { name, methods, outputDir } = input;

  const resolvedOutputDir = outputDir ?? config.outputDir ?? "src/pages/api";
  const routePath = `${resolvedOutputDir}/${name}.ts`;

  const templateContent = generateRouteTemplate({
    routeName: name,
    methods,
    config,
  });

  let docsContent: string | null = null;
  if (config.generateDocs) {
    const docs = generateDocs({ routeName: name, methods, routePath });
    docsContent = formatDocsAsMarkdown(docs);
  }

  return {
    routePath,
    templateContent,
    docsContent,
  };
}
