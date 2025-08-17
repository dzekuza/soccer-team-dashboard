import type {
  ActionFunctionMetadata,
  AnyActionFunction,
  AnyModelFinderMetadata,
  AnyModelManager,
  BaseFindOptions,
  FieldSelection,
  FindManyOptions,
  GadgetConnection,
  GadgetRecord,
  VariablesOptions,
} from "@gadgetinc/api-client-core";
import {
  actionOperation,
  actionRunner,
  findManyOperation,
  findManyRunner,
  findOneByFieldOperation,
  findOneByFieldRunner,
  findOneOperation,
  findOneRunner,
  globalActionOperation,
  globalActionRunner,
} from "@gadgetinc/api-client-core";
import type { ComputedViewWithoutVariables, ComputedViewWithVariables } from "./computedViews.js";
import { computedViewOperation, computedViewRunner, inlineComputedViewRunner } from "./computedViews.js";

/**
 * The metadata that we need for building the runtime version of a finderoperation
 * Excludes the type-time only keys
 */
export type AnyModelFinderRuntimeMetadata = Omit<AnyModelFinderMetadata, "schemaType" | "optionsType" | "variablesType" | "selectionType">;

/**
 * The metadata that we need for building the runtime version of a finder operation
 * Excludes the type-time only keys
 */
export type AnyActionFunctionRuntimeMetadata = Omit<
  ActionFunctionMetadata<any, any, any, any, any, any>,
  "schemaType" | "optionsType" | "variablesType" | "selectionType"
>;

export type FindOneOperation = {
  type: "findOne";
  findByVariableName: "id";
} & AnyModelFinderRuntimeMetadata;

export type MaybeFindOneOperation = {
  type: "maybeFindOne";
  findByVariableName: "id";
} & AnyModelFinderRuntimeMetadata;

export type FindManyOperation = {
  type: "findMany";
} & AnyModelFinderRuntimeMetadata;

export type FindFirstOperation = {
  type: "findFirst";
} & AnyModelFinderRuntimeMetadata;

export type MaybeFindFirstOperation = {
  type: "maybeFindFirst";
} & AnyModelFinderRuntimeMetadata;

export type FindOneByFieldOperation = {
  type: "findOne";
  findByVariableName: string;
  findByField: string;
  functionName: string;
} & AnyModelFinderRuntimeMetadata;

export type MaybeFindOneByFieldOperation = {
  type: "maybeFindOne";
  findByVariableName: string;
  findByField: string;
  functionName: string;
} & AnyModelFinderRuntimeMetadata;

export type SingletonGetOperation = {
  type: "get";
} & AnyModelFinderRuntimeMetadata;

export type ActionOperation = {
  type: "action";
  functionName: string;
  isBulk: false;
  isDeleter: boolean;
} & AnyActionFunctionRuntimeMetadata;

export type BulkActionOperation = {
  type: "action";
  functionName: string;
  isBulk: true;
  singleActionFunctionName: string;
  isDeleter: boolean;
} & AnyActionFunctionRuntimeMetadata;

export type GlobalActionOperation = {
  type: "globalAction";
  functionName: string;
  operationName: string;
  operationReturnType?: string;
  namespace: string | string[] | null;
  variables: VariablesOptions;
};

export type ComputedViewOperation = {
  type: "computedView";
  operationName: string;
  functionName: string; // Same as operationName, but required by ModelManagers
  gqlFieldName: string; // The field name of the operation in GQL schema (includes model for model views)
  namespace: string | string[] | null;
  /**
   * The list of GraphQL typenames that contribute to this view's expression
   * The view should be invalidated and refreshed client side when changes are made to these typenames
   */
  referencedTypenames?: string[];
  variables?: VariablesOptions;
};

export type StubbedComputedViewOperation = {
  type: "stubbedComputedView";
  operationName: string;
  functionName: string; // Same as operationName, but required by ModelManagers
  gqlFieldName: string; // The field name of the operation in GQL schema (includes model for model views)
  namespace: string | string[] | null;
  errorMessage: string;
};

export type StubbedActionReason = "MissingApiTrigger";

export type StubbedActionOperation = {
  type: "stubbedAction";
  functionName: string;
  operationName?: string;
  errorMessage: string;
  actionApiIdentifier: string;
  modelApiIdentifier?: string;
  variables: VariablesOptions;
  reason: StubbedActionReason;
  dataPath: string;
};

export type ModelManagerOperation =
  | FindOneOperation
  | MaybeFindOneOperation
  | FindManyOperation
  | FindFirstOperation
  | MaybeFindFirstOperation
  | FindOneByFieldOperation
  | MaybeFindOneByFieldOperation
  | SingletonGetOperation
  | ActionOperation
  | BulkActionOperation
  | StubbedActionOperation
  | ComputedViewOperation
  | StubbedComputedViewOperation;

/**
 * Construct a model manager class out of the metadatas generated on the server
 **/
export const buildModelManager = (
  apiIdentifier: string,
  pluralApiIdentifier: string,
  defaultSelection: FieldSelection,
  operationGroup: ModelManagerOperation[] | readonly ModelManagerOperation[]
): AnyModelManager => {
  const modelManagerClass = class {
    constructor(public readonly connection: GadgetConnection) {}
  } as unknown as { prototype: AnyModelManager; new (connection: GadgetConnection): AnyModelManager };
  Object.defineProperty(modelManagerClass, "name", { value: `${apiIdentifier}Manager` });

  for (const operation of operationGroup) {
    switch (operation.type) {
      case "maybeFindOne":
      case "findOne": {
        const throwOnRecordNotFound = !operation.type.startsWith("maybe");

        if ("functionName" in operation) {
          (modelManagerClass.prototype as any)[operation.functionName] = Object.assign(
            function (this: AnyModelManager, value: string, options?: BaseFindOptions) {
              return findOneByFieldRunner(
                this,
                operation.operationName,
                operation.findByField,
                value,
                defaultSelection,
                apiIdentifier,

                options,
                throwOnRecordNotFound,
                operation.namespace
              );
            },
            operation as unknown as AnyModelFinderMetadata,
            {
              plan: function (fieldName: string, fieldValue: string, options?: BaseFindOptions) {
                return findOneByFieldOperation(
                  operation.operationName,
                  fieldName,
                  fieldValue,
                  defaultSelection,
                  apiIdentifier,
                  options,
                  operation.namespace
                );
              },
            }
          );
        } else {
          modelManagerClass.prototype[operation.type] = Object.assign(
            function (this: AnyModelManager, id: string, options?: BaseFindOptions) {
              const response = findOneRunner(
                this,
                apiIdentifier,
                id,
                defaultSelection,
                apiIdentifier,
                options,
                throwOnRecordNotFound,
                operation.namespace
              );
              return forEachMaybeLiveResponse(response, (record: GadgetRecord<any>) => (record.isEmpty() ? null : record));
            },
            operation as unknown as AnyModelFinderMetadata,
            {
              plan: function (value: string, options?: BaseFindOptions) {
                return findOneOperation(operation.operationName, value, defaultSelection, apiIdentifier, options, operation.namespace);
              },
            }
          );
        }
        break;
      }

      case "findMany": {
        modelManagerClass.prototype.findMany = Object.assign(
          function (this: AnyModelManager, options?: FindManyOptions) {
            return findManyRunner(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, undefined, operation.namespace);
          },
          operation as unknown as AnyModelFinderMetadata,
          {
            plan: function (options?: FindManyOptions) {
              return findManyOperation(pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
            },
          }
        );
        break;
      }
      case "maybeFindFirst":
      case "findFirst": {
        modelManagerClass.prototype[operation.type] = Object.assign(
          function (this: AnyModelManager, options?: BaseFindOptions) {
            const response = findManyRunner(
              this,
              pluralApiIdentifier,
              defaultSelection,
              apiIdentifier,
              {
                ...options,
                first: 1,
                last: undefined,
                before: undefined,
                after: undefined,
              },
              operation.type != "maybeFindFirst",
              operation.namespace
            );
            return forEachMaybeLiveResponse(response, (list: GadgetRecord<any>[]) => list?.[0] ?? null);
          },
          operation as unknown as AnyModelFinderMetadata,
          {
            plan: function (options?: BaseFindOptions) {
              return findManyOperation(
                pluralApiIdentifier,
                defaultSelection,
                apiIdentifier,
                {
                  ...options,
                  first: 1,
                  last: undefined,
                  before: undefined,
                  after: undefined,
                },
                operation.namespace
              );
            },
          }
        );
        break;
      }

      case "get": {
        (modelManagerClass.prototype as any).get = Object.assign(function (this: AnyModelManager, options?: BaseFindOptions) {
          return findOneRunner(
            this,
            operation.operationName,
            undefined,
            defaultSelection,
            apiIdentifier,
            options,
            undefined,
            operation.namespace
          );
        }, operation as unknown as AnyModelFinderMetadata);
        break;
      }
      case "action": {
        if (operation.isBulk) {
          const bulkInvokedByIDOnly = !!operation.variables["ids"];

          (modelManagerClass.prototype as any)[operation.functionName] = Object.assign(
            async function (this: AnyModelManager, inputs: string[] | Record<string, unknown>[], options?: BaseFindOptions) {
              let variables;
              if (bulkInvokedByIDOnly) {
                variables = {
                  ids: {
                    ...operation.variables["ids"],
                    value: inputs,
                  },
                };
              } else {
                variables = {
                  inputs: {
                    ...operation.variables["inputs"],
                    value: (inputs as Record<string, unknown>[]).map((input) =>
                      disambiguateActionParams((this as any)[(operation as BulkActionOperation).singleActionFunctionName], undefined, input)
                    ),
                  },
                };
              }

              return await actionRunner(
                this,
                operation.operationName,
                operation.isDeleter ? null : defaultSelection,
                apiIdentifier,
                operation.modelSelectionField,
                true,
                variables,
                options,
                operation.namespace,
                operation.hasReturnType as any
              );
            },
            operation as unknown as AnyModelFinderMetadata,
            {
              plan: function (options?: BaseFindOptions) {
                return actionOperation(
                  operation.operationName,
                  operation.isDeleter ? null : operation.defaultSelection,
                  apiIdentifier,
                  operation.modelSelectionField,
                  operation.variables,
                  options,
                  operation.namespace,
                  true,
                  operation.hasReturnType
                );
              },
              get singleAction() {
                return (modelManagerClass.prototype as any)[(operation as BulkActionOperation).singleActionFunctionName];
              },
            }
          );
        } else {
          const hasId = !!operation.variables["id"];
          const hasOthers = Object.keys(operation.variables).filter((key) => key != "id").length > 0;
          (modelManagerClass.prototype as any)[operation.functionName] = Object.assign(
            async function (this: AnyModelManager, ...args: (string | Record<string, unknown> | BaseFindOptions)[]) {
              const [variables, options] = actionArgs(operation, hasId, hasOthers, args);

              return await actionRunner(
                this,
                operation.operationName,
                operation.isDeleter ? null : defaultSelection,
                apiIdentifier,
                operation.modelSelectionField,
                false,
                variables,
                options,
                operation.namespace,
                operation.hasReturnType as any
              );
            },
            operation as unknown as AnyModelFinderMetadata,
            {
              plan: function (options?: BaseFindOptions) {
                return actionOperation(
                  operation.operationName,
                  operation.isDeleter ? null : operation.defaultSelection,
                  apiIdentifier,
                  operation.modelSelectionField,
                  operation.variables,
                  options,
                  operation.namespace,
                  false,
                  operation.hasReturnType
                );
              },
            }
          );
        }
        break;
      }
      case "stubbedAction": {
        (modelManagerClass.prototype as any)[operation.functionName] = Object.assign(function (this: AnyModelManager, ..._args: any) {
          sendDevHarnessStubbedActionEvent(operation);
          throw new Error(operation.errorMessage);
        }, operation as unknown as AnyModelFinderMetadata);
        break;
      }
      case "computedView": {
        (modelManagerClass.prototype as any)[operation.operationName] = isInlineComputedView(operation)
          ? buildInlineModelComputedView(operation)
          : buildModelComputedView(operation);
        break;
      }
      case "stubbedComputedView": {
        (modelManagerClass.prototype as any)[operation.operationName] = buildStubbedComputedView(operation);
        break;
      }
    }
  }

  return modelManagerClass as any;
};

export const buildGlobalAction = (
  client: { connection: GadgetConnection },
  operation: GlobalActionOperation | StubbedActionOperation
): AnyActionFunction => {
  if (operation.type == "stubbedAction") {
    return Object.assign((..._args: any[]) => {
      sendDevHarnessStubbedActionEvent(operation);
      throw new Error(operation.errorMessage);
    }, operation) as any;
  } else {
    return Object.assign(
      async (variables: Record<string, any> = {}) => {
        const resultVariables: VariablesOptions = {};
        for (const [name, variable] of Object.entries(operation.variables)) {
          resultVariables[name] = {
            value: variables[name],
            ...variable,
          };
        }

        return await globalActionRunner(client.connection, operation.operationName, resultVariables, operation.namespace);
      },
      operation,
      {
        plan: function (operationName: string, variables: VariablesOptions, namespace: string) {
          return globalActionOperation(operationName, variables, namespace);
        },
      }
    ) as any;
  }
};

export function buildStubbedComputedView(operation: StubbedComputedViewOperation): () => Promise<never> {
  return Object.assign(async () => {
    throw new Error(operation.errorMessage);
  }, operation);
}

export function buildComputedView<ResultT>(
  client: { connection: GadgetConnection },
  operation: ComputedViewOperation
): ComputedViewWithoutVariables<ResultT>;
export function buildComputedView<VariablesT, ResultT>(
  client: { connection: GadgetConnection },
  operation: ComputedViewOperation
): ComputedViewWithVariables<VariablesT, ResultT>;
export function buildComputedView<VariablesT, ResultT>(
  client: { connection: GadgetConnection },
  operation: ComputedViewOperation
): ComputedViewWithVariables<VariablesT, ResultT> | ComputedViewWithoutVariables<ResultT> {
  const f = operation.variables
    ? async (variables: Record<string, any> = {}) => {
        let variablesOptions: VariablesOptions | undefined;
        if (operation.variables) {
          variablesOptions = {};
          for (const [name, variable] of Object.entries(operation.variables)) {
            variablesOptions[name] = {
              value: variables[name],
              ...variable,
            };
          }
        }
        return await computedViewRunner(client.connection, operation.gqlFieldName, variablesOptions, operation.namespace);
      }
    : async () => {
        return await computedViewRunner(client.connection, operation.gqlFieldName, undefined, operation.namespace);
      };

  return Object.assign(f, operation, {
    plan: function (variables: VariablesOptions) {
      return computedViewOperation(operation.gqlFieldName, variables, operation.namespace);
    },
  }) as any;
}

export function buildModelComputedView<ResultT>(operation: ComputedViewOperation): ComputedViewWithoutVariables<ResultT>;
export function buildModelComputedView<VariablesT, ResultT>(
  operation: ComputedViewOperation
): ComputedViewWithVariables<VariablesT, ResultT>;
export function buildModelComputedView<VariablesT, ResultT>(
  operation: ComputedViewOperation
): ComputedViewWithVariables<VariablesT, ResultT> | ComputedViewWithoutVariables<ResultT> {
  const f = operation.variables
    ? async function (this: AnyModelManager, variables: Record<string, any> = {}) {
        let resultVariables: VariablesOptions | undefined;
        if (operation.variables) {
          resultVariables = {};
          for (const [name, variable] of Object.entries(operation.variables)) {
            resultVariables[name] = {
              value: variables[name],
              ...variable,
            };
          }
        }
        return await computedViewRunner(this.connection, operation.gqlFieldName, resultVariables, operation.namespace);
      }
    : async function (this: AnyModelManager) {
        return await computedViewRunner(this.connection, operation.gqlFieldName, undefined, operation.namespace);
      };

  return Object.assign(f, operation, {
    plan: function (variables: VariablesOptions) {
      return computedViewOperation(operation.gqlFieldName, variables, operation.namespace);
    },
  }) as any;
}

export function buildInlineComputedView(client: { connection: GadgetConnection }, operation: ComputedViewOperation) {
  const f = async function (query: string, variables?: Record<string, any>) {
    return await inlineComputedViewRunner(client.connection, operation.gqlFieldName, query, variables, operation.namespace);
  };
  return Object.assign(f, operation) as any;
}

export function buildInlineModelComputedView(operation: ComputedViewOperation) {
  const f = async function (this: AnyModelManager, query: string, variables?: Record<string, any>) {
    return await inlineComputedViewRunner(this.connection, operation.gqlFieldName, query, variables, operation.namespace);
  };
  return Object.assign(f, operation) as any;
}

export function isInlineComputedView(operation: ComputedViewOperation): boolean {
  return operation.functionName == "view";
}

/**
 * Maps the variables passed from a call to the client to the variables the GraphQL API is expecting
 *
 * For actions which accept a model input, the GraphQL API expects the variables to be passed like
 *  id: 123,
 *  widget: { fieldA: "a", fieldB: "b" },
 *  extraParam: "C"
 *
 * For convenience, we allow actions to be invoked like
 *   await api.widget.update("123", {fieldA: "a", fieldB: "b", extraParam: "C"})
 *
 * This function re-nests the model input variables under a key for the model's api identifier, being careful to leave root level params alone.
 **/
function disambiguateActionParams<Action extends AnyActionFunctionRuntimeMetadata>(
  action: Action,
  idValue: string | undefined,
  variables: Record<string, any> = {}
): Record<string, any> {
  if (action.hasAmbiguousIdentifier) {
    if (Object.keys(variables).some((key) => !action.paramOnlyVariables?.includes(key) && key !== action.modelApiIdentifier)) {
      throw Error(`Invalid arguments found in variables. Did you mean to use ({ ${action.modelApiIdentifier}: { ... } })?`);
    }
  }

  let newVariables: Record<string, any>;
  const idVariable = Object.entries(action.variables).find(([key, value]) => key === "id" && value.type === "GadgetID");

  if ((action as any).acceptsModelInput || action.hasCreateOrUpdateEffect) {
    if (
      (action.modelApiIdentifier in variables &&
        typeof variables[action.modelApiIdentifier] === "object" &&
        variables[action.modelApiIdentifier] !== null) ||
      !action.variables[action.modelApiIdentifier]
    ) {
      newVariables = variables;
    } else {
      newVariables = {
        [action.modelApiIdentifier]: {},
      };
      for (const [key, value] of Object.entries(variables)) {
        if (action.paramOnlyVariables?.includes(key)) {
          newVariables[key] = value;
        } else {
          if (idVariable && key === idVariable[0]) {
            newVariables["id"] = value;
          } else {
            newVariables[action.modelApiIdentifier][key] = value;
          }
        }
      }
    }
  } else {
    newVariables = variables;
  }

  newVariables["id"] ??= idValue as any;

  return newVariables;
}

/** Split out the arguments to a call to an action */
function actionArgs(
  operation: AnyActionFunctionRuntimeMetadata,
  hasId: boolean,
  hasOthers: boolean,
  args: (string | Record<string, unknown> | BaseFindOptions)[]
): [variables: VariablesOptions, options?: BaseFindOptions] {
  let id: string | undefined = undefined;
  let params: Record<string, unknown> | undefined = undefined;

  if (hasId) {
    id = args.shift() as string | undefined;
  }
  if (hasOthers) {
    params = args.shift() as Record<string, unknown> | undefined;
  }
  const options = args.shift() as BaseFindOptions;

  let unambiguousParams = params;
  if (id || params) {
    unambiguousParams = disambiguateActionParams(operation, id, params);
  }

  const resultVariables: VariablesOptions = {};
  for (const [name, variable] of Object.entries(operation.variables)) {
    resultVariables[name] = {
      value: name == "id" ? id : unambiguousParams?.[name],
      ...variable,
    };
  }

  return [resultVariables, options];
}

/** Given a result from a finder function that is either a promise for one value or an async iterator over many values, transform each value using a function, returning the same cardinality as the input */
function forEachMaybeLiveResponse<Item, Result>(response: AsyncIterable<Item>, transform: (item: Item) => Result): AsyncIterable<Result>;
function forEachMaybeLiveResponse<Item, Result>(response: Promise<Item>, transform: (item: Item) => Result): Promise<Result>;
function forEachMaybeLiveResponse<Item, Result>(
  response: AsyncIterable<Item> | Promise<Item>,
  transform: (item: Item) => Result
): AsyncIterable<Result> | Promise<Result> {
  if (Symbol.asyncIterator in response) {
    return {
      [Symbol.asyncIterator]: async function* () {
        for await (const item of response) {
          yield transform(item);
        }
      },
    };
  } else {
    return response.then(transform);
  }
}

const sendDevHarnessStubbedActionEvent = (operation: StubbedActionOperation) => {
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      const event = new CustomEvent("gadget:devharness:stubbedActionError", {
        detail: {
          reason: operation.reason,
          action: {
            functionName: operation.functionName,
            actionApiIdentifier: operation.actionApiIdentifier,
            modelApiIdentifier: operation.modelApiIdentifier,
            dataPath: operation.dataPath,
          },
        },
      });
      window.dispatchEvent(event);
    }
  } catch (error: any) {
    // gracefully handle environments where CustomEvent is misbehaved like jsdom
    console.warn("[gadget] error dispatching gadget dev harness event", error);
  }
};
