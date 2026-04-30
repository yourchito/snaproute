import type { TagStore } from "./tagRoute";

export function printTagsForRoute(routeName: string, tags: string[]): void {
  if (tags.length === 0) {
    console.log(`  No tags found for route "${routeName}".`);
    return;
  }
  console.log(`  Tags for "${routeName}": ${tags.map((t) => `[${t}]`).join(" ")}`);
}

export function printRoutesByTag(tag: string, routes: string[]): void {
  if (routes.length === 0) {
    console.log(`  No routes found with tag "${tag}".`);
    return;
  }
  console.log(`  Routes tagged "${tag}":`);
  routes.forEach((r) => console.log(`    - ${r}`));
}

export function printAllTags(store: TagStore): void {
  const entries = Object.entries(store);
  if (entries.length === 0) {
    console.log("  No tags defined yet.");
    return;
  }
  console.log("  All tagged routes:");
  entries.forEach(([routeName, tags]) => {
    console.log(`    ${routeName}: ${tags.map((t) => `[${t}]`).join(" ")}`);
  });
}

export function printTagResult(success: boolean, message: string): void {
  const prefix = success ? "✔" : "✖";
  console.log(`  ${prefix} ${message}`);
}
