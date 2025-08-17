/**
* This is the Gadget API client library for:
*
*                             _      _    
*   _ __   _____      ___ __ (_) ___| | __
*  | '_ \ / _ \ \ /\ / / '_ \| |/ __| |/ /
*  | | | |  __/\ V  V /| |_) | | (__|   < 
*  |_| |_|\___| \_/\_/ | .__/|_|\___|_|\_\
*                      |_|                
*
* Built for environment "Development" at version 123
* API docs: https://docs.gadget.dev/api/newpick
* Edit this app here: https://newpick.gadget.app/edit
*/
export {
  BrowserSessionStorageType, GadgetClientError, GadgetConnection, GadgetInternalError, GadgetOperationError, GadgetRecord,
  GadgetRecordList, GadgetValidationError, InvalidRecordError, ChangeTracking
} from "@gadgetinc/api-client-core";

export type { AuthenticationModeOptions, BrowserSessionAuthenticationModeOptions, ClientOptions, InvalidFieldError, Select } from "@gadgetinc/api-client-core";

export * from "./Client.js";
export * from "./types.js";

declare global {
  interface Window {
    gadgetConfig: {
      apiKeys: {
        shopify: string;
      };
      environment: string;
      env: Record<string, any>;
      authentication?: {
        signInPath: string;
        redirectOnSuccessfulSignInPath: string;
      };
      shopifyInstallState?: {
        redirectToOauth: boolean;
        isAuthenticated: boolean;
        missingScopes: string[];
        shopExists: boolean;
      };
      shopifyAppBridgeCDNScriptSrc?: string;
    };
  }
}
