
/**
* An object containing the app's base configuration variables
*/
export declare let Config: AppConfigs;
/**
* This is used internally to set the apps config names
* @internal
*/
export declare const setAppConfigs: (configs: AppConfigs) => void;
/**
* Contains the app's base name configurations
*/
export interface AppConfigs {
	/** The name of your app */
	appName: string;
	/** The primary domain from the URL of your app. */
	primaryDomain: string;
	/** The url of your app */
	appUrl: string;
}
