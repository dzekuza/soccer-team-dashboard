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
    generateCode: function() {
        return generateCode;
    },
    hashCode: function() {
        return hashCode;
    },
    preValidation: function() {
        return preValidation;
    },
    setBelongsToLink: function() {
        return setBelongsToLink;
    },
    validateBelongsToLink: function() {
        return validateBelongsToLink;
    }
});
function _interop_require_default() {
    const data = require("@swc/helpers/_/_interop_require_default");
    _interop_require_default = function() {
        return data;
    };
    return data;
}
function _nodecrypto() {
    const data = /*#__PURE__*/ _interop_require_default()._(require("node:crypto"));
    _nodecrypto = function() {
        return data;
    };
    return data;
}
const _effects = require("./effects");
const _errors = require("./errors");
const _globals = require("./globals");
const generateCode = (numBytes)=>{
    return _nodecrypto().default.randomBytes(numBytes ?? 64).toString("hex");
};
const hashCode = (code)=>{
    return _nodecrypto().default.createHash("sha256").update(code).digest("hex");
};
const getSessionFromRequest = (request)=>{
    if ("applicationSession" in request) {
        return request.applicationSession;
    }
    throw new Error("The request is not a Gadget server request");
};
const preValidation = async (request, reply)=>{
    let authenticated = false;
    const applicationSession = getSessionFromRequest(request);
    authenticated = !!applicationSession.get("user");
    if (!authenticated) {
        if (request.gadgetAuth?.redirectToSignIn) {
            await reply.redirect(request.gadgetAuth.signInPath);
        } else {
            await reply.status(403).send();
        }
    }
};
function validateBelongsToLink(options) {
    const { input, record, params, tenantId, model, tenantModelKey, tenantType, tenantBelongsToField, tenantName } = options;
    // If this effect is being added to the related tenant model (Shopify Shop or Shopify Customer), simply compare the record's ID
    if (model.key == tenantModelKey) {
        if (record && String(record.id) !== tenantId) {
            throw new _errors.PermissionDeniedError();
        }
        return;
    }
    const fieldsIsBelongsToRelatedModel = Object.values(model.fields).filter((f)=>f.fieldType === _effects.FieldType.BelongsTo && f.configuration.relatedModelKey === tenantModelKey);
    if (fieldsIsBelongsToRelatedModel.length === 0) {
        throw new _errors.MisconfiguredActionError(`This model is missing a related ${tenantType} field.`);
    }
    if (fieldsIsBelongsToRelatedModel.length > 1 && !tenantBelongsToField) {
        throw new _errors.MisconfiguredActionError(`This function is missing a related ${tenantType} field option. \`${tenantType}BelongsToField\` is a required option parameter if the model has more than one related ${tenantType} field.`);
    }
    let relatedTenantField = fieldsIsBelongsToRelatedModel[0];
    if (tenantBelongsToField) {
        const selectedField = Object.values(model.fields).find((f)=>f.apiIdentifier === tenantBelongsToField);
        if (!selectedField) {
            throw new _errors.MisconfiguredActionError(`The selected ${tenantType} relation field does not exist.`);
        }
        if (selectedField.fieldType !== _effects.FieldType.BelongsTo || selectedField.configuration.relatedModelKey !== tenantModelKey) {
            throw new _errors.MisconfiguredActionError(`The selected ${tenantType} relation field should be a \`Belongs To\` relationship to the \`${tenantName ? `${tenantName} ` : ""}${_globals.Globals.platformModules.lodash().capitalize(tenantType)}\` model.`);
        } else {
            relatedTenantField = selectedField;
        }
    }
    setBelongsToLink(input, record, params, model, relatedTenantField, tenantId);
}
function setBelongsToLink(input, record, params, model, relatedField, tenantId) {
    // if we're trying to set the params to a shop other than the tenant we should reject
    if (_globals.Globals.platformModules.lodash().isObjectLike(input)) {
        const objectInput = input;
        if (objectInput[relatedField.apiIdentifier]) {
            if (String(objectInput[relatedField.apiIdentifier][_effects.LINK_PARAM]) !== tenantId) {
                throw new _errors.PermissionDeniedError();
            }
        } else {
            objectInput[relatedField.apiIdentifier] = {
                [_effects.LINK_PARAM]: tenantId
            };
        }
    } else {
        params[model.apiIdentifier] = {
            [relatedField.apiIdentifier]: {
                [_effects.LINK_PARAM]: tenantId
            }
        };
    }
    if (record) {
        const value = record.getField(relatedField.apiIdentifier);
        // if the record doesn't have a shop set then anyone can update it
        if (value) {
            const recordShopId = typeof value === "object" ? value[_effects.LINK_PARAM] : value;
            if (String(recordShopId) !== tenantId) {
                throw new _errors.PermissionDeniedError();
            }
        } else {
            // we have to re-apply the params to the record to ensure that this still works correctly if it occurs after "applyParams"
            record.setField(relatedField.apiIdentifier, {
                [_effects.LINK_PARAM]: tenantId
            });
        }
    }
}


//# sourceMappingURL=auth.js.map