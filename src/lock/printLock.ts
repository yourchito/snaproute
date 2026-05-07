import { LockEntry, LockResult } from "./lockRoute";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

export function printLockResult(result: LockResult): void {
  if (!result.success) {
    console.log(`${c.red}✖${c.reset} ${result.message}`);
    return;
  }
  const icon = result.action === "lock" ? "🔒" : "🔓";
  console.log(`${icon} ${c.green}${result.message}${c.reset}`);
}

export function printLockedRoute(entry: LockEntry): void {
  const date = new Date(entry.lockedAt).toLocaleString();
  const reason = entry.reason ? ` ${c.gray}— ${entry.reason}${c.reset}` : "";
  console.log(`  ${c.cyan}${entry.route}${c.reset}  ${c.gray}(locked ${date})${c.reset}${reason}`);
}

export function printAllLocks(entries: LockEntry[]): void {
  if (entries.length === 0) {
    console.log(`${c.gray}No routes are currently locked.${c.reset}`);
    return;
  }
  console.log(`${c.bold}Locked routes:${c.reset}`);
  entries.forEach(printLockedRoute);
}

export function printLockSummary(entries: LockEntry[]): void {
  const count = entries.length;
  if (count === 0) {
    console.log(`${c.gray}0 routes locked.${c.reset}`);
  } else {
    console.log(`${c.yellow}${count} route${count !== 1 ? "s" : ""} locked.${c.reset}`);
  }
}
