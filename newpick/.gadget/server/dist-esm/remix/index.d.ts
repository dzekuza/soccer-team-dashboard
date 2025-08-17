
import { BuildDirectory, AppDirectory } from "./constants.js";
export { ErrorBoundary, ErrorBoundary as ProductionErrorBoundary, DevelopmentErrorBoundary } from "./ErrorBoundary.js";
/**
* Parameters for running a Remix app in Gadget.
*/
export declare const remixViteOptions: {
	buildDirectory: typeof BuildDirectory
	appDirectory: typeof AppDirectory
	future: {
		"unstable_optimizeDeps": boolean
	}
};
