
import type { FilterElement, GadgetRecord } from "@gadgetinc/api-client-core";
import type { AnyParams } from "../types";
export declare const ShopifyShopState: {
	Installed: {
		created: string
	}
	Uninstalled: {
		created: string
	}
};
export declare const ShopifySyncState: {
	Created: string
	Running: string
	Completed: string
	Errored: string
};
export declare const ShopifyBulkOperationState: {
	Created: string
	Completed: string
	Canceled: string
	Failed: string
	Expired: string
};
export declare const ShopifySellingPlanGroupProductVariantState: {
	Started: string
	Created: string
	Deleted: string
};
export declare const ShopifySellingPlanGroupProductState: {
	Started: string
	Created: string
	Deleted: string
};
/**
* The following is used to power shopifySync model.
* Learn more about syncing visit our docs: https://docs.gadget.dev/guides/plugins/shopify/syncing-shopify-data#syncing
*/
export declare function shopifySync(params: AnyParams, record: GadgetRecord<any>): Promise<void>;
export declare function abortSync(params: AnyParams, record: GadgetRecord<any>): Promise<void>;
/**
* Applicable for multi-tenant Shopify apps(public apps), or Shopify Customer Extension apps
* Enforces that the given record is only accessible by the current shop or customer
*
* For new records: sets the the current session's `shopId` to the record. If the tenant is a customer then will set the current sessions' customerId to the record.
* For existing records: Verifies the record objects `shopId` and/or `customerId` matches the one from the current session.
*
* *
* @param params - incoming data validated against the current `shopId`
* @param record - record used to validate or set the `shopId` on
* @param {Object} options - Additional options for cross-shop or cross-customer validation
* @param {string} options.shopBelongsToField - Specifies which related model is used for cross-shop validation.
* @param {string} options.customerBelongsToField - Specifies which related model is used for cross-customer validation.
* @param {boolean} options.enforceCustomerTenancy - Whether or not to enforce customer tenacy. Defaults to true.
*/
export declare function preventCrossShopDataAccess(params: AnyParams, record: GadgetRecord<any>, options?: {
	shopBelongsToField?: string
	customerBelongsToField?: string
	enforceCustomerTenancy?: boolean
}): Promise<void>;
export declare function validShopsFilter(shopModelFiles: {
	apiIdentifier: string
}[], params: {
	skipInvalidPlans?: boolean
	additionalFilters?: FilterElement[]
}): FilterElement[];
/**
* Syncs Shopify models across all models
*
* @param params - list of Shopify app credentials to sync data from
* @param syncSince - starting point for data sync (default: all time)
* @param models - list of model names to sync data from
* @param force - enforces syncswithout checking if they're up to date
* @param startReason - a string reason stored on the created 'shopifySync' records
*/
export declare function globalShopifySync(params: {
	apiKeys: string[]
	syncSince: string | Date
	models: string[]
	force?: boolean
	startReason?: string
}): Promise<void>;
/**
* Updates the state of a `bulkOperation` record from Shopify when the operation completes.
*
* @param record - the `bulkOperation` record updated
*/
export declare function finishBulkOperation(record: GadgetRecord<any>): Promise<void>;
type ThemeVersion = "v1" | "v2";
/**
* Determines the theme version (v1/liquid or v2/JSON) for Shopify template files by fetching the template files from the store and analyzing file extensions.
* Note that `read_themes` Shopify API scope is required to fetch the files.
*
* @param {Shopify} shopify - The Shopify client to determine the theme version for.
* @param {string[]} pageTypes - An optional array of template page type names to include in the analysis. The values should be Shopify page types. (https://shopify.dev/docs/api/liquid/objects/request#request-page_type)
* @returns {Promise<{pageType: string; filename: string; version: ThemeVersion}[]>} An array of objects containing the page type name (e.g. "index", "product", "customers/activate_account"), filename, and theme version (v1/liquid or v2/JSONd)
*/
export declare const determineShopThemeVersion: (shopify: {
	graphql: (data: string, variables?: any) => Promise<any>
}, pageTypes?: string[]) => Promise<{
	pageType: string
	filename: string
	version: ThemeVersion
}[]>;
export {};
