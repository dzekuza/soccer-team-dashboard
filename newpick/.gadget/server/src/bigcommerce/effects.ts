import type { GadgetRecord } from "@gadgetinc/api-client-core";
import { validateBelongsToLink } from "../auth";
import { getActionContextFromLocalStorage } from "../effects";
import { AppTenancyKey } from "../tenancy";
import type { AnyParams } from "../types";

/**
 * Applicable for multi-tenant Store apps(public apps)
 * Enforces that the given record is only accessible by the current store or customer
 * *
 * @param params - incoming data validated against the current `storeHash`
 * @param record - record used to validate or set the `storeHash` on
 */
export async function preventCrossStoreDataAccess(
  params: AnyParams,
  record: GadgetRecord<any>,
  options?: { storeBelongsToField?: string }
): Promise<void> {
  const context = getActionContextFromLocalStorage();

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
  const appTenancy = context[AppTenancyKey];

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
  validateBelongsToLink({
    input,
    record,
    params,
    model,
    tenantId: appTenancy.bigcommerce.storeId,
    tenantModelKey: bigcommerceStoreKey,
    tenantBelongsToField: storeBelongsToField,
    tenantType: TenantType.Store,
    tenantName: "BigCommerce",
  });
}

const bigcommerceModelKey = (modelName: string): string => {
  const modelKey = modelName.replaceAll(" ", "");
  return `DataModel-BigCommerce-${modelKey}`;
};

const bigcommerceStoreKey: string = bigcommerceModelKey("Store");

const enum TenantType {
  Store = "store",
}
