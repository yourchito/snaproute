import chalk from "chalk";

export interface FormattedError {
  label: string;
  message: string;
}

/**
 * Formats a list of validation error strings into a human-readable
 * console output block with chalk styling.
 */
export function formatValidationErrors(
  errors: string[],
  context?: string
): string {
  if (errors.length === 0) return "";

  const header = context
    ? chalk.red.bold(`✖ Validation failed for: ${context}`)
    : chalk.red.bold("✖ Validation failed");

  const lines = errors.map((err) => `  ${chalk.red("•")} ${err}`);

  return [header, ...lines].join("\n");
}

/**
 * Prints validation errors to stderr and returns false for easy
 * early-exit patterns in CLI commands.
 */
export function reportValidationErrors(
  errors: string[],
  context?: string
): boolean {
  if (errors.length === 0) return true;
  const formatted = formatValidationErrors(errors, context);
  console.error(formatted);
  return false;
}

/**
 * Formats a single success message with a green checkmark.
 */
export function formatSuccess(message: string): string {
  return `${chalk.green("✔")} ${message}`;
}

/**
 * Formats a warning message with a yellow warning symbol.
 */
export function formatWarning(message: string): string {
  return `${chalk.yellow("⚠")} ${message}`;
}
