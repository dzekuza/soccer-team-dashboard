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
    ShopifyBulkOperationState: function() {
        return ShopifyBulkOperationState;
    },
    ShopifySellingPlanGroupProductState: function() {
        return ShopifySellingPlanGroupProductState;
    },
    ShopifySellingPlanGroupProductVariantState: function() {
        return ShopifySellingPlanGroupProductVariantState;
    },
    ShopifyShopState: function() {
        return ShopifyShopState;
    },
    ShopifySyncState: function() {
        return ShopifySyncState;
    },
    abortSync: function() {
        return abortSync;
    },
    determineShopThemeVersion: function() {
        return determineShopThemeVersion;
    },
    finishBulkOperation: function() {
        return finishBulkOperation;
    },
    globalShopifySync: function() {
        return globalShopifySync;
    },
    preventCrossShopDataAccess: function() {
        return preventCrossShopDataAccess;
    },
    shopifySync: function() {
        return shopifySync;
    },
    validShopsFilter: function() {
        return validShopsFilter;
    }
});
function _interop_require_default() {
    const data = require("@swc/helpers/_/_interop_require_default");
    _interop_require_default = function() {
        return data;
    };
    return data;
}
function _path() {
    const data = /*#__PURE__*/ _interop_require_default()._(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
const _auth = require("../auth");
const _effects = require("../effects");
const _errors = require("../errors");
const _globals = require("../globals");
const _tenancy = require("../tenancy");
const _utils = require("../utils");
const _constants = require("./constants");
const ShopifyShopState = {
    Installed: {
        created: "installed"
    },
    Uninstalled: {
        created: "uninstalled"
    }
};
const ShopifySyncState = {
    Created: "created",
    Running: "running",
    Completed: "completed",
    Errored: "errored"
};
const ShopifyBulkOperationState = {
    Created: "created",
    Completed: "completed",
    Canceled: "canceled",
    Failed: "failed",
    Expired: "expired"
};
const ShopifySellingPlanGroupProductVariantState = {
    Started: "started",
    Created: "created",
    Deleted: "deleted"
};
const ShopifySellingPlanGroupProductState = {
    Started: "started",
    Created: "created",
    Deleted: "deleted"
};
async function shopifySync(params, record) {
    const context = (0, _effects.getActionContextFromLocalStorage)();
    const effectAPIs = context.effectAPIs;
    const syncRecord = (0, _utils.assert)(record, "cannot start a shop sync from this action");
    const shopId = (0, _utils.assert)(syncRecord.shopId, "a shop is required to start a sync");
    if (syncRecord.syncSinceBy && syncRecord.syncSinceBy !== "created_at" && syncRecord.syncSinceBy !== "updated_at") {
        throw new _errors.InvalidActionInputError("syncSinceBy must be either 'created_at' or 'updated_at'");
    }
    if (!syncRecord.models || Array.isArray(syncRecord.models) && syncRecord.models.every((m)=>typeof m == "string")) {
        try {
            await effectAPIs.sync(syncRecord.id.toString(), shopId, syncRecord.syncSince, syncRecord.models, syncRecord.force, params.startReason, syncRecord.syncSinceBy);
        } catch (error) {
            context.logger.error({
                error,
                connectionSyncId: syncRecord.id
            }, "an error occurred starting shop sync");
            throw error;
        }
    } else {
        throw new _errors.InvalidActionInputError("Models must be an array of api identifiers");
    }
}
async function abortSync(params, record) {
    const context = (0, _effects.getActionContextFromLocalStorage)();
    const effectAPIs = context.effectAPIs;
    const syncRecord = (0, _utils.assert)(record, "a record is required to abort a shop sync");
    const syncId = (0, _utils.assert)(syncRecord.id, "a sync id is required to start a sync");
    if (!params.errorMessage) {
        record.errorMessage = "Sync aborted";
    }
    context.logger.info({
        userVisible: true,
        connectionSyncId: syncId
    }, "aborting sync");
    try {
        await effectAPIs.abortSync(syncId.toString());
    } catch (error) {
        context.logger.error({
            error,
            connectionSyncId: syncId
        }, "an error occurred aborting sync");
        throw error;
    }
}
async function preventCrossShopDataAccess(params, record, options) {
    const enforceCustomerTenancy = options?.enforceCustomerTenancy ?? true;
    const context = (0, _effects.getActionContextFromLocalStorage)();
    if (context.type != "effect") {
        throw new Error("Can't prevent cross shop data access outside of an action effect");
    }
    if (!params) {
        throw new Error("The `params` parameter is required in preventCrossShopDataAccess(params, record, options?: { shopBelongsToField: string })");
    }
    if (!record) {
        throw new Error("The `record` parameter is required in preventCrossShopDataAccess(params, record, options?: { shopBelongsToField: string })");
    }
    const model = context.model;
    const appTenancy = context[_tenancy.AppTenancyKey];
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
    (0, _auth.validateBelongsToLink)({
        input,
        record,
        params,
        tenantId: shopId,
        model,
        tenantModelKey: ShopifyShopKey,
        tenantBelongsToField: shopBelongsToField,
        tenantType: "shop",
        tenantName: "Shopify"
    });
    if (customerId && enforceCustomerTenancy) {
        (0, _auth.validateBelongsToLink)({
            input,
            record,
            params,
            tenantId: customerId,
            model,
            tenantModelKey: ShopifyCustomerKey,
            tenantBelongsToField: customerBelongsToField,
            tenantType: "customer",
            tenantName: "Shopify"
        });
    }
}
function validShopsFilter(shopModelFiles, params) {
    const filter = [
        {
            state: {
                inState: "created.installed"
            }
        },
        ...params.additionalFilters ?? []
    ];
    const planNameField = shopModelFiles.find((f)=>f.apiIdentifier === "planName");
    const planDisplayNameField = shopModelFiles.find((f)=>f.apiIdentifier === "planDisplayName");
    if (params.skipInvalidPlans && (planNameField || planDisplayNameField)) {
        const planCondition = {
            AND: []
        };
        if (planNameField) {
            planCondition.AND.push({
                OR: [
                    {
                        planName: {
                            isSet: true,
                            notIn: _constants.invalidPlanNames
                        }
                    },
                    {
                        planName: {
                            isSet: false
                        }
                    }
                ]
            });
        }
        if (planDisplayNameField) {
            planCondition.AND.push({
                OR: [
                    {
                        planDisplayName: {
                            isSet: true,
                            notIn: _constants.invalidPlanDisplayNames
                        }
                    },
                    {
                        planDisplayName: {
                            isSet: false
                        }
                    }
                ]
            });
        }
        filter.push(planCondition);
    }
    return filter;
}
async function globalShopifySync(params) {
    const context = (0, _effects.getCurrentContext)();
    const effectAPIs = (0, _utils.assert)(context.effectAPIs, "effect apis is missing from the current context");
    const api = (0, _utils.assert)(context.api, "api client is missing from the current context");
    const { apiKeys, syncSince, models, force, startReason } = params;
    if (!apiKeys || apiKeys.length === 0) {
        throw new _errors.InvalidActionInputError("missing at least 1 api key");
    }
    const { shopModelIdentifier, installedViaKeyFieldIdentifier, shopifySyncModelApiIdentifier, runShopifySyncAction, accessTokenIdentifier, forceFieldIdentifier } = await effectAPIs.getSyncIdentifiers();
    const shopModel = (0, _effects.getModelByApiIdentifier)(shopModelIdentifier);
    const manager = (0, _effects.internalModelManagerForModel)(api, shopModelIdentifier, []);
    const pageSize = 250;
    let pageInfo = {
        first: pageSize,
        hasNextPage: true
    };
    const results = [];
    const filter = validShopsFilter(Object.values(shopModel.fields).map((f)=>({
            apiIdentifier: f.apiIdentifier
        })), {
        additionalFilters: [
            {
                [installedViaKeyFieldIdentifier]: {
                    in: apiKeys
                }
            }
        ]
    });
    try {
        while(pageInfo.hasNextPage){
            const records = await manager.findMany({
                filter,
                first: pageInfo.first,
                after: pageInfo.endCursor
            });
            results.push(...records);
            pageInfo = records.pagination.pageInfo;
        }
    } catch (error) {
        context.logger.info({
            userVisible: true,
            error,
            apiKeys
        }, "could not get shops for all API keys");
        throw error;
    }
    for (const result of results){
        const shopId = result.id;
        const domain = result.domain ?? result.myshopifyDomain;
        context.logger.debug({
            shopId,
            domain
        }, "syncing shop");
        // skip the sync if there is no accessToken set or if the state is uninstalled
        if (context[_globals.kGlobals].platformModules.lodash().isEmpty(result[accessTokenIdentifier]) || result.state?.created == "uninstalled") {
            context.logger.info({
                shopId,
                domain
            }, "skipping sync for shop without access token or is uninstalled");
            continue;
        }
        try {
            const shopifySyncModelManager = context[_globals.kGlobals].platformModules.lodash().get(api, runShopifySyncAction.dotNotationPath);
            await shopifySyncModelManager[runShopifySyncAction.apiIdentifier]({
                [shopifySyncModelApiIdentifier]: {
                    shop: {
                        _link: shopId
                    },
                    domain,
                    syncSince,
                    models,
                    ...forceFieldIdentifier ? {
                        force
                    } : undefined
                },
                startReason
            });
        } catch (error) {
            // log that the sync could not be started for the shop but continue
            _globals.Globals.logger.warn({
                userVisible: true,
                error,
                shop: result
            }, "couldn't start sync for shop");
        }
    }
}
const shopifyModelKey = (modelName)=>{
    const modelKey = modelName.replaceAll(" ", "");
    return `DataModel-Shopify-${modelKey}`;
};
async function finishBulkOperation(record) {
    if (!record?.id) {
        _globals.Globals.logger.warn(`Expected bulk operation record to be present for action`);
        return;
    }
    const context = (0, _effects.getActionContextFromLocalStorage)();
    const shopifyAPI = await context.connections.shopify.forShopId(record.shopId);
    if (!shopifyAPI) {
        _globals.Globals.logger.error(`Could not instantiate Shopify client for shop ID ${record.shopId}`);
        return;
    }
    const bulkOperation = (await shopifyAPI.graphql(`query {
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
      }`, {})).node;
    // normalize the mixed upper/lowercase (GraphQL/REST) to lowercase
    const { status, errorCode, type } = bulkOperation;
    Object.assign(record, {
        ...bulkOperation,
        status: status?.toLowerCase(),
        errorCode: errorCode?.toLowerCase(),
        type: type?.toLowerCase(),
        id: record.id
    });
}
const ShopifyShopKey = shopifyModelKey("Shop");
const ShopifyCustomerKey = shopifyModelKey("Customer");
const ShopifyBulkOperationGIDForId = (id)=>`gid://shopify/BulkOperation/${id}`;
const determineShopThemeVersion = async (shopify, pageTypes)=>{
    const filenames = pageTypes?.flatMap((pageType)=>[
            `templates/${pageType}.json`,
            `templates/${pageType}.liquid`
        ]) ?? [];
    if (filenames.length === 0) {
        filenames.push("templates/*.json", "templates/*.liquid");
    }
    const templateFiles = [];
    let previousFileCursor = null;
    let hasNextPage = true;
    // Get all template files from the theme
    while(hasNextPage){
        const response = await shopify.graphql(`
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
      }`, {
            filenames,
            fileCursor: previousFileCursor
        });
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
    return templateFiles.map((file)=>{
        const filename = file.filename;
        const fileExtension = _path().default.extname(filename);
        const version = fileExtension === ".json" ? "v2" : "v1";
        const filePathWithoutTemplatesDirectory = filename.replace("templates/", "");
        /**
     * Get a page type for the template. For example:
     * - templates/product.json -> product
     * - templates/customers/activate_account.liquid -> customers/activate_account
     */ const pageType = _path().default.join(_path().default.dirname(filePathWithoutTemplatesDirectory), _path().default.basename(filePathWithoutTemplatesDirectory, fileExtension));
        return {
            pageType,
            filename,
            version
        };
    });
};


//# sourceMappingURL=effects.js.map