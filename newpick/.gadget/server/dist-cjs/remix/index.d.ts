
import { BuildDirectory, AppDirectory } from "./constants";
export { ErrorBoundary, ErrorBoundary as ProductionErrorBoundary, DevelopmentErrorBoundary } from "./ErrorBoundary";
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
