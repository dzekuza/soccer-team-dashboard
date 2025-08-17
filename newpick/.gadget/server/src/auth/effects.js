"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "preventCrossUserDataAccess", {
    enumerable: true,
    get: function() {
        return preventCrossUserDataAccess;
    }
});
const _auth = require("../auth");
const _effects = require("../effects");
const _globals = require("../globals");
async function preventCrossUserDataAccess(params, record, options) {
    const context = (0, _effects.getActionContextFromLocalStorage)();
    if (context.type != "effect") {
        throw new Error("Can't prevent cross user data access outside of an action effect");
    }
    if (!params) {
        throw new Error("The `params` parameter is required in preventCrossUserDataAccess(params, record, options?: { userBelongsToField: string })");
    }
    if (!record) {
        throw new Error("The `record` parameter is required in preventCrossUserDataAccess(params, record, options?: { userBelongsToField: string })");
    }
    const model = context.model;
    const userBelongsToField = options?.userBelongsToField;
    // if this effect is not run in the context of a model then it does not apply
    if (!model) {
        context.logger.warn("preventCrossUserDataAccess: not running in a model action -- will have no effect");
        return;
    }
    const userId = context.session?.get("user");
    const input = params[model.apiIdentifier];
    const userModel = context.authConfig?.userModelKey ? Object.values(context[_globals.kGlobals].modelsMap).find((model)=>model.key === context.authConfig?.userModelKey) : undefined;
    const tenantModelKey = userModel?.key ?? "";
    const hasBelongsToField = Object.values(model.fields).some((f)=>f.fieldType === _effects.FieldType.BelongsTo && f.configuration.relatedModelKey === tenantModelKey);
    if (userId && userModel && hasBelongsToField) {
        (0, _auth.validateBelongsToLink)({
            input,
            record,
            params,
            tenantId: userId,
            model,
            tenantModelKey,
            tenantBelongsToField: userBelongsToField,
            tenantType: "user"
        });
    }
}


//# sourceMappingURL=effects.js.map