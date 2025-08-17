import React, { useEffect } from "react";
import { InconsolataFont, overlayTemplate } from "../core/errors/overlay";

const ErrorBoundaryContainer = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
      </head>
      {children}
    </html>
  );
};

export const ProductionErrorPage = (): JSX.Element => {
  return (
    <ErrorBoundaryContainer>
      <head>
        <style>{InconsolataFont}</style>
      </head>
      <body
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "12px",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            gap: "12px",
            fontSize: "16px",
            fontWeight: "700",
          }}
        >
          <div style={{ fontSize: "48px" }}>⚠️</div>
          <div>Application Error</div>
          <div>Please contact the developer of this app to help you troubleshoot the issue.</div>
        </div>
      </body>
    </ErrorBoundaryContainer>
  );
};

export function DevelopmentErrorBoundary({ error }: { error: { status: number; statusText: string; data: any } | Error }): JSX.Element {
  let title: string;
  let data: string | undefined;

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
    environmentSlug: process.env.GADGET_ENV!,
  });

  useEffect(() => {
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
  }, [javascript]);

  return (
    <ErrorBoundaryContainer>
      <body>
        <div
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        ></div>
      </body>

      {typeof window === "undefined" && <script dangerouslySetInnerHTML={{ __html: javascript }} />}
    </ErrorBoundaryContainer>
  );
}

export function ErrorBoundary({ error }: { error: { status: number; statusText: string; data: any } | Error }): React.ReactNode {
  if (process.env.NODE_ENV === "production") {
    return <ProductionErrorPage />;
  }

  return <DevelopmentErrorBoundary error={error} />;
}
