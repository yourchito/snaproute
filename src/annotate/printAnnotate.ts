import type { AnnotateResult, RouteAnnotation } from "./annotateRoute";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
};

function fmt(color: string, text: string): string {
  return `${color}${text}${c.reset}`;
}

function formatAnnotationEntry(annotation: RouteAnnotation, index: number): string {
  const num = fmt(c.gray, `[${index + 1}]`);
  const note = fmt(c.cyan, annotation.note);
  const author = annotation.author ? fmt(c.yellow, ` — ${annotation.author}`) : "";
  const date = fmt(c.gray, ` (${new Date(annotation.createdAt).toLocaleString()})`);
  return `  ${num} ${note}${author}${date}`;
}

export function printAnnotateResult(result: AnnotateResult): void {
  if (result.action === "listed") {
    const annotations = result.annotations ?? [];
    if (annotations.length === 0) {
      console.log(fmt(c.yellow, `No annotations found for "${result.route}".`));
      return;
    }
    console.log(fmt(c.bold, `Annotations for "${result.route}":`) );
    annotations.forEach((a, i) => console.log(formatAnnotationEntry(a, i)));
    return;
  }

  const icon = result.success ? fmt(c.green, "✔") : fmt(c.red, "✘");
  console.log(`${icon} ${result.message}`);
}

export function printAnnotateSummary(outputDir: string, total: number): void {
  console.log(
    fmt(c.gray, `─────────────────────────────────────────`)
  );
  console.log(
    `${fmt(c.bold, "Annotations")} stored in ${fmt(c.cyan, outputDir)} — ${fmt(c.yellow, String(total))} total`
  );
}
