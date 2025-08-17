
/** Bag of data details passed to an error */
interface ErrorDetails {
	cause?: Error;
	[key: string]: any;
}
/**
* Parent class for all the enhanced errors in any gadget-owned package
*/
declare class GadgetError extends Error {
	/** Was this error caused by the Gadget application's code */
	causedByUserland: boolean;
	/** Was this error caused by the API client calling the Gadget application */
	causedByClient: boolean;
	/** What HTTP status code should be sent when responding with this error */
	statusCode: number;
	/** A GGT_SOMETHING human/machine readable string unique error class name */
	code: string;
	/** If this error is thrown, should we allow its code, message, and details to be sent to the client. Defaults to true for errors with 400 series status codes and false otherwise. */
	exposeToClient: boolean;
	/** If this error is thrown, should we allow its code, message, and details to be sent to the sandbox. Defaults to true. */
	exposeToSandbox: boolean;
	/** Optional bag of data about this error */
	details?: ErrorDetails;
	/** Was this error already logged? */
	logged: boolean;
	/** Inner error which caused this error */
	cause?: Error;
	constructor(message?: string, details?: ErrorDetails);
}
export interface PermissionDeniedDetails extends ErrorDetails {
	actor?: string | Record<string, any>;
	actorRoleKeys?: string[];
	resource?: Record<string, any>;
}
/** Thrown when an API client tries to access data that it's roles don't grant it access to. */
export declare class PermissionDeniedError extends GadgetError {
	code: "GGT_PERMISSION_DENIED";
	static code: "GGT_PERMISSION_DENIED";
	statusCode: number;
	causedByClient: boolean;
	causedByUserland: boolean;
	actor?: string | Record<string, any>;
	actorRoleKeys?: string[];
	resource?: Record<string, any>;
	constructor(message?: string, details?: PermissionDeniedDetails);
}
/** Thrown when an action is trying to execute but can't because it's missing key configuration or some configuration value is itself invalid. This is the app developer's fault -- the action needs to be corrected in order to work. */
export declare class MisconfiguredActionError extends GadgetError {
	code: "GGT_MISCONFIGURED_ACTION";
	static code: "GGT_MISCONFIGURED_ACTION";
	statusCode: number;
	causedByClient: boolean;
	causedByUserland: boolean;
	constructor(message?: string, details?: ErrorDetails);
}
/**
* Catch all error thrown when something unexpected happens within the Gadget platform that isn't directly the app developer's fault.
* Indicates that the error is the fault of the platform, and hides the details of why in case it might leak sensitive information.
* Try not to use this as it isn't actionable by app developers, but if something really is our fault and out of their control, it's cool.
*/
export declare class InternalError extends GadgetError {
	code: "GGT_INTERNAL_ERROR";
	static code: "GGT_INTERNAL_ERROR";
	statusCode: number;
	causedByClient: boolean;
	causedByUserland: boolean;
	constructor(message?: string, details?: ErrorDetails);
}
export declare class InvalidActionInputError extends GadgetError {
	code: "GGT_INVALID_ACTION_INPUT";
	static code: "GGT_INVALID_ACTION_INPUT";
	statusCode: number;
	causedByClient: boolean;
	causedByUserland: boolean;
	constructor(message?: string, details?: ErrorDetails);
}
export declare class InvalidStateTransitionError extends GadgetError {
	code: "GGT_INVALID_STATE_TRANSITION";
	static code: "GGT_INVALID_STATE_TRANSITION";
	statusCode: number;
	causedByClient: boolean;
	causedByUserland: boolean;
	constructor(message?: string, details?: ErrorDetails);
}
export declare class UserNotSetOnSessionError extends GadgetError {
	code: "GGT_USER_NOT_SET_ON_SESSION";
	static code: "GGT_USER_NOT_SET_ON_SESSION";
	statusCode: number;
	causedByClient: boolean;
	causedByUserland: boolean;
	constructor(message?: string, details?: ErrorDetails);
}
export declare class NoSessionForAuthenticationError extends GadgetError {
	code: "GGT_NO_SESSION_FOR_AUTHENTICATION";
	static code: "GGT_NO_SESSION_FOR_AUTHENTICATION";
	statusCode: number;
	causedByClient: boolean;
	causedByUserland: boolean;
	constructor(message?: string, details?: ErrorDetails);
}
/** Represents what is thrown when an action can't be taken on a record because it's an illegal state transition */
export declare class NoTransitionError extends GadgetError {
	code: "GGT_NO_TRANSITION";
	static code: "GGT_NO_TRANSITION";
	statusCode: number;
	causedByClient: boolean;
	causedByUserland: boolean;
	constructor(message?: string, details?: ErrorDetails);
}
export declare class GlobalNotSetError extends GadgetError {
	code: "GGT_GLOBAL_NOT_SET";
	static code: "GGT_GLOBAL_NOT_SET";
	statusCode: number;
	causedByClient: boolean;
	causedByUserland: boolean;
	constructor(message?: string, details?: ErrorDetails);
}
export {};
