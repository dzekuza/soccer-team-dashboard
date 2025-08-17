import React, { useEffect } from "react";
import { overlayTemplate } from "../core/errors/overlay";
import { useRouteError } from "@remix-run/react";
import { ProductionErrorPage } from "../react-router/ErrorBoundary";

export function DevelopmentErrorBoundary(): React.ReactNode {
  const error = useRouteError();
  let title: string;
  let data: string | undefined;

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
    environmentSlug: process.env.GADGET_ENV!,
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.appendChild(document.createTextNode(javascript));
    document.head.appendChild(script);
  }, [javascript]);

  return (
    <html>
      <head></head>
      <body>
        <div
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        ></div>
      </body>
    </html>
  );
}

export function ErrorBoundary(): React.ReactNode {
  if (process.env.NODE_ENV === "production") {
    return <ProductionErrorPage />;
  }

  return <DevelopmentErrorBoundary />;
}
