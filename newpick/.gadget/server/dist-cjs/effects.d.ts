
import type { AnyClient, InternalModelManager, RecordData } from "@gadgetinc/api-client-core";
import { GadgetRecord } from "@gadgetinc/api-client-core";
import type { AnyActionContext, AnyAmbientContext, AnyEffectContext, AnyGlobalActionContext, AnyParams, ModelMetadata } from "./types";
export declare function getBelongsToRelationParams(model: ModelMetadata, params: Record<string, any>): Record<string, any>;
export declare function createGadgetRecord<Shape>(apiIdentifier: string, data: Shape): GadgetRecord<Shape & {
	__typename: string
}>;
/**
* Applies incoming API params (your model’s fields) to a record
*
* @param params - data passed from API calls, webhook events, or direct user inputs.
* @param record - object used to pass params to
*/
export declare function applyParams(params: AnyParams, record: GadgetRecord<any>): void;
/**
* Get the internal model manager for the model from its maybe-namespaced spot
*/
export declare const internalModelManagerForModel: (api: AnyClient, apiIdentifier: string, namespace: string[]) => InternalModelManager;
/**
* Get the internal model manager for the model from its maybe-namespaced spot
*/
export declare const internalModelManagerForTypename: (api: AnyClient, typename: string) => InternalModelManager;
/**
* Saves record to the database:
* 1. Checks field validations of a given record, then saves the record to the database.
* 2. Uses your apps Internal API to persist data. This API quickly interacts with data without running any business logic.
*
* @param record - object saved to the database
*/
export declare function save(record: GadgetRecord<any>): Promise<void>;
/**
* Deletes record from the database.
*
* @param record - object deleted from the database
*/
export declare function deleteRecord(record: GadgetRecord<any>): Promise<void>;
export declare function transitionState(record: GadgetRecord<any>, transition: {
	from?: string | Record<string, string>
	to: string | Record<string, string>
}): void;
export declare function legacySetUser(): void;
export declare function legacyUnsetUser(): void;
export declare function legacySuccessfulAuthentication(params: AnyParams): Promise<void>;
/**
* @private helper functions and variables
*/
export declare function doesVersionSupportSourceControl(): boolean;
/**
* @private Get action context without `params` and `record` from async local storage.
*/
export declare function getActionContextFromLocalStorage(): AnyActionContext | AnyGlobalActionContext | AnyEffectContext;
/**
* @private Similar to `getActionContextFromLocalStorage` but returns `undefined` if there is no action context. (i.e. possibly called from a route)
*/
export declare function maybeGetActionContextFromLocalStorage(): AnyActionContext | AnyGlobalActionContext | AnyEffectContext | undefined;
/**
* Get the current ambient context in any context
*
* @returns The current ambient context, or `undefined` if there is no ambient context.
* @private
*/
export declare function maybeGetCurrentContext(): AnyActionContext | AnyGlobalActionContext | AnyEffectContext | AnyAmbientContext | undefined;
/**
* Get the current ambient context in any context
*
* @returns The current ambient context, or throws if there is no ambient context.
* @private
*/
export declare function getCurrentContext(): AnyActionContext | AnyGlobalActionContext | AnyEffectContext | AnyAmbientContext;
export declare const LINK_PARAM = "_link";
export declare function writableAttributes(model: ModelMetadata, record: GadgetRecord<RecordData>): Record<string, any>;
export declare function changedAttributes(model: ModelMetadata, record: GadgetRecord<RecordData>): Record<string, any>;
export declare const getModelByApiIdentifier: (apiIdentifier: string) => ModelMetadata;
export declare const getModelByTypename: (typename: string) => ModelMetadata;
export declare enum FieldType {
	ID = "ID",
	Number = "Number",
	String = "String",
	Enum = "Enum",
	RichText = "RichText",
	DateTime = "DateTime",
	Email = "Email",
	URL = "URL",
	Money = "Money",
	File = "File",
	Color = "Color",
	Password = "Password",
	Computed = "Computed",
	HasManyThrough = "HasManyThrough",
	BelongsTo = "BelongsTo",
	HasMany = "HasMany",
	HasOne = "HasOne",
	Boolean = "Boolean",
	Model = "Model",
	Object = "Object",
	Array = "Array",
	JSON = "JSON",
	Code = "Code",
	EncryptedString = "EncryptedString",
	Vector = "Vector",
	/**
	* Any value at all.
	* Prefer FieldType.JSON where possible, it's more descriptive.
	*/
	Any = "Any",
	Null = "Null",
	RecordState = "RecordState",
	RoleAssignments = "RoleAssignments",
}
