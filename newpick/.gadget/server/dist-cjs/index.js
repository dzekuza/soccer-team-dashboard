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
    DefaultEmailTemplates: function() {
        return _index;
    },
    /**
 * @internal
 */ Globals: function() {
        return _globals.Globals;
    },
    /**
* This is the Gadget server side types library for:
*
*                             _      _    
*   _ __   _____      ___ __ (_) ___| | __
*  | '_ \ / _ \ \ /\ / / '_ \| |/ __| |/ /
*  | | | |  __/\ V  V /| |_) | | (__|   < 
*  |_| |_|\___| \_/\_/ | .__/|_|\___|_|\_\
*                      |_|                
*
* Built for environment `Development` at version 123
* Framework version: ^1.4.0
* Edit this app here: https://newpick.gadget.dev/edit
*/ /// <reference path="./ActionContextTypes.d.ts" />
    InvalidRecordError: function() {
        return _apiclientcore.InvalidRecordError;
    },
    InvalidStateTransitionError: function() {
        return _errors.InvalidStateTransitionError;
    },
    ShopifyBulkOperationState: function() {
        return _index1.ShopifyBulkOperationState;
    },
    ShopifySellingPlanGroupProductState: function() {
        return _index1.ShopifySellingPlanGroupProductState;
    },
    ShopifySellingPlanGroupProductVariantState: function() {
        return _index1.ShopifySellingPlanGroupProductVariantState;
    },
    ShopifyShopState: function() {
        return _index1.ShopifyShopState;
    },
    ShopifySyncState: function() {
        return _index1.ShopifySyncState;
    },
    abortSync: function() {
        return _index1.abortSync;
    },
    actionContextLocalStorage: function() {
        return _globals.actionContextLocalStorage;
    },
    api: function() {
        return api;
    },
    connections: function() {
        return connections;
    },
    finishBulkOperation: function() {
        return _index1.finishBulkOperation;
    },
    globalShopifySync: function() {
        return _index1.globalShopifySync;
    },
    logger: function() {
        return logger;
    },
    preventCrossShopDataAccess: function() {
        return _index1.preventCrossShopDataAccess;
    },
    setApiClient: function() {
        return setApiClient;
    },
    setConnections: function() {
        return setConnections;
    },
    setLogger: function() {
        return setLogger;
    },
    shopifySync: function() {
        return _index1.shopifySync;
    }
});
const _apiclientcore = require("@gadgetinc/api-client-core");
_export_star(require("./metadataFileTypes"), exports);
_export_star(require("./AmbientContext"), exports);
_export_star(require("./AppConfigs"), exports);
_export_star(require("./AppConfiguration"), exports);
_export_star(require("./AppConnections"), exports);
_export_star(require("./auth"), exports);
const _index = /*#__PURE__*/ _interop_require_wildcard(require("./email-templates/index"));
_export_star(require("./emails"), exports);
const _errors = require("./errors");
_export_star(require("./global-actions"), exports);
_export_star(require("./routes"), exports);
_export_star(require("./state-chart/index"), exports);
_export_star(require("./types"), exports);
_export_star(require("./ActionOptions"), exports);
_export_star(require("./effects"), exports);
_export_star(require("./utils"), exports);
const _index1 = require("./shopify/index");
const _globals = require(/**
 * @internal
 */ "./globals");
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
/**
* A map of connection name to instantiated connection objects for the app.
*/ let connections;
/**
 * An instance of the Gadget logger
 */ let logger;
/**
 * An instance of the Gadget API client that has admin permissions
 */ let api;
/**
* This is used internally to set the connections.
* @internal
*/ const setConnections = (appConnections)=>{
    connections = new Proxy(appConnections, {
        get: (target, prop)=>{
            const actionContext = _globals.actionContextLocalStorage.getStore();
            if (actionContext && actionContext.connections) {
                return actionContext.connections[prop];
            }
            const routeContext = _globals.Globals.requestContext.get("requestContext");
            if (routeContext && routeContext.connections) {
                return routeContext.connections[prop];
            }
            return target[prop];
        }
    });
};
/**
 * This is used internally to set the rootLogger.
 * @internal
 */ const setLogger = (rootLogger)=>{
    // set the internal facing global logger to be this instance, which is tagged with the platform source
    _globals.Globals.logger = rootLogger;
    // set the user-facing global logger to be this instance tagged with the user source, as users are importing this global and using it
    logger = rootLogger.child({
        source: "user"
    });
};
/**
 * This is used internally to set the client Instance
 * @internal
 */ const setApiClient = (client)=>{
    api = client;
};
/**
 * Register the globals on the globalThis object for use in the api client constructor when we need access to the global API client instance
 **/ globalThis.GadgetGlobals = _globals.Globals;
