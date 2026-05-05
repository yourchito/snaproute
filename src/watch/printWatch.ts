import chalk from "chalk";
import { WatchEvent } from "./watchRoutes";

const icons: Record<WatchEvent["type"], string> = {
  add: chalk.green("+"),
  change: chalk.yellow("~"),
  unlink: chalk.red("-"),
};

const labels: Record<WatchEvent["type"], string> = {
  add: chalk.green("added"),
  change: chalk.yellow("changed"),
  unlink: chalk.red("removed"),
};

export function printWatchEvent(event: WatchEvent): void {
  const time = event.timestamp.toLocaleTimeString();
  const icon = icons[event.type];
  const label = labels[event.type];
  const file = event.filePath.split(/[\\/]/).slice(-2).join("/");
  console.log(`${chalk.gray(time)} ${icon} ${file} ${label}`);
}

export function printWatchStart(dir: string): void {
  console.log(
    chalk.cyan("👀 Watching for route changes in:"),
    chalk.bold(dir)
  );
  console.log(chalk.gray("  Press Ctrl+C to stop.\n"));
}

export function printWatchSummary(events: WatchEvent[]): void {
  const counts = { add: 0, change: 0, unlink: 0 };
  events.forEach((e) => counts[e.type]++);
  console.log(chalk.bold("\nWatch session summary:"));
  console.log(chalk.green(`  Added:   ${counts.add}`));
  console.log(chalk.yellow(`  Changed: ${counts.change}`));
  console.log(chalk.red(`  Removed: ${counts.unlink}`));
  console.log(chalk.gray(`  Total events: ${events.length}`));
}
