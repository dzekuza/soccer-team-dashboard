import { Var } from "tiny-graphql-query-compiler";
const fieldSelectionToQueryCompilerFields = (selection, includeTypename = false) => {
  const output = { ...selection };
  if (includeTypename)
    output.__typename = true;
  return output;
};
const variableOptionsToVariables = (variables) => {
  return Object.fromEntries(Object.entries(variables).map(([name, options]) => [name, Var(options)]));
};
export {
  fieldSelectionToQueryCompilerFields,
  variableOptionsToVariables
};
//# sourceMappingURL=utils.js.map
