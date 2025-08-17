import { type GadgetConnection, type VariablesOptions } from "@gadgetinc/api-client-core";
export type ComputedViewFunctionWithoutVariables<Result> = () => Promise<Result>;
export interface ComputedViewWithoutVariables<Result> extends ComputedViewFunctionWithoutVariables<Result> {
    type: "computedView";
    operationName: string;
    gqlFieldName: string;
    namespace: string | string[] | null;
    resultType: Result;
    plan(): {
        query: string;
    };
}
export type ComputedViewFunctionWithVariables<Variables, Result> = (variables?: Variables) => Promise<Result>;
export interface ComputedViewWithVariables<Variables, Result> extends ComputedViewFunctionWithVariables<Variables, Result> {
    type: "computedView";
    operationName: string;
    gqlFieldName: string;
    namespace: string | string[] | null;
    variables: VariablesOptions;
    variablesType: Variables;
    resultType: Result;
    plan(variables?: Variables): {
        query: string;
        variables?: Record<string, any>;
    };
}
export declare const computedViewOperation: (gqlFieldName: string, variablesOptions?: VariablesOptions, namespace?: string | string[] | null) => {
    query: string;
    variables: Record<string, any>;
};
export declare const computedViewRunner: (connection: GadgetConnection, gqlFieldName: string, variablesOptions?: VariablesOptions, namespace?: string | string[] | null) => Promise<any>;
export declare const inlineComputedViewOperation: (query: string, gqlFieldName: string, variables?: Record<string, any>, namespace?: string | string[] | null) => {
    query: string;
    variables: Record<string, any>;
};
export declare const inlineComputedViewRunner: (connection: GadgetConnection, gqlFieldName: string, viewQuery: string, variables?: Record<string, any>, namespace?: string | string[] | null) => Promise<unknown>;
