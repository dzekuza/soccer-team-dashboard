import crypto from "node:crypto";
import { FieldType, LINK_PARAM } from "./effects.js";
import { MisconfiguredActionError, PermissionDeniedError } from "./errors.js";
import { Globals } from "./globals.js";
export const generateCode = (numBytes)=>{
    return crypto.randomBytes(numBytes ?? 64).toString("hex");
};
export const hashCode = (code)=>{
    return crypto.createHash("sha256").update(code).digest("hex");
};
const getSessionFromRequest = (request)=>{
    if ("applicationSession" in request) {
        return request.applicationSession;
    }
    throw new Error("The request is not a Gadget server request");
};
/**
 * Safely compares a password reset code and hash
 * @param {string} [code] - The password reset code
 * @param {string} [hash] - The hashed password reset code
 * @returns {boolean} - Whether the code is valid or not
 */ /**
 * Utility function to wrap route handlers with protection from unauthenticated requests.
 *
 * @param handler The route handler to protect
 * @param {ProtectedRouteOptions} options Options for the protected route
 * @returns handler function that is wrapped with route protection
 *
 * @example
 * ```ts
 * // routes/GET-protected-route.js
 * import { preValidation } from "gadget-server";
 *
 * module.exports = async ({ request, reply }) => {
 *  await reply.send("this is a protected route");
 * }
 *
 * module.options = {
 *   preValidation,
 * }
 * ```
 */ export const preValidation = async (request, reply)=>{
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
export function validateBelongsToLink(options) {
    const { input, record, params, tenantId, model, tenantModelKey, tenantType, tenantBelongsToField, tenantName } = options;
    // If this effect is being added to the related tenant model (Shopify Shop or Shopify Customer), simply compare the record's ID
    if (model.key == tenantModelKey) {
        if (record && String(record.id) !== tenantId) {
            throw new PermissionDeniedError();
        }
        return;
    }
    const fieldsIsBelongsToRelatedModel = Object.values(model.fields).filter((f)=>f.fieldType === FieldType.BelongsTo && f.configuration.relatedModelKey === tenantModelKey);
    if (fieldsIsBelongsToRelatedModel.length === 0) {
        throw new MisconfiguredActionError(`This model is missing a related ${tenantType} field.`);
    }
    if (fieldsIsBelongsToRelatedModel.length > 1 && !tenantBelongsToField) {
        throw new MisconfiguredActionError(`This function is missing a related ${tenantType} field option. \`${tenantType}BelongsToField\` is a required option parameter if the model has more than one related ${tenantType} field.`);
    }
    let relatedTenantField = fieldsIsBelongsToRelatedModel[0];
    if (tenantBelongsToField) {
        const selectedField = Object.values(model.fields).find((f)=>f.apiIdentifier === tenantBelongsToField);
        if (!selectedField) {
            throw new MisconfiguredActionError(`The selected ${tenantType} relation field does not exist.`);
        }
        if (selectedField.fieldType !== FieldType.BelongsTo || selectedField.configuration.relatedModelKey !== tenantModelKey) {
            throw new MisconfiguredActionError(`The selected ${tenantType} relation field should be a \`Belongs To\` relationship to the \`${tenantName ? `${tenantName} ` : ""}${Globals.platformModules.lodash().capitalize(tenantType)}\` model.`);
        } else {
            relatedTenantField = selectedField;
        }
    }
    setBelongsToLink(input, record, params, model, relatedTenantField, tenantId);
}
export function setBelongsToLink(input, record, params, model, relatedField, tenantId) {
    // if we're trying to set the params to a shop other than the tenant we should reject
    if (Globals.platformModules.lodash().isObjectLike(input)) {
        const objectInput = input;
        if (objectInput[relatedField.apiIdentifier]) {
            if (String(objectInput[relatedField.apiIdentifier][LINK_PARAM]) !== tenantId) {
                throw new PermissionDeniedError();
            }
        } else {
            objectInput[relatedField.apiIdentifier] = {
                [LINK_PARAM]: tenantId
            };
        }
    } else {
        params[model.apiIdentifier] = {
            [relatedField.apiIdentifier]: {
                [LINK_PARAM]: tenantId
            }
        };
    }
    if (record) {
        const value = record.getField(relatedField.apiIdentifier);
        // if the record doesn't have a shop set then anyone can update it
        if (value) {
            const recordShopId = typeof value === "object" ? value[LINK_PARAM] : value;
            if (String(recordShopId) !== tenantId) {
                throw new PermissionDeniedError();
            }
        } else {
            // we have to re-apply the params to the record to ensure that this still works correctly if it occurs after "applyParams"
            record.setField(relatedField.apiIdentifier, {
                [LINK_PARAM]: tenantId
            });
        }
    }
}
