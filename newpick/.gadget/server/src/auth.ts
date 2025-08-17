import type { GadgetRecord } from "@gadgetinc/api-client-core";
import type { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import { FieldType, LINK_PARAM } from "./effects";
import { MisconfiguredActionError, PermissionDeniedError } from "./errors";
import { Globals } from "./globals";
import type { Session } from "./Session";
import type { AnyParams, FieldMetadata, ModelDescriptor } from "./types";

declare module "fastify" {
  interface FastifyRequest {
    gadgetAuth?: {
      redirectToSignIn: boolean;
      signInPath: string;
    };
  }
}

export const generateCode = (numBytes?: number): string => {
  return crypto.randomBytes(numBytes ?? 64).toString("hex");
};

export const hashCode = (code: string): string => {
  return crypto.createHash("sha256").update(code).digest("hex");
};

const getSessionFromRequest = <Request extends FastifyRequest>(request: Request): Session => {
  if ("applicationSession" in request) {
    return request.applicationSession as any as Session;
  }

  throw new Error("The request is not a Gadget server request");
};

/**
 * Safely compares a password reset code and hash
 * @param {string} [code] - The password reset code
 * @param {string} [hash] - The hashed password reset code
 * @returns {boolean} - Whether the code is valid or not
 */

/**
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
 */
export const preValidation = async <RouteContext extends FastifyRequest>(request: RouteContext, reply: FastifyReply): Promise<void> => {
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

export function validateBelongsToLink(options: {
  input: any;
  record: any;
  params: AnyParams;
  tenantId: string;
  model: ModelDescriptor;
  tenantModelKey: string;
  tenantBelongsToField?: string | undefined;
  tenantType: string;
  tenantName?: string;
}): void {
  const { input, record, params, tenantId, model, tenantModelKey, tenantType, tenantBelongsToField, tenantName } = options;

  // If this effect is being added to the related tenant model (Shopify Shop or Shopify Customer), simply compare the record's ID
  if (model.key == tenantModelKey) {
    if (record && String(record.id) !== tenantId) {
      throw new PermissionDeniedError();
    }
    return;
  }

  const fieldsIsBelongsToRelatedModel = Object.values(model.fields).filter(
    (f) => f.fieldType === (FieldType.BelongsTo as string) && f.configuration.relatedModelKey === tenantModelKey
  );

  if (fieldsIsBelongsToRelatedModel.length === 0) {
    throw new MisconfiguredActionError(`This model is missing a related ${tenantType} field.`);
  }

  if (fieldsIsBelongsToRelatedModel.length > 1 && !tenantBelongsToField) {
    throw new MisconfiguredActionError(
      `This function is missing a related ${tenantType} field option. \`${tenantType}BelongsToField\` is a required option parameter if the model has more than one related ${tenantType} field.`
    );
  }
  let relatedTenantField = fieldsIsBelongsToRelatedModel[0];

  if (tenantBelongsToField) {
    const selectedField = Object.values(model.fields).find((f) => f.apiIdentifier === tenantBelongsToField);
    if (!selectedField) {
      throw new MisconfiguredActionError(`The selected ${tenantType} relation field does not exist.`);
    }

    if (selectedField.fieldType !== (FieldType.BelongsTo as string) || selectedField.configuration.relatedModelKey !== tenantModelKey) {
      throw new MisconfiguredActionError(
        `The selected ${tenantType} relation field should be a \`Belongs To\` relationship to the \`${
          tenantName ? `${tenantName} ` : ""
        }${Globals.platformModules.lodash().capitalize(tenantType)}\` model.`
      );
    } else {
      relatedTenantField = selectedField;
    }
  }

  setBelongsToLink(input, record, params, model, relatedTenantField, tenantId);
}

export function setBelongsToLink(
  input: any,
  record: GadgetRecord<any>,
  params: AnyParams,
  model: ModelDescriptor,
  relatedField: FieldMetadata,
  tenantId: string
): void {
  // if we're trying to set the params to a shop other than the tenant we should reject
  if (Globals.platformModules.lodash().isObjectLike(input)) {
    const objectInput = input as Record<string, any>;
    if (objectInput[relatedField.apiIdentifier]) {
      if (String(objectInput[relatedField.apiIdentifier][LINK_PARAM]) !== tenantId) {
        throw new PermissionDeniedError();
      }
    } else {
      objectInput[relatedField.apiIdentifier] = {
        [LINK_PARAM]: tenantId,
      };
    }
  } else {
    params[model.apiIdentifier] = {
      [relatedField.apiIdentifier]: {
        [LINK_PARAM]: tenantId,
      },
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
        [LINK_PARAM]: tenantId,
      });
    }
  }
}
