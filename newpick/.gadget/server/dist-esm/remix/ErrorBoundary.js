import React, { useEffect } from "react";
import { overlayTemplate } from "../core/errors/overlay.js";
import { useRouteError } from "@remix-run/react";
import { ProductionErrorPage } from "../react-router/ErrorBoundary.js";
export function DevelopmentErrorBoundary() {
    const error = useRouteError();
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
    const { html, javascript } = overlayTemplate({
        style: "rr7Frontend",
        errorMessage: title,
        stackTrace: data,
        environmentSlug: process.env.GADGET_ENV
    });
    useEffect(()=>{
        const script = document.createElement("script");
        script.appendChild(document.createTextNode(javascript));
        document.head.appendChild(script);
    }, [
        javascript
    ]);
    return /*#__PURE__*/ React.createElement("html", null, /*#__PURE__*/ React.createElement("head", null), /*#__PURE__*/ React.createElement("body", null, /*#__PURE__*/ React.createElement("div", {
        dangerouslySetInnerHTML: {
            __html: html
        }
    })));
}
export function ErrorBoundary() {
    if (process.env.NODE_ENV === "production") {
        return /*#__PURE__*/ React.createElement(ProductionErrorPage, null);
    }
    return /*#__PURE__*/ React.createElement(DevelopmentErrorBoundary, null);
}
