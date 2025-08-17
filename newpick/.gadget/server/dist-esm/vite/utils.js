import { BuildDirectory } from "../remix/constants.js";
import { FrontendType } from "./helpers.js";
const getDefaultProductionBaseUrl = (assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets = false)=>{
    if (useSameDomainAssets) {
        return `/api/assets/${applicationId}/${productionEnvironmentId}`;
    } else {
        return `https://${assetsBucketDomain}/a/${applicationId}/${productionEnvironmentId}`;
    }
};
/** A descriptor object that describes how different Gadget frontend types work for our use when building vite configs */ const BaseRemixFrontendConfig = Object.freeze({
    distPath: `${BuildDirectory}/client`,
    manifestFilePaths: [
        `${BuildDirectory}/.vite/client-manifest.json`
    ],
    // Remix doesn't include the trailing slash in the base URL when building, so we need to add it manually
    productionBaseUrl: (assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets)=>{
        return `${getDefaultProductionBaseUrl(assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets)}/`;
    }
});
const BaseReactRouterFrontendConfig = Object.freeze({
    distPath: `${BuildDirectory}/client`,
    manifestFilePaths: [
        `${BuildDirectory}/client/.vite/manifest.json`
    ],
    // React Router doesn't include the trailing slash in the base URL when building, so we need to add it manually
    productionBaseUrl: (assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets)=>{
        return `${getDefaultProductionBaseUrl(assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets)}/`;
    }
});
const BaseViteFrontendConfig = Object.freeze({
    distPath: ".gadget/vite-dist",
    manifestFilePaths: [
        ".gadget/vite-dist/.vite/manifest.json",
        ".gadget/vite-dist/manifest.json"
    ],
    productionBaseUrl: getDefaultProductionBaseUrl
});
/**
 * Get the frontend config for the given framework type.
 */ export const getInternalFrontendConfig = (frameworkType)=>{
    switch(frameworkType){
        case FrontendType.Remix:
            return BaseRemixFrontendConfig;
        case FrontendType.ReactRouterFramework:
            return BaseReactRouterFrontendConfig;
        case FrontendType.Vite:
            return BaseViteFrontendConfig;
        default:
            throw new Error(`Unknown frontend type detected: ${frameworkType}`);
    }
};
/**
 * Get the frontend type from the given indicator file content.
 */ export const getFrontendType = (indicatorFileContent)=>{
    if (Object.values(FrontendType).includes(indicatorFileContent)) {
        return indicatorFileContent;
    }
    throw new Error(`Unknown frontend type detected: ${indicatorFileContent}`);
};
