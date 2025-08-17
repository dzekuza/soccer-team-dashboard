
import { AppDirectory, BuildDirectory } from "./constants";
export { DevelopmentErrorBoundary, ErrorBoundary, ErrorBoundary as ProductionErrorBoundary } from "./ErrorBoundary";
/**
* Parameters for running a React Router app in Gadget.
*/
export declare const reactRouterConfigOptions: {
	buildDirectory: typeof BuildDirectory
	appDirectory: typeof AppDirectory
	future: {
		unstable_optimizeDeps: boolean
	}
};
