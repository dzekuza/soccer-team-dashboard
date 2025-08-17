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
    GadgetFrameworkGlobals: function() {
        return GadgetFrameworkGlobals;
    },
    Globals: function() {
        return Globals;
    },
    actionContextLocalStorage: function() {
        return actionContextLocalStorage;
    },
    kGlobals: function() {
        return kGlobals;
    }
});
function _async_hooks() {
    const data = require("async_hooks");
    _async_hooks = function() {
        return data;
    };
    return data;
}
const _metadata = require("./metadata");
const actionContextLocalStorage = new (_async_hooks()).AsyncLocalStorage();
class GadgetFrameworkGlobals {
    /**
   * A globally accessible API client instance, set in `set` by the `AppBridge`.
   * @internal
   */ api = null;
    /**
   * Internal variable to store the model validator function, set in `set` by the `AppBridge`.
   * @internal
   */ modelValidator = null;
    /**
   * Internal variable to store the request context module, set in `set` by the `AppBridge`.
   * @internal
   */ requestContext = null;
    /**
   * A global logger instance that is userVisible and tagged with the platform source.
   * @internal
   */ logger = null;
    /**
   * Require function for importing code from the gadget platform context instead of the app's context.
   * @internal
   */ platformRequire = null;
    /**
   * This is used internally to set the globals for this instance of the framework package.
   * @internal
   */ set = (globals)=>{
        Object.assign(this, globals);
    };
    /**
   * Lazy-loaded modules for use in the framework package from the gadget platform context.
   * @internal
   */ platformModules = {
        lodash: this._platformModuleRequirer("lodash"),
        klona: this._platformModuleRequirer("klona"),
        bcrypt: this._platformModuleRequirer("bcrypt"),
        compareVersions: this._platformModuleRequirer("compare-versions")
    };
    _platformModuleRequirer(name) {
        let mod = null;
        return ()=>{
            if (!mod) {
                if (!this.platformRequire) throw new Error("Globals.platformRequire is not set, has it been injected by the sandbox yet?");
                mod = this.platformRequire(name);
            }
            return mod;
        };
    }
    /** re-export the generated metadata for easy access in the ambient context */ modelListIndex = _metadata.modelListIndex;
    modelsMap = _metadata.modelsMap;
    frameworkVersion = _metadata.frameworkVersion;
}
const Globals = new GadgetFrameworkGlobals();
const kGlobals = Symbol.for("gadget/kGlobals");


//# sourceMappingURL=globals.js.map