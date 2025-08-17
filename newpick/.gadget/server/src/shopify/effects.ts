import type { FilterElement, GadgetRecord } from "@gadgetinc/api-client-core";
import path from "path";
import { validateBelongsToLink } from "../auth";
import { getActionContextFromLocalStorage, getCurrentContext, getModelByApiIdentifier, internalModelManagerForModel } from "../effects";
import { InvalidActionInputError } from "../errors";
import { Globals, kGlobals } from "../globals";
import { AppTenancyKey } from "../tenancy";
import type { AnyParams } from "../types";
import { assert } from "../utils";
import { invalidPlanDisplayNames, invalidPlanNames } from "./constants";

export const ShopifyShopState = {
  Installed: { created: "installed" },
  Uninstalled: { created: "uninstalled" },
};

export const ShopifySyncState = {
  Created: "created",
  Running: "running",
  Completed: "completed",
  Errored: "errored",
};

export const ShopifyBulkOperationState = {
  Created: "created",
  Completed: "completed",
  Canceled: "canceled",
  Failed: "failed",
  Expired: "expired",
};

export const ShopifySellingPlanGroupProductVariantState = {
  Started: "started",
  Created: "created",
  Deleted: "deleted",
};

export const ShopifySellingPlanGroupProductState = {
  Started: "started",
  Created: "created",
  Deleted: "deleted",
};

/**
 * The following is used to power shopifySync model.
 * Learn more about syncing visit our docs: https://docs.gadget.dev/guides/plugins/shopify/syncing-shopify-data#syncing
 */
export async function shopifySync(params: AnyParams, record: GadgetRecord<any>): Promise<void> {
  const context = getActionContextFromLocalStorage();
  const effectAPIs = context.effectAPIs;

  const syncRecord: { syncSince?: Date; syncSinceBy?: string; id: bigint; shopId: string; models: any; force: boolean } = assert(
    record,
    "cannot start a shop sync from this action"
  );

  const shopId = assert(syncRecord.shopId, "a shop is required to start a sync");

  if (syncRecord.syncSinceBy && syncRecord.syncSinceBy !== "created_at" && syncRecord.syncSinceBy !== "updated_at") {
    throw new InvalidActionInputError("syncSinceBy must be either 'created_at' or 'updated_at'");
  }

  if (!syncRecord.models || (Array.isArray(syncRecord.models) && syncRecord.models.every((m) => typeof m == "string"))) {
    try {
      await effectAPIs.sync(
        syncRecord.id.toString(),
        shopId,
        syncRecord.syncSince,
        syncRecord.models,
        syncRecord.force,
        params.startReason,
        syncRecord.syncSinceBy
      );
    } catch (error) {
      context.logger.error({ error, connectionSyncId: syncRecord.id }, "an error occurred starting shop sync");
      throw error;
    }
  } else {
    throw new InvalidActionInputError("Models must be an array of api identifiers");
  }
}

export async function abortSync(params: AnyParams, record: GadgetRecord<any>): Promise<void> {
  const context = getActionContextFromLocalStorage();
  const effectAPIs = context.effectAPIs;

  const syncRecord: { id: bigint } = assert(record, "a record is required to abort a shop sync");

  const syncId = assert(syncRecord.id, "a sync id is required to start a sync");

  if (!params.errorMessage) {
    record.errorMessage = "Sync aborted";
  }

  context.logger.info({ userVisible: true, connectionSyncId: syncId }, "aborting sync");

  try {
    await effectAPIs.abortSync(syncId.toString());
  } catch (error) {
    context.logger.error({ error, connectionSyncId: syncId }, "an error occurred aborting sync");
    throw error;
  }
}

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
export async function preventCrossShopDataAccess(
  params: AnyParams,
  record: GadgetRecord<any>,
  options?: { shopBelongsToField?: string; customerBelongsToField?: string; enforceCustomerTenancy?: boolean }
): Promise<void> {
  const enforceCustomerTenancy = options?.enforceCustomerTenancy ?? true;
  const context = getActionContextFromLocalStorage();

  if (context.type != "effect") {
    throw new Error("Can't prevent cross shop data access outside of an action effect");
  }
  if (!params) {
    throw new Error(
      "The `params` parameter is required in preventCrossShopDataAccess(params, record, options?: { shopBelongsToField: string })"
    );
  }
  if (!record) {
    throw new Error(
      "The `record` parameter is required in preventCrossShopDataAccess(params, record, options?: { shopBelongsToField: string })"
    );
  }
  const model = context.model;
  const appTenancy = context[AppTenancyKey];
  const shopBelongsToField = options?.shopBelongsToField;
  const customerBelongsToField = options?.customerBelongsToField;

  // if there's no tenancy let's continue
  if (appTenancy?.shopify?.shopId === undefined) {
    return;
  }
  // if this effect is not run in the context of a model then it does not apply
  if (!model) {
    return;
  }

  const shopId = String(appTenancy.shopify.shopId);
  const customerId = appTenancy.shopify.customerId ? String(appTenancy.shopify.customerId) : undefined;

  const input = params[model.apiIdentifier];
  validateBelongsToLink({
    input,
    record,
    params,
    tenantId: shopId,
    model,
    tenantModelKey: ShopifyShopKey,
    tenantBelongsToField: shopBelongsToField,
    tenantType: TenantType.Shop,
    tenantName: "Shopify",
  });

  if (customerId && enforceCustomerTenancy) {
    validateBelongsToLink({
      input,
      record,
      params,
      tenantId: customerId,
      model,
      tenantModelKey: ShopifyCustomerKey,
      tenantBelongsToField: customerBelongsToField,
      tenantType: TenantType.Customer,
      tenantName: "Shopify",
    });
  }
}

export function validShopsFilter(
  shopModelFiles: { apiIdentifier: string }[],
  params: { skipInvalidPlans?: boolean; additionalFilters?: FilterElement[] }
): FilterElement[] {
  const filter: FilterElement[] = [{ state: { inState: "created.installed" } }, ...(params.additionalFilters ?? [])];

  const planNameField = shopModelFiles.find((f) => f.apiIdentifier === "planName");
  const planDisplayNameField = shopModelFiles.find((f) => f.apiIdentifier === "planDisplayName");

  if (params.skipInvalidPlans && (planNameField || planDisplayNameField)) {
    const planCondition = {
      AND: [] as FilterElement[],
    };

    if (planNameField) {
      planCondition.AND.push({
        OR: [{ planName: { isSet: true, notIn: invalidPlanNames } }, { planName: { isSet: false } }],
      });
    }

    if (planDisplayNameField) {
      planCondition.AND.push({
        OR: [{ planDisplayName: { isSet: true, notIn: invalidPlanDisplayNames } }, { planDisplayName: { isSet: false } }],
      });
    }

    filter.push(planCondition);
  }

  return filter;
}

/**
 * Syncs Shopify models across all models
 *
 * @param params - list of Shopify app credentials to sync data from
 * @param syncSince - starting point for data sync (default: all time)
 * @param models - list of model names to sync data from
 * @param force - enforces syncswithout checking if they're up to date
 * @param startReason - a string reason stored on the created 'shopifySync' records
 */
export async function globalShopifySync(params: {
  apiKeys: string[];
  syncSince: string | Date;
  models: string[];
  force?: boolean;
  startReason?: string;
}): Promise<void> {
  const context = getCurrentContext();
  const effectAPIs = assert(context.effectAPIs, "effect apis is missing from the current context");
  const api = assert(context.api, "api client is missing from the current context");

  const { apiKeys, syncSince, models, force, startReason } = params;

  if (!apiKeys || apiKeys.length === 0) {
    throw new InvalidActionInputError("missing at least 1 api key");
  }

  const {
    shopModelIdentifier,
    installedViaKeyFieldIdentifier,
    shopifySyncModelApiIdentifier,
    runShopifySyncAction,
    accessTokenIdentifier,
    forceFieldIdentifier,
  } = await effectAPIs.getSyncIdentifiers();
  const shopModel = getModelByApiIdentifier(shopModelIdentifier);
  const manager = internalModelManagerForModel(api, shopModelIdentifier, []);

  const pageSize = 250;
  let pageInfo: { first?: number; endCursor?: string; hasNextPage: boolean } = { first: pageSize, hasNextPage: true };
  const results: { id: string; domain: string; state: Record<string, any>; [key: string]: any }[] = [];

  const filter = validShopsFilter(
    Object.values(shopModel.fields).map((f) => ({ apiIdentifier: f.apiIdentifier })),
    {
      additionalFilters: [{ [installedViaKeyFieldIdentifier]: { in: apiKeys } }],
    }
  );

  try {
    while (pageInfo.hasNextPage) {
      const records = await manager.findMany({
        filter,
        first: pageInfo.first,
        after: pageInfo.endCursor,
      });
      results.push(...(records as any[]));
      pageInfo = records.pagination.pageInfo;
    }
  } catch (error) {
    context.logger.info({ userVisible: true, error, apiKeys }, "could not get shops for all API keys");
    throw error;
  }

  for (const result of results) {
    const shopId = result.id;
    const domain = result.domain ?? result.myshopifyDomain;
    context.logger.debug({ shopId, domain }, "syncing shop");

    // skip the sync if there is no accessToken set or if the state is uninstalled
    if (context[kGlobals].platformModules.lodash().isEmpty(result[accessTokenIdentifier]) || result.state?.created == "uninstalled") {
      context.logger.info({ shopId, domain }, "skipping sync for shop without access token or is uninstalled");
      continue;
    }

    try {
      const shopifySyncModelManager = context[kGlobals].platformModules.lodash().get(api, runShopifySyncAction.dotNotationPath);
      await shopifySyncModelManager[runShopifySyncAction.apiIdentifier]({
        [shopifySyncModelApiIdentifier]: {
          shop: {
            _link: shopId,
          },
          domain,
          syncSince,
          models,
          ...(forceFieldIdentifier ? { force } : undefined),
        },
        startReason,
      });
    } catch (error) {
      // log that the sync could not be started for the shop but continue
      Globals.logger.warn({ userVisible: true, error, shop: result }, "couldn't start sync for shop");
    }
  }
}

const enum TenantType {
  Shop = "shop",
  Customer = "customer",
}

const shopifyModelKey = (modelName: string): string => {
  const modelKey = modelName.replaceAll(" ", "");
  return `DataModel-Shopify-${modelKey}`;
};

/**
 * Updates the state of a `bulkOperation` record from Shopify when the operation completes.
 *
 * @param record - the `bulkOperation` record updated
 */
export async function finishBulkOperation(record: GadgetRecord<any>): Promise<void> {
  if (!record?.id) {
    Globals.logger.warn(`Expected bulk operation record to be present for action`);
    return;
  }

  const context = getActionContextFromLocalStorage();
  const shopifyAPI = await (context.connections as Record<string, any>).shopify.forShopId(record.shopId);
  if (!shopifyAPI) {
    Globals.logger.error(`Could not instantiate Shopify client for shop ID ${record.shopId}`);
    return;
  }
  const bulkOperation = (
    await shopifyAPI.graphql(
      `query {
        node(id: "${ShopifyBulkOperationGIDForId(record.id)}") {
          ... on BulkOperation {
            id
            status
            errorCode
            createdAt
            completedAt
            objectCount
            fileSize
            url
            type
            partialDataUrl
            rootObjectCount
          }
        }
      }`,
      {}
    )
  ).node;
  // normalize the mixed upper/lowercase (GraphQL/REST) to lowercase
  const { status, errorCode, type } = bulkOperation;
  Object.assign(record, {
    ...bulkOperation,
    status: status?.toLowerCase(),
    errorCode: errorCode?.toLowerCase(),
    type: type?.toLowerCase(),
    id: record.id,
  });
}

const ShopifyShopKey: string = shopifyModelKey("Shop");
const ShopifyCustomerKey: string = shopifyModelKey("Customer");

const ShopifyBulkOperationGIDForId = (id: string) => `gid://shopify/BulkOperation/${id}`;

type TemplateFile = {
  filename: string;
};

type GetThemeFilesResponse = {
  themes: {
    nodes: {
      id: string;
      files: {
        nodes: TemplateFile[];
        pageInfo: {
          endCursor: string | null;
          hasNextPage: boolean;
        };
      };
    }[];
  };
};

type ThemeVersion = "v1" | "v2";

/**
 * Determines the theme version (v1/liquid or v2/JSON) for Shopify template files by fetching the template files from the store and analyzing file extensions.
 * Note that `read_themes` Shopify API scope is required to fetch the files.
 *
 * @param {Shopify} shopify - The Shopify client to determine the theme version for.
 * @param {string[]} pageTypes - An optional array of template page type names to include in the analysis. The values should be Shopify page types. (https://shopify.dev/docs/api/liquid/objects/request#request-page_type)
 * @returns {Promise<{pageType: string; filename: string; version: ThemeVersion}[]>} An array of objects containing the page type name (e.g. "index", "product", "customers/activate_account"), filename, and theme version (v1/liquid or v2/JSONd)
 */
export const determineShopThemeVersion = async (
  shopify: {
    graphql: (data: string, variables?: any) => Promise<any>;
  },
  pageTypes?: string[]
): Promise<
  {
    pageType: string;
    filename: string;
    version: ThemeVersion;
  }[]
> => {
  const filenames: string[] = pageTypes?.flatMap((pageType) => [`templates/${pageType}.json`, `templates/${pageType}.liquid`]) ?? [];
  if (filenames.length === 0) {
    filenames.push("templates/*.json", "templates/*.liquid");
  }

  const templateFiles: TemplateFile[] = [];
  let previousFileCursor: string | null = null;
  let hasNextPage = true;

  // Get all template files from the theme
  while (hasNextPage) {
    const response: GetThemeFilesResponse = await shopify.graphql(
      `
      query GetThemeFiles ($filenames: [String!]!, $fileCursor: String) {
        themes(first: 1, roles: [MAIN]) {
          nodes {
            files(first: 250, filenames: $filenames, after: $fileCursor) {
              nodes {
                filename
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
      }`,
      {
        filenames,
        fileCursor: previousFileCursor,
      }
    );

    const theme = response.themes.nodes[0];
    if (!theme) {
      throw new Error("Theme not found");
    }

    templateFiles.push(...theme.files.nodes);

    if (theme.files.pageInfo.hasNextPage) {
      previousFileCursor = theme.files.pageInfo.endCursor;
      hasNextPage = theme.files.pageInfo.hasNextPage;
    } else {
      hasNextPage = false;
    }
  }

  return templateFiles.map((file) => {
    const filename = file.filename;
    const fileExtension = path.extname(filename);
    const version = fileExtension === ".json" ? "v2" : "v1";
    const filePathWithoutTemplatesDirectory = filename.replace("templates/", "");

    /**
     * Get a page type for the template. For example:
     * - templates/product.json -> product
     * - templates/customers/activate_account.liquid -> customers/activate_account
     */
    const pageType = path.join(
      path.dirname(filePathWithoutTemplatesDirectory),
      path.basename(filePathWithoutTemplatesDirectory, fileExtension)
    );

    return {
      pageType,
      filename,
      version,
    };
  });
};
