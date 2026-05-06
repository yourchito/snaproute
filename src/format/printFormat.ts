import type { FormatResult } from "./formatRoute";

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

export function printFormatResult(result: FormatResult): void {
  if (result.error) {
    console.log(`${c.red("✖")} ${result.file} ${c.red(`(${result.error})}`)}`;
    return;
  }
  if (result.changed) {
    console.log(`${c.green("✔")} ${result.file} ${c.green("(formatted)")}`);
  } else {
    console.log(`${c.dim("–")} ${result.file} ${c.dim("(no changes)")}`)
  }
}

export function printFormatSummary(results: FormatResult[]): void {
  const changed = results.filter((r) => r.changed).length;
  const errored = results.filter((r) => !!r.error).length;
  const unchanged = results.length - changed - errored;

  console.log("");
  console.log(c.bold("Format summary:"));
  console.log(`  ${c.green(`${changed} formatted`)}`);
  console.log(`  ${c.dim(`${unchanged} unchanged`)}`);
  if (errored > 0) {
    console.log(`  ${c.red(`${errored} errored`)}`);
  }
}
