"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getFrontendType: function() {
        return getFrontendType;
    },
    getInternalFrontendConfig: function() {
        return getInternalFrontendConfig;
    }
});
const _constants = require("../remix/constants");
const _helpers = require("./helpers");
const getDefaultProductionBaseUrl = (assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets = false)=>{
    if (useSameDomainAssets) {
        return `/api/assets/${applicationId}/${productionEnvironmentId}`;
    } else {
        return `https://${assetsBucketDomain}/a/${applicationId}/${productionEnvironmentId}`;
    }
};
const BaseRemixFrontendConfig = Object.freeze({
    distPath: `${_constants.BuildDirectory}/client`,
    manifestFilePaths: [
        `${_constants.BuildDirectory}/.vite/client-manifest.json`
    ],
    // Remix doesn't include the trailing slash in the base URL when building, so we need to add it manually
    productionBaseUrl: (assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets)=>{
        return `${getDefaultProductionBaseUrl(assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets)}/`;
    }
});
const BaseReactRouterFrontendConfig = Object.freeze({
    distPath: `${_constants.BuildDirectory}/client`,
    manifestFilePaths: [
        `${_constants.BuildDirectory}/client/.vite/manifest.json`
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
const getInternalFrontendConfig = (frameworkType)=>{
    switch(frameworkType){
        case _helpers.FrontendType.Remix:
            return BaseRemixFrontendConfig;
        case _helpers.FrontendType.ReactRouterFramework:
            return BaseReactRouterFrontendConfig;
        case _helpers.FrontendType.Vite:
            return BaseViteFrontendConfig;
        default:
            throw new Error(`Unknown frontend type detected: ${frameworkType}`);
    }
};
const getFrontendType = (indicatorFileContent)=>{
    if (Object.values(_helpers.FrontendType).includes(indicatorFileContent)) {
        return indicatorFileContent;
    }
    throw new Error(`Unknown frontend type detected: ${indicatorFileContent}`);
};


//# sourceMappingURL=utils.js.map