"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "preventCrossStoreDataAccess", {
    enumerable: true,
    get: function() {
        return preventCrossStoreDataAccess;
    }
});
const _auth = require("../auth");
const _effects = require("../effects");
const _tenancy = require("../tenancy");
async function preventCrossStoreDataAccess(params, record, options) {
    const context = (0, _effects.getActionContextFromLocalStorage)();
    if (context.type != "effect") {
        throw new Error("Can't prevent cross store data access outside of an action effect");
    }
    if (!params) {
        throw new Error("The `params` parameter is required in preventCrossStoreDataAccess(params, record)");
    }
    if (!record) {
        throw new Error("The `record` parameter is required in preventCrossStoreDataAccess(params, record)");
    }
    const model = context.model;
    const appTenancy = context[_tenancy.AppTenancyKey];
    // if there's no tenancy let's continue
    if (appTenancy?.bigcommerce?.storeId === undefined) {
        return;
    }
    // if this effect is not run in the context of a model then it does not apply
    if (!model) {
        return;
    }
    const input = params[model.apiIdentifier];
    const storeBelongsToField = options?.storeBelongsToField;
    (0, _auth.validateBelongsToLink)({
        input,
        record,
        params,
        model,
        tenantId: appTenancy.bigcommerce.storeId,
        tenantModelKey: bigcommerceStoreKey,
        tenantBelongsToField: storeBelongsToField,
        tenantType: "store",
        tenantName: "BigCommerce"
    });
}
const bigcommerceModelKey = (modelName)=>{
    const modelKey = modelName.replaceAll(" ", "");
    return `DataModel-BigCommerce-${modelKey}`;
};
const bigcommerceStoreKey = bigcommerceModelKey("Store");


//# sourceMappingURL=effects.js.map