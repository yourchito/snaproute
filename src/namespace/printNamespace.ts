import { NamespaceMap } from './namespaceRoute';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
};

export function printNamespaceResult(action: string, namespace: string, route?: string): void {
  const tag = `${c.cyan}[namespace]${c.reset}`;
  if (route) {
    console.log(`${tag} ${c.green}${action}${c.reset} route ${c.bold}${route}${c.reset} ${action === 'removed from' ? 'from' : 'to'} namespace ${c.bold}${c.yellow}${namespace}${c.reset}`);
  } else {
    console.log(`${tag} ${c.green}${action}${c.reset} namespace ${c.bold}${c.yellow}${namespace}${c.reset}`);
  }
}

export function printRoutesInNamespace(namespace: string, routes: string[]): void {
  const tag = `${c.cyan}[namespace]${c.reset}`;
  console.log(`\n${tag} Routes in namespace ${c.bold}${c.yellow}${namespace}${c.reset}:`);
  if (routes.length === 0) {
    console.log(`  ${c.dim}(no routes)${c.reset}`);
    return;
  }
  for (const route of routes) {
    console.log(`  ${c.green}•${c.reset} ${route}`);
  }
  console.log();
}

export function printAllNamespaces(namespaces: NamespaceMap): void {
  const tag = `${c.cyan}[namespace]${c.reset}`;
  const keys = Object.keys(namespaces);
  console.log(`\n${tag} ${c.bold}All namespaces${c.reset} (${keys.length} total):`);
  if (keys.length === 0) {
    console.log(`  ${c.dim}(none defined)${c.reset}`);
    return;
  }
  for (const ns of keys) {
    const routes = namespaces[ns];
    console.log(`  ${c.yellow}${ns}${c.reset} ${c.dim}(${routes.length} route${routes.length !== 1 ? 's' : ''})${c.reset}`);
    for (const r of routes) {
      console.log(`    ${c.dim}–${c.reset} ${r}`);
    }
  }
  console.log();
}

export function printNamespaceSummary(total: number, action: string): void {
  const tag = `${c.cyan}[namespace]${c.reset}`;
  console.log(`${tag} ${c.bold}${total}${c.reset} namespace${total !== 1 ? 's' : ''} ${action}.`);
}
