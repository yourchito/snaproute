export {
  deprecateRoute,
  undeprecateRoute,
  listDeprecations,
  loadDeprecations,
  saveDeprecations,
  resolveDeprecationFilePath,
} from "./deprecateRoute";
export type { DeprecationEntry, DeprecateResult } from "./deprecateRoute";
export {
  printDeprecateResult,
  printDeprecationList,
  printDeprecateSummary,
} from "./printDeprecate";
