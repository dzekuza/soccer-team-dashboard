
import type { GadgetRecord } from "@gadgetinc/api-client-core";
import Shopify from "shopify-api-node";
export type ShopifyConnectionConfiguration = {
	/**
	* The array of scopes configured for this connection and what Shopify will prompt the user to grant.
	* If the shop records `grantedScopes` value doesn't include all these scopes, a new OAuth grant should be requested.
	*/
	requiredScopes: string[]
};
export interface ShopifyConnection {
	/**
	* The current shop in context for the app. In-context means the shop the requests is coming from, or the webhook arrived from, or the sync is running for. There isn't always a shop in context, and this will be undefined if not.
	*/
	currentShop?: {
		/**
		* The ID of the shop
		*/
		id: bigint
		/**
		* The domain of the shop
		*/
		domain: string
		/**
		* The API version of the shop
		*/
		apiVersion: string
	};
	/**
	* The client id of the Shopify app that the current shop is connected to. The current shop is inferred from the request context.
	*/
	currentClientId?: string;
	/**
	* The client secret of the Shopify app that the current shop is connected to. The current shop is inferred from the request context.
	*/
	currentClientSecret?: string;
	/**
	* Shopify client for the current in context shop or record
	*/
	current?: Shopify;
	/**
	* Configuration of the shopify connection
	**/
	configuration: ShopifyConnectionConfiguration;
	/**
	* The maximum number of retries for requests to Shopify
	**/
	maxRetries?: number;
	/**
	* The Shopify Session token details for the current request, if present. A request must be authenticated with a Shopify Session token for this to be present, otherwise it will be undefined. Gadget validates the incoming session token against your app's client secret and won't permit invalid, expired, or incorrectly signed tokens.
	*/
	currentSession?: {
		token: string
		userId?: string
	};
	/**
	* The ID of the shop set up as the current in-context tenant for this context. The current shop is inferred from the request context.
	*/
	currentShopId?: bigint;
	/**
	* The domain of the shop set up as the current in-context tenant for this context. The current shop is inferred from the request context.
	*/
	currentShopDomain?: string;
	/**
	* @param {GadgetRecord<Record<string, any>>} shop - A shopify shop record
	* @returns {Shopify} Shopify Client for the given shop
	*/
	forShop: (shop: GadgetRecord<Record<string, any>>) => Shopify;
	/**
	* @param {bigint} shopId Shop ID from the Shop model
	* @returns {Promise<Shopify>} Promise which resolves to a Shopify Client
	*/
	forShopId: (shopId: bigint | string) => Promise<Shopify>;
	/**
	* @param {string} shopDomain The Shopify domain
	* @returns {Promise<Shopify>} Promise which resolves to a Shopify Client
	*/
	forShopDomain: (shopDomain: string) => Promise<Shopify>;
	/**
	* @param {bigint} shopId to set for the current context
	* @returns {Promise<void>} Resolves when the shop context has been updated
	**/
	setCurrentShop: (shopId: bigint | string) => Promise<void>;
	/**
	* API keys (also known as Client keys) for all connected Shopify apps
	*/
	apiKeys: string[];
	/**
	* All Shopify models currently enabled on the application.
	*/
	enabledModels: {
		modelKey: string
		apiIdentifier: string
		syncOnly: boolean
	}[];
}
/**
* A map from connection name to instantiated connection object for all the connections in newpick
*/
export interface AppConnections {
	/** An instantiated API client object for the Shopify connection. */
	"shopify": ShopifyConnection;
}
