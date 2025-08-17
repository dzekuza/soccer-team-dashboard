import React, { useEffect } from "react";
import { InconsolataFont, overlayTemplate } from "../core/errors/overlay.js";
const ErrorBoundaryContainer = ({ children })=>{
    return /*#__PURE__*/ React.createElement("html", null, /*#__PURE__*/ React.createElement("head", null, /*#__PURE__*/ React.createElement("meta", {
        charSet: "UTF-8"
    })), children);
};
export const ProductionErrorPage = ()=>{
    return /*#__PURE__*/ React.createElement(ErrorBoundaryContainer, null, /*#__PURE__*/ React.createElement("head", null, /*#__PURE__*/ React.createElement("style", null, InconsolataFont)), /*#__PURE__*/ React.createElement("body", {
        style: {
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            height: "100vh"
        }
    }, /*#__PURE__*/ React.createElement("div", {
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
    }, /*#__PURE__*/ React.createElement("div", {
        style: {
            fontSize: "48px"
        }
    }, "⚠️"), /*#__PURE__*/ React.createElement("div", null, "Application Error"), /*#__PURE__*/ React.createElement("div", null, "Please contact the developer of this app to help you troubleshoot the issue."))));
};
export function DevelopmentErrorBoundary({ error }) {
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
    const { html, javascript } = overlayTemplate({
        style: "rr7Frontend",
        errorMessage: title,
        stackTrace: data,
        environmentSlug: process.env.GADGET_ENV
    });
    useEffect(()=>{
        try {
            const existingScript = document.head.querySelector("script[data-error-boundary]");
            if (!existingScript) {
                const script = document.createElement("script");
                script.setAttribute("data-error-boundary", "true");
                // Add identifier
                script.appendChild(document.createTextNode(javascript));
                document.head.appendChild(script);
            }
        } catch (err) {
            console.warn("Failed to inject error boundary script", err);
        }
    }, [
        javascript
    ]);
    return /*#__PURE__*/ React.createElement(ErrorBoundaryContainer, null, /*#__PURE__*/ React.createElement("body", null, /*#__PURE__*/ React.createElement("div", {
        dangerouslySetInnerHTML: {
            __html: html
        }
    })), typeof window === "undefined" && /*#__PURE__*/ React.createElement("script", {
        dangerouslySetInnerHTML: {
            __html: javascript
        }
    }));
}
export function ErrorBoundary({ error }) {
    if (process.env.NODE_ENV === "production") {
        return /*#__PURE__*/ React.createElement(ProductionErrorPage, null);
    }
    return /*#__PURE__*/ React.createElement(DevelopmentErrorBoundary, {
        error: error
    });
}
