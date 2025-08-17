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
    DevelopmentErrorBoundary: function() {
        return _ErrorBoundary.DevelopmentErrorBoundary;
    },
    ErrorBoundary: function() {
        return _ErrorBoundary.ErrorBoundary;
    },
    ProductionErrorBoundary: function() {
        return _ErrorBoundary.ErrorBoundary;
    },
    remixViteOptions: function() {
        return remixViteOptions;
    }
});
const _constants = require("./constants");
const _ErrorBoundary = require("./ErrorBoundary");
/**
 * Parameters for running a Remix app in Gadget.
 */ const remixViteOptions = {
    buildDirectory: _constants.BuildDirectory,
    appDirectory: _constants.AppDirectory,
    future: {
        "unstable_optimizeDeps": true
    }
};
