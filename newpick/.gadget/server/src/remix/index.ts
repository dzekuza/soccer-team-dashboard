import { BuildDirectory, AppDirectory } from "./constants";

export { ErrorBoundary, ErrorBoundary as ProductionErrorBoundary, DevelopmentErrorBoundary } from "./ErrorBoundary";


/**
 * Parameters for running a Remix app in Gadget.
 */
export const remixViteOptions = {
  buildDirectory: BuildDirectory as typeof BuildDirectory,
  appDirectory: AppDirectory as typeof AppDirectory,
  future: {
  "unstable_optimizeDeps": true
},
};
