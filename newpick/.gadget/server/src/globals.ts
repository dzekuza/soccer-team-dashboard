import type { RequestContext } from "@fastify/request-context";
import type { AnyClient } from "@gadgetinc/api-client-core";
import { AsyncLocalStorage } from "async_hooks";
import type { Logger } from "./AmbientContext";
import { frameworkVersion, modelListIndex, modelsMap } from "./metadata";
import type { AnyActionContext, AnyAmbientContext, AnyEffectContext, AnyGlobalActionContext } from "./types";

export const actionContextLocalStorage: AsyncLocalStorage<AnyActionContext | AnyGlobalActionContext | AnyEffectContext> =
  new AsyncLocalStorage<AnyActionContext | AnyGlobalActionContext | AnyEffectContext>();

/**
 * Extend the @fastify/request-context types with Gadget's added reference to the current unit of work's context
 * See https://github.com/fastify/fastify-request-context#typescript
 * */
declare module "@fastify/request-context" {
  interface RequestContextData {
    requestContext: AnyAmbientContext | AnyActionContext | AnyGlobalActionContext | AnyEffectContext;
  }
}

/** The list of globals that the Gadget harness injects into the framework package */
export interface SettableGlobals {
  logger: Logger;
  modelValidator: (modelKey: string) => Promise<any>;
  requestContext: RequestContext;
  platformRequire: typeof require;
  api: AnyClient;
}

export type GlobalSetter = (globals: SettableGlobals) => void;

/**
 * A container for all the global bits that the gadget-server package needs access to
 * Generally shouldn't be used directly by Gadget app code as the structure is subject to change
 * @internal
 **/
export class GadgetFrameworkGlobals {
  /**
   * A globally accessible API client instance, set in `set` by the `AppBridge`.
   * @internal
   */
  api: AnyClient = null as any;
  /**
   * Internal variable to store the model validator function, set in `set` by the `AppBridge`.
   * @internal
   */
  modelValidator: (modelKey: string) => Promise<any> = null as any;
  /**
   * Internal variable to store the request context module, set in `set` by the `AppBridge`.
   * @internal
   */
  requestContext: RequestContext = null as any;
  /**
   * A global logger instance that is userVisible and tagged with the platform source.
   * @internal
   */
  logger: Logger = null as any;
  /**
   * Require function for importing code from the gadget platform context instead of the app's context.
   * @internal
   */
  platformRequire: typeof require = null as any;
  /**
   * This is used internally to set the globals for this instance of the framework package.
   * @internal
   */
  set: GlobalSetter = (globals: SettableGlobals): void => {
    Object.assign(this, globals);
  };

  /**
   * Lazy-loaded modules for use in the framework package from the gadget platform context.
   * @internal
   */
  platformModules: {
    lodash: () => any;
    bcrypt: () => any;
    compareVersions: () => any;
    klona: () => any;
  } = {
    lodash: this._platformModuleRequirer("lodash"),
    klona: this._platformModuleRequirer("klona"),
    bcrypt: this._platformModuleRequirer("bcrypt"),
    compareVersions: this._platformModuleRequirer("compare-versions"),
  };

  _platformModuleRequirer<T = any>(name: string): () => T {
    let mod: T = null as any;
    return () => {
      if (!mod) {
        if (!this.platformRequire) throw new Error("Globals.platformRequire is not set, has it been injected by the sandbox yet?");
        mod = this.platformRequire(name);
      }
      return mod;
    };
  }

  /** re-export the generated metadata for easy access in the ambient context */
  modelListIndex = modelListIndex;
  modelsMap = modelsMap;
  frameworkVersion = frameworkVersion;
}

export const Globals: GadgetFrameworkGlobals = new GadgetFrameworkGlobals();
export const kGlobals: unique symbol = Symbol.for("gadget/kGlobals");
