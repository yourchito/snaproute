import { RouteGroups } from "./groupRoutes";

const c = {
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

export function printGroupResult(action: string, group: string, route?: string): void {
  const label = c.bold(c.cyan(`[group]`));
  if (route) {
    console.log(`${label} ${action}: ${c.yellow(route)} → ${c.green(group)}`);
  } else {
    console.log(`${label} ${action}: ${c.green(group)}`);
  }
}

export function printRoutesInGroup(group: string, routes: string[]): void {
  console.log(c.bold(c.cyan(`Group: ${group}`)));
  if (routes.length === 0) {
    console.log(c.gray("  (no routes)"));
    return;
  }
  for (const route of routes) {
    console.log(`  ${c.yellow("→")} ${route}`);
  }
}

export function printAllGroups(groups: RouteGroups): void {
  const entries = Object.entries(groups);
  if (entries.length === 0) {
    console.log(c.gray("No groups defined."));
    return;
  }
  console.log(c.bold("Route Groups:"));
  for (const [group, routes] of entries) {
    console.log(`  ${c.green(group)} ${c.gray(`(${routes.length} route${routes.length !== 1 ? "s" : ""})`)}`);
    for (const route of routes) {
      console.log(`    ${c.gray("-")} ${route}`);
    }
  }
}

export function printGroupSummary(groups: RouteGroups): void {
  const totalGroups = Object.keys(groups).length;
  const totalRoutes = Object.values(groups).reduce((sum, r) => sum + r.length, 0);
  console.log(
    c.gray(`${totalGroups} group${totalGroups !== 1 ? "s" : ""}, ${totalRoutes} route${totalRoutes !== 1 ? "s" : ""} total`)
  );
}
