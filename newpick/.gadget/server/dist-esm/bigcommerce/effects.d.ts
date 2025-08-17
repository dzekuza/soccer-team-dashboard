
import type { GadgetRecord } from "@gadgetinc/api-client-core";
import type { AnyParams } from "../types.js";
/**
* Applicable for multi-tenant Store apps(public apps)
* Enforces that the given record is only accessible by the current store or customer
* *
* @param params - incoming data validated against the current `storeHash`
* @param record - record used to validate or set the `storeHash` on
*/
export declare function preventCrossStoreDataAccess(params: AnyParams, record: GadgetRecord<any>, options?: {
	storeBelongsToField?: string
}): Promise<void>;
