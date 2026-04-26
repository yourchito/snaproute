import { scaffoldRoute } from '../scaffold/scaffoldRoute';
import { validateRouteInput } from '../validate/validateRoute';
import { formatValidationErrors, formatSuccess, formatWarning } from '../validate/formatErrors';
import type { SnapRouteConfig } from '../config/snaproute.config';

export interface BatchEntry {
  routeName: string;
  methods: string[];
  outputDir?: string;
}

export interface BatchResult {
  routeName: string;
  success: boolean;
  message: string;
  filePath?: string;
}

export async function batchScaffold(
  entries: BatchEntry[],
  config: SnapRouteConfig
): Promise<BatchResult[]> {
  if (!entries || entries.length === 0) {
    return [];
  }

  const results: BatchResult[] = [];

  for (const entry of entries) {
    const outputDir = entry.outputDir ?? config.outputDir ?? 'src/app/api';
    const validation = validateRouteInput({
      routeName: entry.routeName,
      methods: entry.methods,
      outputDir,
    });

    if (!validation.valid) {
      results.push({
        routeName: entry.routeName,
        success: false,
        message: formatValidationErrors(validation.errors ?? []),
      });
      continue;
    }

    try {
      const filePath = await scaffoldRoute({
        routeName: entry.routeName,
        methods: entry.methods,
        outputDir,
        config,
      });

      results.push({
        routeName: entry.routeName,
        success: true,
        message: formatSuccess(`Created route: ${entry.routeName}`),
        filePath,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        routeName: entry.routeName,
        success: false,
        message: formatWarning(`Failed to scaffold "${entry.routeName}": ${message}`),
      });
    }
  }

  return results;
}

export function summarizeBatchResults(results: BatchResult[]): string {
  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const lines: string[] = [
    `Batch complete: ${succeeded} succeeded, ${failed} failed.`,
  ];
  for (const r of results) {
    lines.push(`  ${r.success ? '✔' : '✖'} ${r.routeName} — ${r.message}`);
  }
  return lines.join('\n');
}
