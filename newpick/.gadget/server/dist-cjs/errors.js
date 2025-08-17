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
    GlobalNotSetError: function() {
        return GlobalNotSetError;
    },
    InternalError: function() {
        return InternalError;
    },
    InvalidActionInputError: function() {
        return InvalidActionInputError;
    },
    InvalidStateTransitionError: function() {
        return InvalidStateTransitionError;
    },
    MisconfiguredActionError: function() {
        return MisconfiguredActionError;
    },
    NoSessionForAuthenticationError: function() {
        return NoSessionForAuthenticationError;
    },
    NoTransitionError: function() {
        return NoTransitionError;
    },
    PermissionDeniedError: function() {
        return PermissionDeniedError;
    },
    UserNotSetOnSessionError: function() {
        return UserNotSetOnSessionError;
    }
});
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/** Bag of data details passed to an error */ /**
 * Parent class for all the enhanced errors in any gadget-owned package
 */ class GadgetError extends Error {
    constructor(message = "An internal error occurred.", details){
        super(message), /** Was this error caused by the Gadget application's code */ _define_property(this, "causedByUserland", false), /** Was this error caused by the API client calling the Gadget application */ _define_property(this, "causedByClient", false), /** What HTTP status code should be sent when responding with this error */ _define_property(this, "statusCode", 500), /** A GGT_SOMETHING human/machine readable string unique error class name */ _define_property(this, "code", void 0), /** If this error is thrown, should we allow its code, message, and details to be sent to the client. Defaults to true for errors with 400 series status codes and false otherwise. */ _define_property(this, "exposeToClient", void 0), /** If this error is thrown, should we allow its code, message, and details to be sent to the sandbox. Defaults to true. */ _define_property(this, "exposeToSandbox", void 0), /** Optional bag of data about this error */ _define_property(this, "details", void 0), /** Was this error already logged? */ _define_property(this, "logged", false), /** Inner error which caused this error */ _define_property(this, "cause", void 0);
        this.message = `${this.constructor.code}: ${this.message}`;
        this.details = details;
        if (details?.cause) {
            this.cause = details.cause;
            delete details.cause;
        }
        this.name = this.constructor.name;
    }
}
/** Thrown when an API client tries to access data that it's roles don't grant it access to. */ class PermissionDeniedError extends GadgetError {
    constructor(message = "Permission denied to access this resource.", details = {}){
        super(message, details), _define_property(this, "code", "GGT_PERMISSION_DENIED"), _define_property(this, "statusCode", 403), _define_property(this, "causedByClient", true), _define_property(this, "causedByUserland", false), _define_property(this, "actor", void 0), _define_property(this, "actorRoleKeys", void 0), _define_property(this, "resource", void 0);
        this.actor = details.actor;
        this.actorRoleKeys = details.actorRoleKeys;
        this.resource = details.resource;
    }
}
_define_property(PermissionDeniedError, "code", "GGT_PERMISSION_DENIED");
/** Thrown when an action is trying to execute but can't because it's missing key configuration or some configuration value is itself invalid. This is the app developer's fault -- the action needs to be corrected in order to work. */ class MisconfiguredActionError extends GadgetError {
    constructor(message = "Invalid action configuration, request cannot be processed until this is corrected.", details){
        super(message, details), _define_property(this, "code", "GGT_MISCONFIGURED_ACTION"), _define_property(this, "statusCode", 500), _define_property(this, "causedByClient", false), _define_property(this, "causedByUserland", true);
    }
}
_define_property(MisconfiguredActionError, "code", "GGT_MISCONFIGURED_ACTION");
/**
 * Catch all error thrown when something unexpected happens within the Gadget platform that isn't directly the app developer's fault.
 * Indicates that the error is the fault of the platform, and hides the details of why in case it might leak sensitive information.
 * Try not to use this as it isn't actionable by app developers, but if something really is our fault and out of their control, it's cool.
 */ class InternalError extends GadgetError {
    constructor(message = "An internal error occurred.", details){
        super(message, details), _define_property(this, "code", "GGT_INTERNAL_ERROR"), _define_property(this, "statusCode", 500), _define_property(this, "causedByClient", false), _define_property(this, "causedByUserland", false);
    }
}
_define_property(InternalError, "code", "GGT_INTERNAL_ERROR");
class InvalidActionInputError extends GadgetError {
    constructor(message = "Input was invalid for an action", details){
        super(message, details), _define_property(this, "code", "GGT_INVALID_ACTION_INPUT"), _define_property(this, "statusCode", 422), _define_property(this, "causedByClient", true), _define_property(this, "causedByUserland", false);
    }
}
_define_property(InvalidActionInputError, "code", "GGT_INVALID_ACTION_INPUT");
class InvalidStateTransitionError extends GadgetError {
    constructor(message = "Invalid state transition", details){
        super(message, details), _define_property(this, "code", "GGT_INVALID_STATE_TRANSITION"), _define_property(this, "statusCode", 422), _define_property(this, "causedByClient", false), _define_property(this, "causedByUserland", true);
    }
}
_define_property(InvalidStateTransitionError, "code", "GGT_INVALID_STATE_TRANSITION");
class UserNotSetOnSessionError extends GadgetError {
    constructor(message = "User not set on session", details){
        super(message, details), _define_property(this, "code", "GGT_USER_NOT_SET_ON_SESSION"), _define_property(this, "statusCode", 401), _define_property(this, "causedByClient", true), _define_property(this, "causedByUserland", false);
    }
}
_define_property(UserNotSetOnSessionError, "code", "GGT_USER_NOT_SET_ON_SESSION");
class NoSessionForAuthenticationError extends GadgetError {
    constructor(message = "There is no authenticated user in scope.", details){
        super(message, details), _define_property(this, "code", "GGT_NO_SESSION_FOR_AUTHENTICATION"), _define_property(this, "statusCode", 401), _define_property(this, "causedByClient", true), _define_property(this, "causedByUserland", false);
    }
}
_define_property(NoSessionForAuthenticationError, "code", "GGT_NO_SESSION_FOR_AUTHENTICATION");
/** Represents what is thrown when an action can't be taken on a record because it's an illegal state transition */ class NoTransitionError extends GadgetError {
    constructor(message = "Invalid action", details){
        super(message, details), _define_property(this, "code", "GGT_NO_TRANSITION"), _define_property(this, "statusCode", 422), _define_property(this, "causedByClient", true), _define_property(this, "causedByUserland", false);
    }
}
_define_property(NoTransitionError, "code", "GGT_NO_TRANSITION");
class GlobalNotSetError extends GadgetError {
    constructor(message = "Globals not yet set", details){
        super(message, details), _define_property(this, "code", "GGT_GLOBAL_NOT_SET"), _define_property(this, "statusCode", 500), _define_property(this, "causedByClient", false), _define_property(this, "causedByUserland", false);
    }
}
_define_property(GlobalNotSetError, "code", "GGT_GLOBAL_NOT_SET");
