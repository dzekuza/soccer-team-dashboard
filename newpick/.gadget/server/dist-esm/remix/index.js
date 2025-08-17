import { BuildDirectory, AppDirectory } from "./constants.js";
export { ErrorBoundary, ErrorBoundary as ProductionErrorBoundary, DevelopmentErrorBoundary } from "./ErrorBoundary.js";
/**
 * Parameters for running a Remix app in Gadget.
 */ export const remixViteOptions = {
    buildDirectory: BuildDirectory,
    appDirectory: AppDirectory,
    future: {
        "unstable_optimizeDeps": true
    }
};
