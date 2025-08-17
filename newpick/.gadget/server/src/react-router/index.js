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
    reactRouterConfigOptions: function() {
        return reactRouterConfigOptions;
    }
});
const _constants = require("./constants");
const _ErrorBoundary = require("./ErrorBoundary");
const reactRouterConfigOptions = {
    buildDirectory: _constants.BuildDirectory,
    appDirectory: _constants.AppDirectory,
    future: {
        unstable_optimizeDeps: true
    }
};


//# sourceMappingURL=index.js.map