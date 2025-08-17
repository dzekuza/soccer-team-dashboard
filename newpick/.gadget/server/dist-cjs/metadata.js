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
    frameworkVersion: function() {
        return frameworkVersion;
    },
    modelListIndex: function() {
        return modelListIndex;
    },
    modelsMap: function() {
        return modelsMap;
    }
});
/**
 * Internal variable to indicate the framework version this package is built with.
 * @internal
 */ const frameworkVersion = "^1.4.0";
/**
 * Internal variable to store model blobs with GraphQL typename as the key, and use them in the action code functions.
 * @internal
 */ const modelsMap = {};
/**
 * Internal variable to map model apiIdentifier to GraphQL typename in modelsMap.
 * @internal
 */ const modelListIndex = {};
