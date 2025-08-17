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
    Config: function() {
        return Config;
    },
    setAppConfigs: function() {
        return setAppConfigs;
    }
});
/**
 * An object containing the app's base configuration variables
 */ let Config;
/**
 * This is used internally to set the apps config names
 * @internal
 */ const setAppConfigs = (configs)=>{
    Config = configs;
}; /**
 * Contains the app's base name configurations
 */  /** The name of your app */  /** The primary domain from the URL of your app. */  /** The url of your app */ 
