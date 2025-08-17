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
        return DevelopmentErrorBoundary;
    },
    ErrorBoundary: function() {
        return ErrorBoundary;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _overlay = require("../core/errors/overlay");
const _react1 = require("@remix-run/react");
const _ErrorBoundary = require("../react-router/ErrorBoundary");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function DevelopmentErrorBoundary() {
    const error = (0, _react1.useRouteError)();
    let title;
    let data;
    if (typeof error === "object" && error !== null && "status" in error && "statusText" in error && "data" in error) {
        title = `${error.status}${error.statusText ? `: ${JSON.stringify(error.statusText)}` : ""}`;
        data = JSON.stringify(error.data);
    } else if (error instanceof Error) {
        title = `Error: ${error.message}`;
        data = error.stack;
    } else {
        title = "An unknown error occurred";
    }
    const { html, javascript } = (0, _overlay.overlayTemplate)({
        style: "rr7Frontend",
        errorMessage: title,
        stackTrace: data,
        environmentSlug: process.env.GADGET_ENV
    });
    (0, _react.useEffect)(()=>{
        const script = document.createElement("script");
        script.appendChild(document.createTextNode(javascript));
        document.head.appendChild(script);
    }, [
        javascript
    ]);
    return /*#__PURE__*/ _react.default.createElement("html", null, /*#__PURE__*/ _react.default.createElement("head", null), /*#__PURE__*/ _react.default.createElement("body", null, /*#__PURE__*/ _react.default.createElement("div", {
        dangerouslySetInnerHTML: {
            __html: html
        }
    })));
}
function ErrorBoundary() {
    if (process.env.NODE_ENV === "production") {
        return /*#__PURE__*/ _react.default.createElement(_ErrorBoundary.ProductionErrorPage, null);
    }
    return /*#__PURE__*/ _react.default.createElement(DevelopmentErrorBoundary, null);
}
