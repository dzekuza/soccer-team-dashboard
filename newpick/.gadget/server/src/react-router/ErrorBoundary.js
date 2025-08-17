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
    },
    ProductionErrorPage: function() {
        return ProductionErrorPage;
    }
});
function _interop_require_wildcard() {
    const data = require("@swc/helpers/_/_interop_require_wildcard");
    _interop_require_wildcard = function() {
        return data;
    };
    return data;
}
function _react() {
    const data = /*#__PURE__*/ _interop_require_wildcard()._(require("react"));
    _react = function() {
        return data;
    };
    return data;
}
const _overlay = require("../core/errors/overlay");
const ErrorBoundaryContainer = ({ children })=>{
    return /*#__PURE__*/ _react().default.createElement("html", null, /*#__PURE__*/ _react().default.createElement("head", null, /*#__PURE__*/ _react().default.createElement("meta", {
        charSet: "UTF-8"
    })), children);
};
const ProductionErrorPage = ()=>{
    return /*#__PURE__*/ _react().default.createElement(ErrorBoundaryContainer, null, /*#__PURE__*/ _react().default.createElement("head", null, /*#__PURE__*/ _react().default.createElement("style", null, _overlay.InconsolataFont)), /*#__PURE__*/ _react().default.createElement("body", {
        style: {
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            height: "100vh"
        }
    }, /*#__PURE__*/ _react().default.createElement("div", {
        style: {
            display: "flex",
            padding: "12px",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            gap: "12px",
            fontSize: "16px",
            fontWeight: "700"
        }
    }, /*#__PURE__*/ _react().default.createElement("div", {
        style: {
            fontSize: "48px"
        }
    }, "⚠️"), /*#__PURE__*/ _react().default.createElement("div", null, "Application Error"), /*#__PURE__*/ _react().default.createElement("div", null, "Please contact the developer of this app to help you troubleshoot the issue."))));
};
function DevelopmentErrorBoundary({ error }) {
    let title;
    let data;
    if ("status" in error && "statusText" in error && "data" in error) {
        title = `${error.status}${error.statusText ? `: ${error.statusText}` : ""}`;
        data = error.data;
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
    (0, _react().useEffect)(()=>{
        try {
            const existingScript = document.head.querySelector("script[data-error-boundary]");
            if (!existingScript) {
                const script = document.createElement("script");
                script.setAttribute("data-error-boundary", "true"); // Add identifier
                script.appendChild(document.createTextNode(javascript));
                document.head.appendChild(script);
            }
        } catch (err) {
            console.warn("Failed to inject error boundary script", err);
        }
    }, [
        javascript
    ]);
    return /*#__PURE__*/ _react().default.createElement(ErrorBoundaryContainer, null, /*#__PURE__*/ _react().default.createElement("body", null, /*#__PURE__*/ _react().default.createElement("div", {
        dangerouslySetInnerHTML: {
            __html: html
        }
    })), typeof window === "undefined" && /*#__PURE__*/ _react().default.createElement("script", {
        dangerouslySetInnerHTML: {
            __html: javascript
        }
    }));
}
function ErrorBoundary({ error }) {
    if (process.env.NODE_ENV === "production") {
        return /*#__PURE__*/ _react().default.createElement(ProductionErrorPage, null);
    }
    return /*#__PURE__*/ _react().default.createElement(DevelopmentErrorBoundary, {
        error: error
    });
}


//# sourceMappingURL=ErrorBoundary.js.map