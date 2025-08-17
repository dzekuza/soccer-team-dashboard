
import { FrontendType } from "./helpers";
/** A descriptor object that describes how different Gadget frontend types work for our use when building vite configs */
export type InternalFrontendConfig = {
	distPath: string
	manifestFilePaths: string[]
	productionBaseUrl: (assetsBucketDomain: string, applicationId: string, productionEnvironmentId: string, useSameDomainAssets: boolean) => string
};
/**
* Get the frontend config for the given framework type.
*/
export declare const getInternalFrontendConfig: (frameworkType: FrontendType) => InternalFrontendConfig;
/**
* Get the frontend type from the given indicator file content.
*/
export declare const getFrontendType: (indicatorFileContent: string) => FrontendType;
