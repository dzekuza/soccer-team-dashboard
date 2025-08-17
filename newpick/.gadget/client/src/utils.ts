/**
 * Most of these utility types are straight duplicates or refined versions of the types with the same name from api-client-core.
 * Eventually these should probably supersede the api-client-core ones.
 */

import { type FieldSelection, type VariablesOptions } from "@gadgetinc/api-client-core";
import type { FieldSelection as BuilderFieldSelection, Variable } from "tiny-graphql-query-compiler";
import { Var } from "tiny-graphql-query-compiler";

/**
 * Allows detecting an any type, this is rather tricky:
 * The type constraint 0 extends 1 is not satisfied (0 is not assignable to 1),
 * so it should be impossible for 0 extends (1 & T) to be satisfied either, since (1 & T) should be even narrower than 1.
 * However, when T is any, it reduces 0 extends (1 & any) to 0 extends any, which is satisfied.
 * That's because any is intentionally unsound and acts as both a supertype and subtype of almost every other type.
 * source: https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360
 */

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

/**
 * Convert a schema type into the type that a selection of it must extend
 *
 * Example Schema:
 *
 * {
 *   foo: boolean;
 *   bar?: string;
 *   nested?: {
 *     count: number
 *   }
 * }
 *
 * Example available selection:
 *
 * {
 *   foo?: boolean | null | undefined;
 *   bar?: boolean | null | undefined;
 *   nested?: {
 *     count: boolean | null | undefined
 *   }
 * }
 */
export type AvailableSelection<Schema> = Schema extends Array<infer T>
  ? AvailableSelection<T>
  : Schema extends object
  ? { [key in keyof Schema]?: AvailableSelection<Schema[key]> }
  : boolean | null | undefined;

/**
 * Given an options object from a find method, default the type of the selection to a default if no selection is passed
 */
export type DefaultSelection<
  Available extends FieldSelection,
  Options extends { select?: Available | null },
  Defaults extends SomeFieldsSelected<Available>
> = IfAny<Options, Defaults, IfAny<Options["select"], Defaults, Options["select"] extends Available ? Options["select"] : Defaults>>;

/**
 * Take a FieldSelection type and construct a type with all its fields required and selected.
 */
export type AllFieldsSelected<Selection extends FieldSelection> = {
  [K in keyof Selection]-?: NonNullable<Selection[K]> extends FieldSelection ? AllFieldsSelected<NonNullable<Selection[K]>> : true;
};

/**
 * Take a FieldSelection type and construct a type with its fields set to true
 * rather than (boolean | null | undefined)
 */
export type SomeFieldsSelected<Selection extends FieldSelection> = {
  [K in keyof Selection]?: NonNullable<Selection[K]> extends FieldSelection ? SomeFieldsSelected<NonNullable<Selection[K]>> : true;
};

/**
 * Filter out any keys in `T` that are mapped to `never` recursively. Any nested objects that are empty after having never valued keys removed are also removed.
 *
 * ```typescript
 * type Thing = DeepFilterNever<
 *  { a: { b: never }, c: string }
 * >;  // { c: string; }
 * ```
 */

/**
 * Get any keys of `Selection` that are not mapped to `never`
 */
export type NonNeverKeys<Selection> = {
  [Key in keyof Selection]: Selection[Key] extends never ? never : Key;
}[keyof Selection];

/**
 * Filter out any keys in `T` that are mapped to `never`.
 */

export type FilterNever<T extends Record<string, unknown>> = NonNeverKeys<T> extends never ? never : { [Key in NonNeverKeys<T>]: T[Key] };

/**
 * Filter out any keys in `T` that are mapped to `never` recursively. Any nested objects that are empty after having never valued keys removed are also removed.
 *
 * ```typescript
 * type Thing = DeepFilterNever<
 *  { a: { b: never }, c: string }
 * >;  // { c: string; }
 * ```
 */

export type DeepFilterNever<T> = T extends Record<string, unknown>
  ? FilterNever<{
      [Key in keyof T]: T[Key] extends Record<string, unknown> ? DeepFilterNever<T[Key]> : T[Key];
    }>
  : T;
/**
 * Extract a subset of a schema given a selection
 *
 * ```typescript
 * type Selection = Select<
 *  { apple: "red", banana: "yellow", orange: "orange" },
 *  { apple: true, banana: false }
 * >;  // { apple: "red" }
 * ```
 */

type InnerSelect<Schema, Selection extends FieldSelection | null | undefined> = IfAny<
  Selection,
  never,
  Selection extends null | undefined
    ? never
    : Schema extends (infer T)[]
    ? InnerSelect<T, Selection>[]
    : Schema extends null
    ? InnerSelect<Exclude<Schema, null>, Selection> | null
    : {
        [Key in keyof Selection & keyof Schema]: Selection[Key] extends true
          ? Schema[Key]
          : Selection[Key] extends FieldSelection
          ? InnerSelect<Schema[Key], Selection[Key]>
          : never;
      }
>;

export type Select<Schema, Selection extends FieldSelection | null | undefined> = DeepFilterNever<InnerSelect<Schema, Selection>>;

/**
 * Converts Selection nested object format to the tiny-graphql-query-compiler shape
 **/
export const fieldSelectionToQueryCompilerFields = (selection: FieldSelection, includeTypename = false): BuilderFieldSelection => {
  const output: BuilderFieldSelection = { ...selection };
  if (includeTypename) output.__typename = true;
  return output;
};

export const variableOptionsToVariables = (variables: VariablesOptions): Record<string, Variable> => {
  return Object.fromEntries(Object.entries(variables).map(([name, options]) => [name, Var(options)]));
};
