import { TemplateEntry } from "./listTemplates";

const CYAN = (s: string) => `\x1b[36m${s}\x1b[0m`;
const GREEN = (s: string) => `\x1b[32m${s}\x1b[0m`;
const YELLOW = (s: string) => `\x1b[33m${s}\x1b[0m`;
const DIM = (s: string) => `\x1b[2m${s}\x1b[0m`;
const BOLD = (s: string) => `\x1b[1m${s}\x1b[0m`;

export function printTemplateEntry(entry: TemplateEntry, isCustom = false): void {
  const label = isCustom ? YELLOW("[custom]") : GREEN("[builtin]");
  const methods = entry.methods.length
    ? entry.methods.map((m) => CYAN(m)).join(", ")
    : DIM("(none)");
  const flags = [
    entry.hasAuth ? GREEN("auth") : "",
    entry.hasValidation ? GREEN("validation") : "",
  ]
    .filter(Boolean)
    .join(", ");

  console.log(`  ${BOLD(entry.name)} ${label}`);
  console.log(`    ${DIM(entry.description)}`);
  console.log(`    Methods: ${methods}${flags ? `  Flags: ${flags}` : ""}`);
  console.log();
}

export function printTemplateList(
  entries: TemplateEntry[],
  customNames: Set<string> = new Set()
): void {
  if (entries.length === 0) {
    console.log(DIM("  No templates found."));
    return;
  }

  console.log(BOLD("\nAvailable templates:\n"));
  for (const entry of entries) {
    printTemplateEntry(entry, customNames.has(entry.name));
  }
}

export function printTemplateSummary(entries: TemplateEntry[]): void {
  const builtin = entries.filter(
    (e) =>
      !["custom"].includes(e.description.startsWith("Custom") ? "custom" : "")
  ).length;
  const total = entries.length;
  console.log(
    DIM(`  ${total} template${total !== 1 ? "s" : ""} available (${builtin} builtin, ${total - builtin} custom)\n`)
  );
}
