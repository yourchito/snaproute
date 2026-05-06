import fs from "fs";
import path from "path";

export interface FormatResult {
  file: string;
  changed: boolean;
  error?: string;
}

const INDENT = "  ";

export function normalizeImports(content: string): string {
  const lines = content.split("\n");
  const importLines: string[] = [];
  const rest: string[] = [];
  let pastImports = false;

  for (const line of lines) {
    if (!pastImports && line.startsWith("import ")) {
      importLines.push(line);
    } else {
      if (importLines.length > 0) pastImports = true;
      rest.push(line);
    }
  }

  const sorted = [...importLines].sort((a, b) => a.localeCompare(b));
  const restTrimmed = rest.join("\n").replace(/^\n+/, "");
  return sorted.join("\n") + (sorted.length > 0 ? "\n\n" : "") + restTrimmed;
}

export function normalizeIndentation(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      const match = line.match(/^(\t+)/);
      if (!match) return line;
      return INDENT.repeat(match[1].length) + line.slice(match[1].length);
    })
    .join("\n");
}

export function ensureTrailingNewline(content: string): string {
  return content.endsWith("\n") ? content : content + "\n";
}

export function formatContent(content: string): string {
  let result = normalizeIndentation(content);
  result = normalizeImports(result);
  result = ensureTrailingNewline(result);
  return result;
}

export function formatRoute(filePath: string): FormatResult {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    return { file: resolved, changed: false, error: "File not found" };
  }

  try {
    const original = fs.readFileSync(resolved, "utf-8");
    const formatted = formatContent(original);

    if (original === formatted) {
      return { file: resolved, changed: false };
    }

    fs.writeFileSync(resolved, formatted, "utf-8");
    return { file: resolved, changed: true };
  } catch (err: any) {
    return { file: resolved, changed: false, error: err.message };
  }
}
