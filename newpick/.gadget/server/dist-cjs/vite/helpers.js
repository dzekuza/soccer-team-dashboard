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
    FrontendType: function() {
        return FrontendType;
    },
    VITE_PUBLIC_ENV_PREFIXES: function() {
        return VITE_PUBLIC_ENV_PREFIXES;
    },
    buildDefinesMap: function() {
        return buildDefinesMap;
    },
    doesViteConfigHasGadgetPlugin: function() {
        return doesViteConfigHasGadgetPlugin;
    },
    frontendTypeIndicatorFilePath: function() {
        return frontendTypeIndicatorFilePath;
    },
    getFrontendTypeByPluginsUsed: function() {
        return getFrontendTypeByPluginsUsed;
    },
    getHtmlTags: function() {
        return getHtmlTags;
    },
    getViteConfig: function() {
        return getViteConfig;
    },
    isRemixOrReactRouterFrameworkType: function() {
        return isRemixOrReactRouterFrameworkType;
    }
});
const _promises = /*#__PURE__*/ _interop_require_default(require("fs/promises"));
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _constants = require("../remix/constants");
const _utils = require("./utils");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var FrontendType = /*#__PURE__*/ function(FrontendType) {
    FrontendType["ReactRouterFramework"] = "react-router-framework";
    FrontendType["Remix"] = "remix";
    FrontendType["Vite"] = "vite";
    return FrontendType;
}({});
const frontendTypeIndicatorFilePath = ".gadget/FRONTEND_TYPE";
const maybeGetPluginByName = (name, plugin)=>{
    if (plugin && "name" in plugin && plugin.name === name) {
        return plugin;
    }
};
const isRemixOrReactRouterFrameworkType = (type)=>{
    return type === "remix" || type === "react-router-framework";
};
const getFrontendTypeByPluginsUsed = (config)=>{
    let type = "vite";
    /**
   * Check if the vite config has a remix or react-router plugin.
   *
   * We need to find several remix-related plugins because the `remix()` plugin has a list of plugins registered, and Vite will recursively resolve the plugins.
   * So, when Vite resolves the config, the `config.plugins` array value changes.
   *
   * For example, the vite config has two plugins: `[gadget(), remix()]`. When Vite runs dev/build command, this `getFrontendTypeByPluginsUsed()` function is actually called more than once.
   *
   * In the first call, the `config.plugins` array value is `[{name: "gadget-vite-plugin", ... }, {name: "remix", ... }]`. The "remix" plugin name is the `remix()` plugin.
   * However, in a second call, the `config.plugins` array value is `[{name: "gadget-vite-plugin", ... }, {name: "remix-virtual-modules", ... }, {name: "remix-hmr-runtime", ... }]`. They are all from the `remix()` plugin, and the "remix" plugin name is no longer in the array.
   */ const hasReactRouterPlugin = config.plugins?.some((pluginOptions)=>{
        if (Array.isArray(pluginOptions)) {
            return pluginOptions.some((plugin)=>maybeGetPluginByName("react-router", plugin));
        } else {
            return !!maybeGetPluginByName("react-router-virtual-modules", pluginOptions) || !!maybeGetPluginByName("react-router:virtual-modules", pluginOptions);
        }
    });
    if (hasReactRouterPlugin) {
        type = "react-router-framework";
    }
    const hasRemixPlugin = config.plugins?.some((pluginOptions)=>{
        if (Array.isArray(pluginOptions)) {
            return pluginOptions.some((plugin)=>maybeGetPluginByName("remix", plugin));
        } else {
            return !!maybeGetPluginByName("remix-virtual-modules", pluginOptions);
        }
    });
    if (hasRemixPlugin) {
        type = "remix";
    }
    return type;
};
const doesViteConfigHasGadgetPlugin = (config)=>{
    return config.plugins?.some((plugin)=>{
        return !!maybeGetPluginByName("gadget-vite-plugin", plugin);
    }) ?? false;
};
const getViteConfig = async (config, { command, mode, isSsrBuild }, options)=>{
    const { assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets } = options.params;
    const type = getFrontendTypeByPluginsUsed(config);
    const frontendConfig = (0, _utils.getInternalFrontendConfig)(type);
    config.envPrefix = VITE_PUBLIC_ENV_PREFIXES;
    config.build = {
        ...config.build,
        manifest: true
    };
    // in ssr mode use the real process.env
    if (!isSsrBuild) {
        // set up the defines for our process.env.WHATEVER polyfill (which vite doesn't do on its own)
        const vars = mode === "development" ? options.params.developmentEnvironmentVariables : options.params.productionEnvironmentVariables;
        // merge the decided-upon vars into process.env so vite will use them for `import.meta.env`
        for (const [key, value] of Object.entries(vars)){
            process.env[key] = value;
        }
        config.define = {
            ...buildDefinesMap(vars, mode),
            ...config.define
        };
    }
    switch(type){
        case "vite":
            config.build = {
                ...config.build,
                outDir: "./.gadget/vite-dist",
                emptyOutDir: true
            };
            break;
        default:
            break;
    }
    if (command === "build") {
        await _promises.default.mkdir(".gadget", {
            recursive: true
        });
        await _promises.default.writeFile(frontendTypeIndicatorFilePath, type);
        // Serve the assets from the Gadget CDN in production
        config.base = frontendConfig.productionBaseUrl(assetsBucketDomain, applicationId, productionEnvironmentId, useSameDomainAssets);
        if (isRemixOrReactRouterFrameworkType(type)) {
            const parentDirectory = _path.default.join(_constants.BuildDirectory, "..");
            await _promises.default.mkdir(parentDirectory, {
                recursive: true
            });
            await _promises.default.writeFile(_path.default.join(parentDirectory, "package.json"), `{"type": "module"}`);
        }
    }
    return {
        config,
        type,
        command
    };
};
const getHtmlTags = (options, devMode)=>{
    const tags = [];
    if (options.hasAppBridgeV4) {
        tags.push({
            tag: "script",
            injectTo: "head",
            attrs: {
                src: `https://cdn.shopify.com/shopifycloud/app-bridge.js`,
                "data-api-key": "%SHOPIFY_API_KEY%"
            }
        });
    }
    if (options.hasBigCommerceConnection) {
        tags.push({
            tag: "script",
            injectTo: "head",
            attrs: {
                src: `https://cdn.bigcommerce.com/jssdk/bc-sdk.js`
            }
        });
    }
    if (devMode) {
        tags.push({
            tag: "script",
            attrs: {
                type: "module"
            },
            children: `
        if (import.meta.hot) {
          import.meta.hot.on("gadget:viteError", (data) => {
            const event = new CustomEvent("gadget:viteError", {
              detail: data,
            });
            window.dispatchEvent(event);
          });
        }
      `
        });
        tags.push({
            tag: "script",
            attrs: {
                async: true,
                crossorigin: true,
                src: `https://${options.assetsDomain}/assets/devHarness.min.js`
            }
        });
        if (options.hasShopifyConnection) {
            tags.push({
                tag: "script",
                attrs: {
                    type: "module"
                },
                children: `
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
        `
            });
        }
    }
    return tags;
};
/** Given a list of environment variables, set up the defines for Vite to replace process.env.FOO with these valuies */ const buildDefinesMap = (env, mode)=>{
    const defines = {
        // this one pesky env var changes based on the requester at runtime, so we can't define it statically at build time. we rely on it being injected into the global scope by the serving layer. it is important that this more specific define is before the catch-all process.env define below
        "process.env.GADGET_PUBLIC_SHOPIFY_APP_URL": "globalThis.gadgetPublicShopifyAppUrl"
    };
    // add specific define replacements for env vars that might be used at build time so that we don't interpolate the large env object for every reference every time and bloat the bundle size
    for (const [key, value] of Object.entries(env)){
        if (value) {
            defines[`process.env.${key}`] = JSON.stringify(value);
        }
    }
    // to support square bracket syntax or Object.keys or what have you in production mode, we also define the whole object this way
    // we do not need to do this in development mode because vite will define process.env as a global variable that we can access as any other object
    if (mode === "production") {
        defines["process.env"] = JSON.stringify(env);
    }
    return defines;
};
const VITE_PUBLIC_ENV_PREFIXES = [
    "GADGET_PUBLIC_",
    "VITE_",
    "GADGET_APP",
    "GADGET_ENV"
];
