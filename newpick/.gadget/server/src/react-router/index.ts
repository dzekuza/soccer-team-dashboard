import { AppDirectory, BuildDirectory } from "./constants";
export { DevelopmentErrorBoundary, ErrorBoundary, ErrorBoundary as ProductionErrorBoundary } from "./ErrorBoundary";

/**
 * Parameters for running a React Router app in Gadget.
 */
export const reactRouterConfigOptions = {
  buildDirectory: BuildDirectory as typeof BuildDirectory,
  appDirectory: AppDirectory as typeof AppDirectory,
  future: {
    unstable_optimizeDeps: true,
  },
};
