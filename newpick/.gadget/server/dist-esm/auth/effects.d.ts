
import type { GadgetRecord } from "@gadgetinc/api-client-core";
import type { AnyParams } from "../types.js";
/**
* Applicable for multi-tenant user authenticated apps.
* Enforces that the given record is only accessible by the current logged in user.
*
* For new records: sets the the current session's `userId` to the record.
* For existing records: Verifies the record objects `userId` matches the one from the current session.
*
* @param params - incoming data validated against the current `userId`
* @param record - record used to validate or set the `userId` on
* @param {Object} options - Additional options for cross-user validation
* @param {string} options.userBelongsToField - Specifies which related model is used for cross-user validation.
*/
export declare function preventCrossUserDataAccess(params: AnyParams, record: GadgetRecord<any>, options?: {
	userBelongsToField?: string
}): Promise<void>;
