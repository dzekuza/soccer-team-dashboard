import { getHtmlTags, getViteConfig } from "./helpers";
import { GadgetPluginOptions } from "./types";
import { patchOverlay } from "../core/errors/overlay";

/**
 * Vite plugin that is used to configure the Vite build process for the Gadget application.
 */
export const gadget = (options?: GadgetPluginOptions) => {
  

  /**
   * Available frontend type:
   * - "remix"
   * - "react-router-framework"
   * - "vite"
   */
  let frontendType: any;
  let command: "serve" | "build";

  return {
    name: "gadget-vite-plugin",
    config: async (config: any, env: any) => {
      
        const result = await getViteConfig(config, env, {
          plugin: options,
          params: {
            assetsBucketDomain: "app-assets.gadget.dev",
            applicationId: "262843",
            productionEnvironmentId: "519615",
            developmentEnvironmentVariables: {"GADGET_APP":"newpick","GADGET_ENV":"development","GADGET_PUBLIC_APP_SLUG":"newpick","GADGET_PUBLIC_APP_ENV":"development","GADGET_APP_TEMPLATE_TYPE":"ShopifyApp","GADGET_FLAG_ASSISTANT_ENABLED":"true"},
            productionEnvironmentVariables: {"GADGET_APP":"newpick","GADGET_ENV":"production","GADGET_PUBLIC_APP_SLUG":"newpick","GADGET_PUBLIC_APP_ENV":"production","GADGET_APP_TEMPLATE_TYPE":"ShopifyApp"},
            useSameDomainAssets: false,
          },
        });

        frontendType = result.type;
        command = result.command;

        return result.config;
      
    },
    transformIndexHtml: {
      order: "pre",
      handler: (html: string, { server }: any) => {
        
        if(frontendType !== "vite") {
          return [];
        }

        const tags = getHtmlTags({
          hasAppBridgeV4: true,
          hasBigCommerceConnection: false,
          assetsDomain: "assets.gadget.dev",
          hasShopifyConnection: true,
        }, !!server);

        return tags;
        
      }
    },
    transform(src: any, id: any, opts: any) {
      
      if (id.includes("vite/dist/client/client.mjs")) {
        if (opts.ssr) return;
        return {
          code: patchOverlay(src, "development"),
          };
        }
      

      if(frontendType !== "vite" && command === "serve" && (id.endsWith("/web/root.tsx") || id.endsWith("/web/root.jsx"))) {
        return {
          code: src + `
if(typeof window !== "undefined") {
  const script = window.document.createElement("script");
  script.src = "https://assets.gadget.dev/assets/devHarness.min.js";
  window.document.head.appendChild(script);

  // We need to be able to access the Vite HMR object in dev harness, so we leak it into the window object with a proxy.
  window.__gadget_vite_hmr_connection = new Proxy(import.meta.hot, {
    get(target, prop) {
      return target[prop];
    },
    set() {
      return false;
    }
  });


  const originalParams = window.location.search;
  if (import.meta.hot) {
    const replaceParams = () => {
      const currentParams = new URLSearchParams(window.location.search);
      if (!currentParams.has("hmac") && history) {
        history.pushState({}, "", window.location.pathname + originalParams);
      }
    }
    import.meta.hot.on("vite:beforeFullReload", replaceParams);
    import.meta.hot.on("vite:ws:disconnect", replaceParams);
  }

}
`
        }
      }
    }
  } as any;
}
