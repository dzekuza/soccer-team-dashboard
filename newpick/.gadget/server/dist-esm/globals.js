import { AsyncLocalStorage } from "async_hooks";
import { frameworkVersion, modelListIndex, modelsMap } from "./metadata.js";
export const actionContextLocalStorage = new AsyncLocalStorage();
/**
 * Extend the @fastify/request-context types with Gadget's added reference to the current unit of work's context
 * See https://github.com/fastify/fastify-request-context#typescript
 * */ /** The list of globals that the Gadget harness injects into the framework package */ /**
 * A container for all the global bits that the gadget-server package needs access to
 * Generally shouldn't be used directly by Gadget app code as the structure is subject to change
 * @internal
 **/ export class GadgetFrameworkGlobals {
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
    /** re-export the generated metadata for easy access in the ambient context */ modelListIndex = modelListIndex;
    modelsMap = modelsMap;
    frameworkVersion = frameworkVersion;
}
export const Globals = new GadgetFrameworkGlobals();
export const kGlobals = Symbol.for("gadget/kGlobals");
