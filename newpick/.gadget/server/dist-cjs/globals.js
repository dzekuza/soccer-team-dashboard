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
const _async_hooks = require("async_hooks");
const _metadata = require("./metadata");
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
const actionContextLocalStorage = new _async_hooks.AsyncLocalStorage();
/**
 * Extend the @fastify/request-context types with Gadget's added reference to the current unit of work's context
 * See https://github.com/fastify/fastify-request-context#typescript
 * */ /** The list of globals that the Gadget harness injects into the framework package */ /**
 * A container for all the global bits that the gadget-server package needs access to
 * Generally shouldn't be used directly by Gadget app code as the structure is subject to change
 * @internal
 **/ class GadgetFrameworkGlobals {
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
    constructor(){
        /**
   * A globally accessible API client instance, set in `set` by the `AppBridge`.
   * @internal
   */ _define_property(this, "api", null);
        /**
   * Internal variable to store the model validator function, set in `set` by the `AppBridge`.
   * @internal
   */ _define_property(this, "modelValidator", null);
        /**
   * Internal variable to store the request context module, set in `set` by the `AppBridge`.
   * @internal
   */ _define_property(this, "requestContext", null);
        /**
   * A global logger instance that is userVisible and tagged with the platform source.
   * @internal
   */ _define_property(this, "logger", null);
        /**
   * Require function for importing code from the gadget platform context instead of the app's context.
   * @internal
   */ _define_property(this, "platformRequire", null);
        /**
   * This is used internally to set the globals for this instance of the framework package.
   * @internal
   */ _define_property(this, "set", (globals)=>{
            Object.assign(this, globals);
        });
        /**
   * Lazy-loaded modules for use in the framework package from the gadget platform context.
   * @internal
   */ _define_property(this, "platformModules", {
            lodash: this._platformModuleRequirer("lodash"),
            klona: this._platformModuleRequirer("klona"),
            bcrypt: this._platformModuleRequirer("bcrypt"),
            compareVersions: this._platformModuleRequirer("compare-versions")
        });
        /** re-export the generated metadata for easy access in the ambient context */ _define_property(this, "modelListIndex", _metadata.modelListIndex);
        _define_property(this, "modelsMap", _metadata.modelsMap);
        _define_property(this, "frameworkVersion", _metadata.frameworkVersion);
    }
}
const Globals = new GadgetFrameworkGlobals();
const kGlobals = Symbol.for("gadget/kGlobals");
