
import type { GadgetPluginOptions } from "./types";
export declare enum FrontendType {
	ReactRouterFramework = "react-router-framework",
	Remix = "remix",
	Vite = "vite",
}
export declare const frontendTypeIndicatorFilePath = ".gadget/FRONTEND_TYPE";
export declare const isRemixOrReactRouterFrameworkType: (type: FrontendType) => type is FrontendType.Remix | FrontendType.ReactRouterFramework;
export declare const getFrontendTypeByPluginsUsed: (config: Record<string, any>) => FrontendType;
export declare const doesViteConfigHasGadgetPlugin: (config: Record<string, any>) => boolean;
export declare const getViteConfig: (config: any, { command, mode, isSsrBuild }: {
	command: "serve" | "build"
	mode: "development" | "production"
	isSsrBuild?: boolean
}, options: {
	plugin?: GadgetPluginOptions
	params: {
		assetsBucketDomain: string
		applicationId: string
		productionEnvironmentId: string
		developmentEnvironmentVariables: Record<string, string>
		productionEnvironmentVariables: Record<string, string>
		useSameDomainAssets: boolean
	}
}) => Promise<{
	config: any
	type: FrontendType
	command: "serve" | "build"
}>;
interface HtmlTagDescriptor {
	tag: string;
	attrs: Record<string, string | boolean>;
	injectTo?: "head" | "body" | "head-prepend" | "body-prepend";
	children?: string;
}
export declare const getHtmlTags: (options: {
	hasAppBridgeV4: boolean
	hasBigCommerceConnection: boolean
	assetsDomain: string
	hasShopifyConnection: boolean
}, devMode: boolean) => HtmlTagDescriptor[];
/** Given a list of environment variables, set up the defines for Vite to replace process.env.FOO with these valuies */
export declare const buildDefinesMap: (env: Record<string, string | undefined>, mode: "development" | "production") => Record<string, string>;
export declare const VITE_PUBLIC_ENV_PREFIXES: string[];
export {};
