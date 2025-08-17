
import React from "react";
export declare const ProductionErrorPage: () => JSX.Element;
export declare function DevelopmentErrorBoundary({ error }: {
	error: {
		status: number
		statusText: string
		data: any
	} | Error
}): JSX.Element;
export declare function ErrorBoundary({ error }: {
	error: {
		status: number
		statusText: string
		data: any
	} | Error
}): React.ReactNode;
