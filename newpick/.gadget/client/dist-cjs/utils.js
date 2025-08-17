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
var utils_exports = {};
__export(utils_exports, {
  fieldSelectionToQueryCompilerFields: () => fieldSelectionToQueryCompilerFields,
  variableOptionsToVariables: () => variableOptionsToVariables
});
module.exports = __toCommonJS(utils_exports);
var import_tiny_graphql_query_compiler = require("tiny-graphql-query-compiler");
const fieldSelectionToQueryCompilerFields = (selection, includeTypename = false) => {
  const output = { ...selection };
  if (includeTypename)
    output.__typename = true;
  return output;
};
const variableOptionsToVariables = (variables) => {
  return Object.fromEntries(Object.entries(variables).map(([name, options]) => [name, (0, import_tiny_graphql_query_compiler.Var)(options)]));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fieldSelectionToQueryCompilerFields,
  variableOptionsToVariables
});
//# sourceMappingURL=utils.js.map
