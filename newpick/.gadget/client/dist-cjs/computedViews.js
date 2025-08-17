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
var computedViews_exports = {};
__export(computedViews_exports, {
  computedViewOperation: () => computedViewOperation,
  computedViewRunner: () => computedViewRunner,
  inlineComputedViewOperation: () => inlineComputedViewOperation,
  inlineComputedViewRunner: () => inlineComputedViewRunner
});
module.exports = __toCommonJS(computedViews_exports);
var import_api_client_core = require("@gadgetinc/api-client-core");
var import_tiny_graphql_query_compiler = require("tiny-graphql-query-compiler");
var import_utils = require("./utils.js");
const computedViewOperation = (gqlFieldName, variablesOptions = {}, namespace) => {
  let fields = {
    [gqlFieldName]: (0, import_tiny_graphql_query_compiler.Call)((0, import_utils.variableOptionsToVariables)(variablesOptions))
  };
  if (namespace) {
    fields = namespacify(namespace, fields);
  }
  return variablesOptions ? (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({ type: "query", name: gqlFieldName, fields }) : { query: (0, import_tiny_graphql_query_compiler.compile)({ type: "query", name: gqlFieldName, fields }), variables: {} };
};
const computedViewRunner = async (connection, gqlFieldName, variablesOptions, namespace) => {
  const { query, variables } = computedViewOperation(gqlFieldName, variablesOptions, namespace);
  const response = await connection.currentClient.query(query, variables);
  const dataPath = namespaceDataPath([gqlFieldName], namespace);
  return (0, import_api_client_core.assertOperationSuccess)(response, dataPath);
};
const inlineComputedViewOperation = (query, gqlFieldName, variables, namespace) => {
  const vars = {
    query: (0, import_tiny_graphql_query_compiler.Var)({ type: "String", value: query, required: true })
  };
  if (variables)
    vars["variables"] = (0, import_tiny_graphql_query_compiler.Var)({ type: "JSONObject", value: variables });
  let fields = {
    [gqlFieldName]: (0, import_tiny_graphql_query_compiler.Call)((0, import_utils.variableOptionsToVariables)(vars))
  };
  if (namespace)
    fields = namespacify(namespace, fields);
  return (0, import_tiny_graphql_query_compiler.compileWithVariableValues)({ type: "query", name: gqlFieldName, fields });
};
const inlineComputedViewRunner = async (connection, gqlFieldName, viewQuery, variables, namespace) => {
  const { query, variables: vars } = inlineComputedViewOperation(viewQuery, gqlFieldName, variables, namespace);
  const response = await connection.currentClient.query(query, vars);
  const dataPath = namespaceDataPath([gqlFieldName], namespace);
  return (0, import_api_client_core.assertOperationSuccess)(response, dataPath);
};
function namespacify(namespace, fields) {
  if (!namespace)
    return fields;
  if (!Array.isArray(namespace)) {
    namespace = [namespace];
  }
  if (namespace) {
    for (let i = namespace.length - 1; i >= 0; i--) {
      fields = {
        [namespace[i]]: fields
      };
    }
  }
  return fields;
}
const namespaceDataPath = (dataPath, namespace) => {
  if (namespace) {
    dataPath.unshift(...Array.isArray(namespace) ? namespace : [namespace]);
  }
  return dataPath;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  computedViewOperation,
  computedViewRunner,
  inlineComputedViewOperation,
  inlineComputedViewRunner
});
//# sourceMappingURL=computedViews.js.map
