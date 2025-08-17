import { assertOperationSuccess } from "@gadgetinc/api-client-core";
import { Call, compile, compileWithVariableValues, Var } from "tiny-graphql-query-compiler";
import { variableOptionsToVariables } from "./utils.js";
const computedViewOperation = (gqlFieldName, variablesOptions = {}, namespace) => {
  let fields = {
    [gqlFieldName]: Call(variableOptionsToVariables(variablesOptions))
  };
  if (namespace) {
    fields = namespacify(namespace, fields);
  }
  return variablesOptions ? compileWithVariableValues({ type: "query", name: gqlFieldName, fields }) : { query: compile({ type: "query", name: gqlFieldName, fields }), variables: {} };
};
const computedViewRunner = async (connection, gqlFieldName, variablesOptions, namespace) => {
  const { query, variables } = computedViewOperation(gqlFieldName, variablesOptions, namespace);
  const response = await connection.currentClient.query(query, variables);
  const dataPath = namespaceDataPath([gqlFieldName], namespace);
  return assertOperationSuccess(response, dataPath);
};
const inlineComputedViewOperation = (query, gqlFieldName, variables, namespace) => {
  const vars = {
    query: Var({ type: "String", value: query, required: true })
  };
  if (variables)
    vars["variables"] = Var({ type: "JSONObject", value: variables });
  let fields = {
    [gqlFieldName]: Call(variableOptionsToVariables(vars))
  };
  if (namespace)
    fields = namespacify(namespace, fields);
  return compileWithVariableValues({ type: "query", name: gqlFieldName, fields });
};
const inlineComputedViewRunner = async (connection, gqlFieldName, viewQuery, variables, namespace) => {
  const { query, variables: vars } = inlineComputedViewOperation(viewQuery, gqlFieldName, variables, namespace);
  const response = await connection.currentClient.query(query, vars);
  const dataPath = namespaceDataPath([gqlFieldName], namespace);
  return assertOperationSuccess(response, dataPath);
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
export {
  computedViewOperation,
  computedViewRunner,
  inlineComputedViewOperation,
  inlineComputedViewRunner
};
//# sourceMappingURL=computedViews.js.map
