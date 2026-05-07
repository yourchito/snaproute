import { TemplateEntry } from "./listTemplates";

function c(text: string, color: string): string {
  const codes: Record<string, string> = {
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    gray: "\x1b[90m",
    bold: "\x1b[1m",
    reset: "\x1b[0m",
  };
  return `${codes[color] ?? ""}${text}${codes.reset}`;
}

export function printTemplateEntry(entry: TemplateEntry): void {
  const tag = entry.builtin ? c("[builtin]", "gray") : c("[custom]", "cyan");
  const name = c(entry.name, "bold");
  console.log(`  ${tag} ${name}`);
  if (entry.description) {
    console.log(`         ${c(entry.description, "gray")}`);
  }
  console.log(`         ${c(entry.path, "gray")}`);
}

export function printTemplateList(entries: TemplateEntry[]): void {
  if (entries.length === 0) {
    console.log(c("No templates found.", "yellow"));
    return;
  }

  const builtins = entries.filter((e) => e.builtin);
  const customs = entries.filter((e) => !e.builtin);

  if (builtins.length > 0) {
    console.log(c("\nBuiltin Templates:", "bold"));
    builtins.forEach(printTemplateEntry);
  }

  if (customs.length > 0) {
    console.log(c("\nCustom Templates:", "bold"));
    customs.forEach(printTemplateEntry);
  }
}

export function printTemplateSummary(entries: TemplateEntry[]): void {
  const builtinCount = entries.filter((e) => e.builtin).length;
  const customCount = entries.filter((e) => !e.builtin).length;
  console.log(
    `\n${c(String(entries.length), "cyan")} template(s) found — ` +
      `${c(String(builtinCount), "gray")} builtin, ` +
      `${c(String(customCount), "cyan")} custom`
  );
}

/**
 * Prints a single-line notification when a template is successfully applied.
 * @param templateName - The name of the template that was applied.
 * @param destination - The destination path where the template was applied.
 */
export function printTemplateApplied(templateName: string, destination: string): void {
  console.log(
    `${c("✔", "green")} Template ${c(templateName, "bold")} applied to ${c(destination, "cyan")}`
  );
}
