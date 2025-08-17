import { BuildDirectory } from "../remix/constants";
import { FrontendType } from "./helpers";

const getDefaultProductionBaseUrl = (
  assetsBucketDomain: string,
  applicationId: string,
  productionEnvironmentId: string,
  useSameDomainAssets: boolean = false
): string => {
  if (useSameDomainAssets) {
    return `/api/assets/${applicationId}/${productionEnvironmentId}`;
  } else {
    return `https://${assetsBucketDomain}/a/${applicationId}/${productionEnvironmentId}`;
  }
};

/** A descriptor object that describes how different Gadget frontend types work for our use when building vite configs */
export type InternalFrontendConfig = {
  distPath: string;
  manifestFilePaths: string[];
  productionBaseUrl: (
    assetsBucketDomain: string,
    applicationId: string,
    productionEnvironmentId: string,
    useSameDomainAssets: boolean
  ) => string;
};

const BaseRemixFrontendConfig: InternalFrontendConfig = Object.freeze({
  distPath: `${BuildDirectory}/client`,
  manifestFilePaths: [`${BuildDirectory}/.vite/client-manifest.json`],
  // Remix doesn't include the trailing slash in the base URL when building, so we need to add it manually
  productionBaseUrl: (assetsBucketDomain: string, applicationId: string, productionEnvironmentId: string, useSameDomainAssets: boolean) => {
    return `${getDefaultProductionBaseUrl(assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets)}/`;
  },
});

const BaseReactRouterFrontendConfig: InternalFrontendConfig = Object.freeze({
  distPath: `${BuildDirectory}/client`,
  manifestFilePaths: [`${BuildDirectory}/client/.vite/manifest.json`],
  // React Router doesn't include the trailing slash in the base URL when building, so we need to add it manually
  productionBaseUrl: (assetsBucketDomain: string, applicationId: string, productionEnvironmentId: string, useSameDomainAssets: boolean) => {
    return `${getDefaultProductionBaseUrl(assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets)}/`;
  },
});

const BaseViteFrontendConfig: InternalFrontendConfig = Object.freeze({
  distPath: ".gadget/vite-dist",
  manifestFilePaths: [".gadget/vite-dist/.vite/manifest.json", ".gadget/vite-dist/manifest.json"],
  productionBaseUrl: getDefaultProductionBaseUrl,
});

/**
 * Get the frontend config for the given framework type.
 */
export const getInternalFrontendConfig = (frameworkType: FrontendType): InternalFrontendConfig => {
  switch (frameworkType) {
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
 */
export const getFrontendType = (indicatorFileContent: string): FrontendType => {
  if (Object.values(FrontendType).includes(indicatorFileContent as any)) {
    return indicatorFileContent as FrontendType;
  }

  throw new Error(`Unknown frontend type detected: ${indicatorFileContent}`);
};
