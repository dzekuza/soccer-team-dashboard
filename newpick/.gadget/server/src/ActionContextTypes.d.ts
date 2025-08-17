import "path";

import { InstallWebPixelGlobalActionContext } from "./global-actions";




declare module "../../../api/actions/installWebPixel" {
  export type ActionRun = (params: InstallWebPixelGlobalActionContext) => Promise<any>;
  export type ActionOnSuccess = (params: InstallWebPixelGlobalActionContext) => Promise<any>;
}

