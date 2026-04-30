import type { PinnedRoute } from "./pinRoute";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";

export function printPinResult(result: { success: boolean; message: string }): void {
  if (result.success) {
    console.log(`${GREEN}✔${RESET} ${result.message}`);
  } else {
    console.log(`${YELLOW}⚠${RESET} ${result.message}`);
  }
}

export function printPinnedRoute(pin: PinnedRoute): void {
  const methods = pin.methods.map((m) => `${CYAN}${m}${RESET}`).join(", ");
  const date = new Date(pin.pinnedAt).toLocaleDateString();
  console.log(`  ${BOLD}${pin.name}${RESET}`);
  console.log(`    ${DIM}dir:${RESET}     ${pin.outputDir}`);
  console.log(`    ${DIM}methods:${RESET} ${methods}`);
  console.log(`    ${DIM}pinned:${RESET}  ${date}`);
}

export function printAllPins(pins: PinnedRoute[]): void {
  if (pins.length === 0) {
    console.log(`${DIM}No pinned routes found.${RESET}`);
    return;
  }
  console.log(`${BOLD}Pinned Routes (${pins.length}):${RESET}`);
  console.log();
  for (const pin of pins) {
    printPinnedRoute(pin);
    console.log();
  }
}

export function printPinSummary(pins: PinnedRoute[]): void {
  if (pins.length === 0) {
    console.log(`${DIM}No pinned routes.${RESET}`);
    return;
  }
  const names = pins.map((p) => `${CYAN}${p.name}${RESET}`).join(", ");
  console.log(`${BOLD}Pinned:${RESET} ${names}`);
}
