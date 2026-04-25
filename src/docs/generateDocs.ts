import { ParsedArgs } from "../cli/parseArgs";

export interface RouteDoc {
  name: string;
  methods: string[];
  params: string[];
  outputDir: string;
  generatedAt: string;
}

export function extractParams(routeName: string): string[] {
  const paramRegex = /\[([^\]]+)\]/g;
  const params: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = paramRegex.exec(routeName)) !== null) {
    params.push(match[1]);
  }
  return params;
}

export function generateDocs(args: ParsedArgs): RouteDoc {
  return {
    name: args.routeName,
    methods: args.methods,
    params: extractParams(args.routeName),
    outputDir: args.outputDir ?? "pages/api",
    generatedAt: new Date().toISOString(),
  };
}

export function formatDocsAsMarkdown(doc: RouteDoc): string {
  const lines: string[] = [];

  lines.push(`# Route: \`${doc.name}\``);
  lines.push("");
  lines.push(`**Generated:** ${doc.generatedAt}`);
  lines.push(`**Output Directory:** \`${doc.outputDir}\``);
  lines.push("");

  lines.push("## Methods");
  lines.push("");
  for (const method of doc.methods) {
    lines.push(`- \`${method.toUpperCase()}\``);
  }
  lines.push("");

  if (doc.params.length > 0) {
    lines.push("## Dynamic Parameters");
    lines.push("");
    for (const param of doc.params) {
      lines.push(`- \`${param}\` — dynamic route segment`);
    }
    lines.push("");
  }

  lines.push("## Handler Signature");
  lines.push("");
  lines.push("```ts");
  lines.push(`import type { NextApiRequest, NextApiResponse } from "next";`);
  lines.push("");
  lines.push(`export default function handler(req: NextApiRequest, res: NextApiResponse) {`);
  for (const method of doc.methods) {
    lines.push(`  // Handle ${method.toUpperCase()}`);
  }
  lines.push(`}`);
  lines.push("```");

  return lines.join("\n");
}
