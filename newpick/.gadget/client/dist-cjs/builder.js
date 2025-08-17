"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var builder_exports = {};
__export(builder_exports, {
  buildComputedView: () => buildComputedView,
  buildGlobalAction: () => buildGlobalAction,
  buildInlineComputedView: () => buildInlineComputedView,
  buildInlineModelComputedView: () => buildInlineModelComputedView,
  buildModelComputedView: () => buildModelComputedView,
  buildModelManager: () => buildModelManager,
  buildStubbedComputedView: () => buildStubbedComputedView,
  isInlineComputedView: () => isInlineComputedView
});
module.exports = __toCommonJS(builder_exports);
var import_api_client_core = require("@gadgetinc/api-client-core");
var import_computedViews = require("./computedViews.js");
const buildModelManager = (apiIdentifier, pluralApiIdentifier, defaultSelection, operationGroup) => {
  const modelManagerClass = class {
    constructor(connection) {
      this.connection = connection;
    }
  };
  Object.defineProperty(modelManagerClass, "name", { value: `${apiIdentifier}Manager` });
  for (const operation of operationGroup) {
    switch (operation.type) {
      case "maybeFindOne":
      case "findOne": {
        const throwOnRecordNotFound = !operation.type.startsWith("maybe");
        if ("functionName" in operation) {
          modelManagerClass.prototype[operation.functionName] = Object.assign(
            function(value, options) {
              return (0, import_api_client_core.findOneByFieldRunner)(
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
            operation,
            {
              plan: function(fieldName, fieldValue, options) {
                return (0, import_api_client_core.findOneByFieldOperation)(
                  operation.operationName,
                  fieldName,
                  fieldValue,
                  defaultSelection,
                  apiIdentifier,
                  options,
                  operation.namespace
                );
              }
            }
          );
        } else {
          modelManagerClass.prototype[operation.type] = Object.assign(
            function(id, options) {
              const response = (0, import_api_client_core.findOneRunner)(
                this,
                apiIdentifier,
                id,
                defaultSelection,
                apiIdentifier,
                options,
                throwOnRecordNotFound,
                operation.namespace
              );
              return forEachMaybeLiveResponse(response, (record) => record.isEmpty() ? null : record);
            },
            operation,
            {
              plan: function(value, options) {
                return (0, import_api_client_core.findOneOperation)(operation.operationName, value, defaultSelection, apiIdentifier, options, operation.namespace);
              }
            }
          );
        }
        break;
      }
      case "findMany": {
        modelManagerClass.prototype.findMany = Object.assign(
          function(options) {
            return (0, import_api_client_core.findManyRunner)(this, pluralApiIdentifier, defaultSelection, apiIdentifier, options, void 0, operation.namespace);
          },
          operation,
          {
            plan: function(options) {
              return (0, import_api_client_core.findManyOperation)(pluralApiIdentifier, defaultSelection, apiIdentifier, options, operation.namespace);
            }
          }
        );
        break;
      }
      case "maybeFindFirst":
      case "findFirst": {
        modelManagerClass.prototype[operation.type] = Object.assign(
          function(options) {
            const response = (0, import_api_client_core.findManyRunner)(
              this,
              pluralApiIdentifier,
              defaultSelection,
              apiIdentifier,
              {
                ...options,
                first: 1,
                last: void 0,
                before: void 0,
                after: void 0
              },
              operation.type != "maybeFindFirst",
              operation.namespace
            );
            return forEachMaybeLiveResponse(response, (list) => (list == null ? void 0 : list[0]) ?? null);
          },
          operation,
          {
            plan: function(options) {
              return (0, import_api_client_core.findManyOperation)(
                pluralApiIdentifier,
                defaultSelection,
                apiIdentifier,
                {
                  ...options,
                  first: 1,
                  last: void 0,
                  before: void 0,
                  after: void 0
                },
                operation.namespace
              );
            }
          }
        );
        break;
      }
      case "get": {
        modelManagerClass.prototype.get = Object.assign(function(options) {
          return (0, import_api_client_core.findOneRunner)(
            this,
            operation.operationName,
            void 0,
            defaultSelection,
            apiIdentifier,
            options,
            void 0,
            operation.namespace
          );
        }, operation);
        break;
      }
      case "action": {
        if (operation.isBulk) {
          const bulkInvokedByIDOnly = !!operation.variables["ids"];
          modelManagerClass.prototype[operation.functionName] = Object.assign(
            async function(inputs, options) {
              let variables;
              if (bulkInvokedByIDOnly) {
                variables = {
                  ids: {
                    ...operation.variables["ids"],
                    value: inputs
                  }
                };
              } else {
                variables = {
                  inputs: {
                    ...operation.variables["inputs"],
                    value: inputs.map(
                      (input) => disambiguateActionParams(this[operation.singleActionFunctionName], void 0, input)
                    )
                  }
                };
              }
              return await (0, import_api_client_core.actionRunner)(
                this,
                operation.operationName,
                operation.isDeleter ? null : defaultSelection,
                apiIdentifier,
                operation.modelSelectionField,
                true,
                variables,
                options,
                operation.namespace,
                operation.hasReturnType
              );
            },
            operation,
            {
              plan: function(options) {
                return (0, import_api_client_core.actionOperation)(
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
                return modelManagerClass.prototype[operation.singleActionFunctionName];
              }
            }
          );
        } else {
          const hasId = !!operation.variables["id"];
          const hasOthers = Object.keys(operation.variables).filter((key) => key != "id").length > 0;
          modelManagerClass.prototype[operation.functionName] = Object.assign(
            async function(...args) {
              const [variables, options] = actionArgs(operation, hasId, hasOthers, args);
              return await (0, import_api_client_core.actionRunner)(
                this,
                operation.operationName,
                operation.isDeleter ? null : defaultSelection,
                apiIdentifier,
                operation.modelSelectionField,
                false,
                variables,
                options,
                operation.namespace,
                operation.hasReturnType
              );
            },
            operation,
            {
              plan: function(options) {
                return (0, import_api_client_core.actionOperation)(
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
              }
            }
          );
        }
        break;
      }
      case "stubbedAction": {
        modelManagerClass.prototype[operation.functionName] = Object.assign(function(..._args) {
          sendDevHarnessStubbedActionEvent(operation);
          throw new Error(operation.errorMessage);
        }, operation);
        break;
      }
      case "computedView": {
        modelManagerClass.prototype[operation.operationName] = isInlineComputedView(operation) ? buildInlineModelComputedView(operation) : buildModelComputedView(operation);
        break;
      }
      case "stubbedComputedView": {
        modelManagerClass.prototype[operation.operationName] = buildStubbedComputedView(operation);
        break;
      }
    }
  }
  return modelManagerClass;
};
const buildGlobalAction = (client, operation) => {
  if (operation.type == "stubbedAction") {
    return Object.assign((..._args) => {
      sendDevHarnessStubbedActionEvent(operation);
      throw new Error(operation.errorMessage);
    }, operation);
  } else {
    return Object.assign(
      async (variables = {}) => {
        const resultVariables = {};
        for (const [name, variable] of Object.entries(operation.variables)) {
          resultVariables[name] = {
            value: variables[name],
            ...variable
          };
        }
        return await (0, import_api_client_core.globalActionRunner)(client.connection, operation.operationName, resultVariables, operation.namespace);
      },
      operation,
      {
        plan: function(operationName, variables, namespace) {
          return (0, import_api_client_core.globalActionOperation)(operationName, variables, namespace);
        }
      }
    );
  }
};
function buildStubbedComputedView(operation) {
  return Object.assign(async () => {
    throw new Error(operation.errorMessage);
  }, operation);
}
function buildComputedView(client, operation) {
  const f = operation.variables ? async (variables = {}) => {
    let variablesOptions;
    if (operation.variables) {
      variablesOptions = {};
      for (const [name, variable] of Object.entries(operation.variables)) {
        variablesOptions[name] = {
          value: variables[name],
          ...variable
        };
      }
    }
    return await (0, import_computedViews.computedViewRunner)(client.connection, operation.gqlFieldName, variablesOptions, operation.namespace);
  } : async () => {
    return await (0, import_computedViews.computedViewRunner)(client.connection, operation.gqlFieldName, void 0, operation.namespace);
  };
  return Object.assign(f, operation, {
    plan: function(variables) {
      return (0, import_computedViews.computedViewOperation)(operation.gqlFieldName, variables, operation.namespace);
    }
  });
}
function buildModelComputedView(operation) {
  const f = operation.variables ? async function(variables = {}) {
    let resultVariables;
    if (operation.variables) {
      resultVariables = {};
      for (const [name, variable] of Object.entries(operation.variables)) {
        resultVariables[name] = {
          value: variables[name],
          ...variable
        };
      }
    }
    return await (0, import_computedViews.computedViewRunner)(this.connection, operation.gqlFieldName, resultVariables, operation.namespace);
  } : async function() {
    return await (0, import_computedViews.computedViewRunner)(this.connection, operation.gqlFieldName, void 0, operation.namespace);
  };
  return Object.assign(f, operation, {
    plan: function(variables) {
      return (0, import_computedViews.computedViewOperation)(operation.gqlFieldName, variables, operation.namespace);
    }
  });
}
function buildInlineComputedView(client, operation) {
  const f = async function(query, variables) {
    return await (0, import_computedViews.inlineComputedViewRunner)(client.connection, operation.gqlFieldName, query, variables, operation.namespace);
  };
  return Object.assign(f, operation);
}
function buildInlineModelComputedView(operation) {
  const f = async function(query, variables) {
    return await (0, import_computedViews.inlineComputedViewRunner)(this.connection, operation.gqlFieldName, query, variables, operation.namespace);
  };
  return Object.assign(f, operation);
}
function isInlineComputedView(operation) {
  return operation.functionName == "view";
}
function disambiguateActionParams(action, idValue, variables = {}) {
  var _a;
  if (action.hasAmbiguousIdentifier) {
    if (Object.keys(variables).some((key) => {
      var _a2;
      return !((_a2 = action.paramOnlyVariables) == null ? void 0 : _a2.includes(key)) && key !== action.modelApiIdentifier;
    })) {
      throw Error(`Invalid arguments found in variables. Did you mean to use ({ ${action.modelApiIdentifier}: { ... } })?`);
    }
  }
  let newVariables;
  const idVariable = Object.entries(action.variables).find(([key, value]) => key === "id" && value.type === "GadgetID");
  if (action.acceptsModelInput || action.hasCreateOrUpdateEffect) {
    if (action.modelApiIdentifier in variables && typeof variables[action.modelApiIdentifier] === "object" && variables[action.modelApiIdentifier] !== null || !action.variables[action.modelApiIdentifier]) {
      newVariables = variables;
    } else {
      newVariables = {
        [action.modelApiIdentifier]: {}
      };
      for (const [key, value] of Object.entries(variables)) {
        if ((_a = action.paramOnlyVariables) == null ? void 0 : _a.includes(key)) {
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
  newVariables["id"] ?? (newVariables["id"] = idValue);
  return newVariables;
}
function actionArgs(operation, hasId, hasOthers, args) {
  let id = void 0;
  let params = void 0;
  if (hasId) {
    id = args.shift();
  }
  if (hasOthers) {
    params = args.shift();
  }
  const options = args.shift();
  let unambiguousParams = params;
  if (id || params) {
    unambiguousParams = disambiguateActionParams(operation, id, params);
  }
  const resultVariables = {};
  for (const [name, variable] of Object.entries(operation.variables)) {
    resultVariables[name] = {
      value: name == "id" ? id : unambiguousParams == null ? void 0 : unambiguousParams[name],
      ...variable
    };
  }
  return [resultVariables, options];
}
function forEachMaybeLiveResponse(response, transform) {
  if (Symbol.asyncIterator in response) {
    return {
      [Symbol.asyncIterator]: async function* () {
        for await (const item of response) {
          yield transform(item);
        }
      }
    };
  } else {
    return response.then(transform);
  }
}
const sendDevHarnessStubbedActionEvent = (operation) => {
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      const event = new CustomEvent("gadget:devharness:stubbedActionError", {
        detail: {
          reason: operation.reason,
          action: {
            functionName: operation.functionName,
            actionApiIdentifier: operation.actionApiIdentifier,
            modelApiIdentifier: operation.modelApiIdentifier,
            dataPath: operation.dataPath
          }
        }
      });
      window.dispatchEvent(event);
    }
  } catch (error) {
    console.warn("[gadget] error dispatching gadget dev harness event", error);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildComputedView,
  buildGlobalAction,
  buildInlineComputedView,
  buildInlineModelComputedView,
  buildModelComputedView,
  buildModelManager,
  buildStubbedComputedView,
  isInlineComputedView
});
//# sourceMappingURL=builder.js.map
