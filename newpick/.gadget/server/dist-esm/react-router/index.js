import { AppDirectory, BuildDirectory } from "./constants.js";
export { DevelopmentErrorBoundary, ErrorBoundary, ErrorBoundary as ProductionErrorBoundary } from "./ErrorBoundary.js";
/**
 * Parameters for running a React Router app in Gadget.
 */ export const reactRouterConfigOptions = {
    buildDirectory: BuildDirectory,
    appDirectory: AppDirectory,
    future: {
        unstable_optimizeDeps: true
    }
};
