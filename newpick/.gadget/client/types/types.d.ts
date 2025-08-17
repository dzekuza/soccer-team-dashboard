import { FieldSelection, FilterNever } from "@gadgetinc/api-client-core";
import { ComputedViewWithoutVariables, ComputedViewWithVariables, ComputedViewFunctionWithoutVariables, ComputedViewFunctionWithVariables } from "./computedViews.js";
export type JSONValue = string | number | boolean | JSONObject | JSONArray;
interface JSONObject {
    [x: string]: JSONValue;
}
interface JSONArray extends Array<JSONValue> {
}
export declare enum GadgetFieldType {
    Any = 0,
    Array = 1,
    BelongsTo = 2,
    Boolean = 3,
    Code = 4,
    Color = 5,
    Computed = 6,
    DateTime = 7,
    Email = 8,
    EncryptedString = 9,
    Enum = 10,
    File = 11,
    HasMany = 12,
    HasManyThrough = 13,
    HasOne = 14,
    ID = 15,
    JSON = 16,
    Money = 17,
    Null = 18,
    Number = 19,
    Object = 20,
    Password = 21,
    RecordState = 22,
    RichText = 23,
    RoleAssignments = 24,
    String = 25,
    URL = 26,
    Vector = 27
}
export declare enum BackgroundActionPriority {
    DEFAULT = 0,
    HIGH = 1,
    LOW = 2,
    PLATFORM = 3
}
export declare enum BackgroundActionOutcome {
    failed = 0,
    completed = 1
}
export type GadgetFieldValidationUnion = AvailableGadgetRegexFieldValidationSelection | AvailableGadgetRangeFieldValidationSelection | AvailableGadgetOnlyImageFileFieldValidationSelection | AvailableGadgetGenericFieldValidationSelection;
export type AvailableGadgetFieldValidationUnionSelection = GadgetRegexFieldValidation | GadgetRangeFieldValidation | GadgetOnlyImageFileFieldValidation | GadgetGenericFieldValidation;
export type BackgroundActionResult = AvailableInstallWebPixelResultSelection;
export type AvailableBackgroundActionResultSelection = InstallWebPixelResult;
export type EnqueueBackgroundActionOptions = {
    /** A fixed ID to assign to this background action. If not passed, a random ID will be generated and assigned. */
    id?: (Scalars['String'] | null) | null;
    /** The priority for executing this action. */
    priority?: BackgroundActionPriority | null;
    /** Group actions into the same queue and limit the concurrency they can run with. */
    queue?: BackgroundActionQueue | null;
    /** Options governing if and how this action will be retried if it fails. */
    retries?: BackgroundActionRetryPolicy | null;
    /** Actions won't be started until after this time. */
    startAt?: Date | Scalars['ISO8601DateString'] | null;
};
export type BackgroundActionQueue = {
    /** The identifier for this queue. */
    name: (Scalars['String'] | null);
    /** The maximum number of actions that will be run at the same time. Defaults to 1 if not passed (only one job per key at once). */
    maxConcurrency?: (Scalars['Int'] | null) | null;
};
export type BackgroundActionRetryPolicy = {
    /** The number of repeat attempts to make if the initial attempt fails. Defaults to 10. Note: the total number of attempts will be this number plus one -- this counts the number of retries *after* the first attempt. */
    retryCount?: (Scalars['Int'] | null) | null;
    /** How long to delay the first retry attempt, in milliseconds. Default is 1000. */
    initialInterval?: (Scalars['Int'] | null) | null;
    /** The maximum amount of time to delay a retry while exponentially backing off in milliseconds. Default is not set, so the retry can backoff indefinitely */
    maxInterval?: (Scalars['Int'] | null) | null;
    /** The exponential backoff factor to use for calculating the retry delay for successive retries. Set this higher to grow the delay faster with each retry attempt. Default is 2. */
    backoffFactor?: (Scalars['Int'] | null) | null;
    /** If true, the retry interval will be randomized by a small amount to avoid all retries happening at the same time. Default is false. */
    randomizeInterval?: (Scalars['Boolean'] | null) | null;
};
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
    /** Represents an amount of some currency. Specified as a string so user's aren't tempted to do math on the value. */
    CurrencyAmount: string;
    /** Represents a UTC date formatted an ISO-8601 formatted 'full-date' string. */
    ISO8601DateString: string;
    /** A file object produced by a browser for uploading to cloud storage */
    Upload: File;
    /** A record's current state for a recordState type field */
    StateValue: Record<string, string>;
    /** The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
    String: string;
    /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
    JSONObject: JSONObject;
    /** The `Boolean` scalar type represents `true` or `false`. */
    Boolean: boolean;
    /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
    JSON: JSONValue;
    /** Integer type that can handle bigints and Big numbers */
    Int: number;
    /** The ID of a record in Gadget */
    GadgetID: string;
    /** Instructions for a client to turn raw transport types (like strings) into useful client side types (like Dates). Unstable and not intended for developer use. */
    HydrationPlan: unknown;
    /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
    DateTime: Date;
}
/** This Error object is returned for errors which don't have other specific handling. It has a message which is safe to display to users, but is often technical in nature. It also has a `code` field which is documented in the Gadget API Error Codes docs. */
export interface SimpleError extends ExecutionError {
    __typename: 'SimpleError';
    /** The human facing error message for this error. */
    message: Scalars['String'];
    /** The Gadget platform error code for this error. */
    code: Scalars['String'];
    /** The stack for any exception that caused the error */
    stack: (Scalars['String'] | null);
}
export type AvailableSimpleErrorSelection = {
    __typename?: boolean | null | undefined;
    /** The human facing error message for this error. */
    message?: boolean | null | undefined;
    /** The Gadget platform error code for this error. */
    code?: boolean | null | undefined;
    /** The stack for any exception that caused the error */
    stack?: boolean | null | undefined;
};
export type ExecutionError = {
    __typename: 'SimpleError' | 'InvalidRecordError';
    /** The human facing error message for this error. */
    message: Scalars['String'];
    /** The Gadget platform error code for this error. */
    code: Scalars['String'];
    /** The stack for any exception that caused the error. Only available for super users. */
    stack: (Scalars['String'] | null);
};
export type AvailableExecutionErrorSelection = {
    __typename?: boolean | null | undefined;
    /** The human facing error message for this error. */
    message?: boolean | null | undefined;
    /** The Gadget platform error code for this error. */
    code?: boolean | null | undefined;
    /** The stack for any exception that caused the error. Only available for super users. */
    stack?: boolean | null | undefined;
};
/** This object is returned as an error when a record doesn't pass the defined validations on the model. The validation messages for each of the invalid fields are available via the other fields on this error type. */
export interface InvalidRecordError extends ExecutionError {
    __typename: 'InvalidRecordError';
    /** The human facing error message for this error. */
    message: Scalars['String'];
    /** The Gadget platform error code for this InvalidRecordError. */
    code: Scalars['String'];
    /** The stack for any exception that caused the error */
    stack: (Scalars['String'] | null);
    /** An object mapping field apiIdentifiers to arrays of validation error message strings for that field, as a JSON object. The object may have keys that don't correspond exactly to field apiIdentifiers if added by validations, and the object may have missing keys if no errors were encountered for that field. */
    validationErrorsByField: (Scalars['JSONObject'] | null);
    /** A list of InvalidFieldError objects describing each of the errors encountered on the invalid record. */
    validationErrors: InvalidFieldError[];
    /** The record which failed validation, if available. Returns all the owned fields of the record -- no sub-selections are required or possible. Only available for super users. */
    record: (Scalars['JSONObject'] | null);
    /** The model of the record which failed validation */
    model: (GadgetModel | null);
}
export type AvailableInvalidRecordErrorSelection = {
    __typename?: boolean | null | undefined;
    /** The human facing error message for this error. */
    message?: boolean | null | undefined;
    /** The Gadget platform error code for this InvalidRecordError. */
    code?: boolean | null | undefined;
    /** The stack for any exception that caused the error */
    stack?: boolean | null | undefined;
    /** An object mapping field apiIdentifiers to arrays of validation error message strings for that field, as a JSON object. The object may have keys that don't correspond exactly to field apiIdentifiers if added by validations, and the object may have missing keys if no errors were encountered for that field. */
    validationErrorsByField?: boolean | null | undefined;
    /** A list of InvalidFieldError objects describing each of the errors encountered on the invalid record. */
    validationErrors?: AvailableInvalidFieldErrorSelection;
    /** The record which failed validation, if available. Returns all the owned fields of the record -- no sub-selections are required or possible. Only available for super users. */
    record?: boolean | null | undefined;
    /** The model of the record which failed validation */
    model?: AvailableGadgetModelSelection;
};
/** This Error object represents one individual failed validation for a record field. It has a message which is appropriate for display to a user, and lists the apiIdentifier of the field in question. The `apiIdentifier` for the field is not guaranteed to exist on the model. */
export type InvalidFieldError = {
    __typename: 'InvalidFieldError';
    /** The human facing error message for this error. */
    message: Scalars['String'];
    /** The apiIdentifier of the field this error occurred on. */
    apiIdentifier: Scalars['String'];
};
export type AvailableInvalidFieldErrorSelection = {
    __typename?: boolean | null | undefined;
    /** The human facing error message for this error. */
    message?: boolean | null | undefined;
    /** The apiIdentifier of the field this error occurred on. */
    apiIdentifier?: boolean | null | undefined;
};
export type GadgetModel = {
    __typename: 'GadgetModel';
    key: Scalars['String'];
    name: Scalars['String'];
    apiIdentifier: Scalars['String'];
    namespace: Scalars['String'][];
    filterable: Scalars['Boolean'];
    sortable: Scalars['Boolean'];
    searchable: Scalars['Boolean'];
    defaultDisplayField: GadgetModelField;
    fields: GadgetModelField[];
    actions: GadgetAction[];
    action: (GadgetAction | null);
    views: GadgetComputedView[];
    view: (GadgetComputedView | null);
    hasViews: Scalars['Boolean'];
    pluralName: Scalars['String'];
    pluralApiIdentifier: Scalars['String'];
    currentSingletonApiIdentifier: (Scalars['String'] | null);
    defaultRecord: Scalars['JSON'];
    initialCreatedState: (Scalars['String'] | null);
};
export type AvailableGadgetModelSelection = {
    __typename?: boolean | null | undefined;
    key?: boolean | null | undefined;
    name?: boolean | null | undefined;
    apiIdentifier?: boolean | null | undefined;
    namespace?: boolean | null | undefined;
    filterable?: boolean | null | undefined;
    sortable?: boolean | null | undefined;
    searchable?: boolean | null | undefined;
    defaultDisplayField?: AvailableGadgetModelFieldSelection;
    fields?: AvailableGadgetModelFieldSelection;
    actions?: AvailableGadgetActionSelection;
    action?: AvailableGadgetActionSelection;
    views?: AvailableGadgetComputedViewSelection;
    view?: AvailableGadgetComputedViewSelection;
    hasViews?: boolean | null | undefined;
    pluralName?: boolean | null | undefined;
    pluralApiIdentifier?: boolean | null | undefined;
    currentSingletonApiIdentifier?: boolean | null | undefined;
    defaultRecord?: boolean | null | undefined;
    initialCreatedState?: boolean | null | undefined;
};
/** One field of a Gadget model */
export interface GadgetModelField extends GadgetField {
    __typename: 'GadgetModelField';
    name: Scalars['String'];
    apiIdentifier: Scalars['String'];
    fieldType: GadgetFieldType;
    hasDefault: Scalars['Boolean'];
    required: Scalars['Boolean'];
    requiredArgumentForInput: Scalars['Boolean'];
    configuration: GadgetFieldConfigInterface;
    isUniqueField: Scalars['Boolean'];
    sortable: Scalars['Boolean'];
    filterable: Scalars['Boolean'];
    examples: GadgetModelFieldExamples;
}
export type AvailableGadgetModelFieldSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    apiIdentifier?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    hasDefault?: boolean | null | undefined;
    required?: boolean | null | undefined;
    requiredArgumentForInput?: boolean | null | undefined;
    configuration?: AvailableGadgetFieldConfigInterfaceSelection;
    isUniqueField?: boolean | null | undefined;
    sortable?: boolean | null | undefined;
    filterable?: boolean | null | undefined;
    examples?: AvailableGadgetModelFieldExamplesSelection;
};
export type GadgetField = {
    __typename: 'GadgetModelField' | 'GadgetObjectField';
    name: Scalars['String'];
    apiIdentifier: Scalars['String'];
    fieldType: GadgetFieldType;
    hasDefault: Scalars['Boolean'];
    required: Scalars['Boolean'];
    requiredArgumentForInput: Scalars['Boolean'];
    configuration: GadgetFieldConfigInterface;
};
export type AvailableGadgetFieldSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    apiIdentifier?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    hasDefault?: boolean | null | undefined;
    required?: boolean | null | undefined;
    requiredArgumentForInput?: boolean | null | undefined;
    configuration?: AvailableGadgetFieldConfigInterfaceSelection;
};
/** The common bits that all field configuration types share */
export type GadgetFieldConfigInterface = {
    __typename: 'GadgetGenericFieldConfig' | 'GadgetObjectFieldConfig' | 'GadgetBelongsToConfig' | 'GadgetHasOneConfig' | 'GadgetHasManyConfig' | 'GadgetHasManyThroughConfig' | 'GadgetEnumConfig' | 'GadgetDateTimeConfig' | 'GadgetNumberConfig';
    fieldType: GadgetFieldType;
    validations: (GadgetFieldValidationUnion | null)[];
};
export type AvailableGadgetFieldConfigInterfaceSelection = {
    __typename?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    validations?: AvailableGadgetFieldValidationUnionSelection;
};
export type GadgetModelFieldExamples = {
    __typename: 'GadgetModelFieldExamples';
    linkExistingChild: (GadgetFieldUsageExample | null);
    linkNewChild: (GadgetFieldUsageExample | null);
    linkToExistingParent: (GadgetFieldUsageExample | null);
    createNestedInParent: (GadgetFieldUsageExample | null);
};
export type AvailableGadgetModelFieldExamplesSelection = {
    __typename?: boolean | null | undefined;
    linkExistingChild?: AvailableGadgetFieldUsageExampleSelection;
    linkNewChild?: AvailableGadgetFieldUsageExampleSelection;
    linkToExistingParent?: AvailableGadgetFieldUsageExampleSelection;
    createNestedInParent?: AvailableGadgetFieldUsageExampleSelection;
};
export type GadgetFieldUsageExample = {
    __typename: 'GadgetFieldUsageExample';
    exampleGraphQLMutation: Scalars['String'];
    exampleGraphQLVariables: Scalars['JSON'];
    exampleImperativeInvocation: Scalars['String'];
    exampleReactHook: Scalars['String'];
};
export type AvailableGadgetFieldUsageExampleSelection = {
    __typename?: boolean | null | undefined;
    exampleGraphQLMutation?: boolean | null | undefined;
    exampleGraphQLVariables?: boolean | null | undefined;
    exampleImperativeInvocation?: boolean | null | undefined;
    exampleReactHook?: boolean | null | undefined;
};
export type GadgetAction = {
    __typename: 'GadgetAction';
    name: Scalars['String'];
    apiIdentifier: Scalars['String'];
    namespace: Scalars['String'][];
    requiresInput: Scalars['Boolean'];
    acceptsInput: Scalars['Boolean'];
    /** @deprecated This field will be removed. Use `isDeleteAction` instead. */
    hasDeleteRecordEffect: Scalars['Boolean'];
    /** @deprecated This field will be removed. Use `isCreateOrUpdateAction` instead. */
    hasCreateOrUpdateEffect: Scalars['Boolean'];
    isDeleteAction: Scalars['Boolean'];
    isCreateOrUpdateAction: Scalars['Boolean'];
    isUpsertMetaAction: Scalars['Boolean'];
    operatesWithRecordIdentity: Scalars['Boolean'];
    /** @deprecated This field will be removed. */
    possibleTransitions: Scalars['JSONObject'];
    availableInBulk: Scalars['Boolean'];
    bulkApiIdentifier: (Scalars['String'] | null);
    hasAmbiguousIdentifier: Scalars['Boolean'];
    inputFields: GadgetObjectField[];
    bulkInvokedByIDOnly: Scalars['Boolean'];
    triggers: GadgetTrigger[];
    examples: (GadgetActionGraphQLType | null);
};
export type AvailableGadgetActionSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    apiIdentifier?: boolean | null | undefined;
    namespace?: boolean | null | undefined;
    requiresInput?: boolean | null | undefined;
    acceptsInput?: boolean | null | undefined;
    /** @deprecated This field will be removed. Use `isDeleteAction` instead. */
    hasDeleteRecordEffect?: boolean | null | undefined;
    /** @deprecated This field will be removed. Use `isCreateOrUpdateAction` instead. */
    hasCreateOrUpdateEffect?: boolean | null | undefined;
    isDeleteAction?: boolean | null | undefined;
    isCreateOrUpdateAction?: boolean | null | undefined;
    isUpsertMetaAction?: boolean | null | undefined;
    operatesWithRecordIdentity?: boolean | null | undefined;
    /** @deprecated This field will be removed. */
    possibleTransitions?: boolean | null | undefined;
    availableInBulk?: boolean | null | undefined;
    bulkApiIdentifier?: boolean | null | undefined;
    hasAmbiguousIdentifier?: boolean | null | undefined;
    inputFields?: AvailableGadgetObjectFieldSelection;
    bulkInvokedByIDOnly?: boolean | null | undefined;
    triggers?: AvailableGadgetTriggerSelection;
    examples?: AvailableGadgetActionGraphQLTypeSelection;
};
/** One field of an action input or other transitory object in Gadget */
export interface GadgetObjectField extends GadgetField {
    __typename: 'GadgetObjectField';
    name: Scalars['String'];
    apiIdentifier: Scalars['String'];
    fieldType: GadgetFieldType;
    hasDefault: Scalars['Boolean'];
    required: Scalars['Boolean'];
    requiredArgumentForInput: Scalars['Boolean'];
    configuration: GadgetFieldConfigInterface;
}
export type AvailableGadgetObjectFieldSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    apiIdentifier?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    hasDefault?: boolean | null | undefined;
    required?: boolean | null | undefined;
    requiredArgumentForInput?: boolean | null | undefined;
    configuration?: AvailableGadgetFieldConfigInterfaceSelection;
};
export type GadgetTrigger = {
    __typename: 'GadgetTrigger';
    specID: Scalars['String'];
};
export type AvailableGadgetTriggerSelection = {
    __typename?: boolean | null | undefined;
    specID?: boolean | null | undefined;
};
export type GadgetActionGraphQLType = {
    __typename: 'GadgetActionGraphQLType';
    /** @deprecated moved to exampleGraphQLMutation */
    exampleMutation: Scalars['String'];
    exampleGraphQLMutation: Scalars['String'];
    inputGraphQLTypeSDL: (Scalars['String'] | null);
    outputGraphQLTypeSDL: Scalars['String'];
    inputTypeScriptInterface: (Scalars['String'] | null);
    outputTypeScriptInterface: Scalars['String'];
    exampleGraphQLVariables: Scalars['JSON'];
    exampleJSInputs: Scalars['JSON'];
    exampleImperativeInvocation: Scalars['String'];
    exampleReactHook: Scalars['String'];
    /** @deprecated moved to exampleBulkGraphQLMutation */
    exampleBulkMutation: (Scalars['String'] | null);
    exampleBulkGraphQLMutation: (Scalars['String'] | null);
    exampleBulkGraphQLVariables: (Scalars['JSON'] | null);
    exampleBulkImperativeInvocation: (Scalars['String'] | null);
    exampleBulkReactHook: (Scalars['String'] | null);
    bulkOutputGraphQLTypeSDL: (Scalars['String'] | null);
};
export type AvailableGadgetActionGraphQLTypeSelection = {
    __typename?: boolean | null | undefined;
    /** @deprecated moved to exampleGraphQLMutation */
    exampleMutation?: boolean | null | undefined;
    exampleGraphQLMutation?: boolean | null | undefined;
    inputGraphQLTypeSDL?: boolean | null | undefined;
    outputGraphQLTypeSDL?: boolean | null | undefined;
    inputTypeScriptInterface?: boolean | null | undefined;
    outputTypeScriptInterface?: boolean | null | undefined;
    exampleGraphQLVariables?: boolean | null | undefined;
    exampleJSInputs?: boolean | null | undefined;
    exampleImperativeInvocation?: boolean | null | undefined;
    exampleReactHook?: boolean | null | undefined;
    /** @deprecated moved to exampleBulkGraphQLMutation */
    exampleBulkMutation?: boolean | null | undefined;
    exampleBulkGraphQLMutation?: boolean | null | undefined;
    exampleBulkGraphQLVariables?: boolean | null | undefined;
    exampleBulkImperativeInvocation?: boolean | null | undefined;
    exampleBulkReactHook?: boolean | null | undefined;
    bulkOutputGraphQLTypeSDL?: boolean | null | undefined;
};
export type GadgetComputedView = {
    __typename: 'GadgetComputedView';
    name: Scalars['String'];
    apiIdentifier: Scalars['String'];
    namespace: Scalars['String'][];
    namespacedApiIdentifier: Scalars['String'];
    examples: (GadgetComputedViewExamples | null);
};
export type AvailableGadgetComputedViewSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    apiIdentifier?: boolean | null | undefined;
    namespace?: boolean | null | undefined;
    namespacedApiIdentifier?: boolean | null | undefined;
    examples?: AvailableGadgetComputedViewExamplesSelection;
};
export type GadgetComputedViewExamples = {
    __typename: 'GadgetComputedViewExamples';
    acceptsInput: Scalars['Boolean'];
    inputTypescriptType: (Scalars['String'] | null);
    outputTypescriptType: Scalars['String'];
    inputGraphQLTypeSDL: (Scalars['String'] | null);
    exampleJSInputs: Scalars['JSON'];
    exampleImperativeInvocation: (Scalars['String'] | null);
    exampleReactHook: Scalars['String'];
};
export type AvailableGadgetComputedViewExamplesSelection = {
    __typename?: boolean | null | undefined;
    acceptsInput?: boolean | null | undefined;
    inputTypescriptType?: boolean | null | undefined;
    outputTypescriptType?: boolean | null | undefined;
    inputGraphQLTypeSDL?: boolean | null | undefined;
    exampleJSInputs?: boolean | null | undefined;
    exampleImperativeInvocation?: boolean | null | undefined;
    exampleReactHook?: boolean | null | undefined;
};
export interface GadgetGenericFieldConfig extends GadgetFieldConfigInterface {
    __typename: 'GadgetGenericFieldConfig';
    fieldType: GadgetFieldType;
    validations: (GadgetFieldValidationUnion | null)[];
}
export type AvailableGadgetGenericFieldConfigSelection = {
    __typename?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    validations?: AvailableGadgetFieldValidationUnionSelection;
};
export interface GadgetObjectFieldConfig extends GadgetFieldConfigInterface {
    __typename: 'GadgetObjectFieldConfig';
    fieldType: GadgetFieldType;
    validations: (GadgetFieldValidationUnion | null)[];
    name: (Scalars['String'] | null);
    fields: GadgetModelField[];
}
export type AvailableGadgetObjectFieldConfigSelection = {
    __typename?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    validations?: AvailableGadgetFieldValidationUnionSelection;
    name?: boolean | null | undefined;
    fields?: AvailableGadgetModelFieldSelection;
};
export interface GadgetBelongsToConfig extends GadgetFieldConfigInterface {
    __typename: 'GadgetBelongsToConfig';
    fieldType: GadgetFieldType;
    validations: (GadgetFieldValidationUnion | null)[];
    relatedModelKey: (Scalars['String'] | null);
    relatedModel: (GadgetModel | null);
    isConfigured: Scalars['Boolean'];
    isInverseConfigured: Scalars['Boolean'];
}
export type AvailableGadgetBelongsToConfigSelection = {
    __typename?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    validations?: AvailableGadgetFieldValidationUnionSelection;
    relatedModelKey?: boolean | null | undefined;
    relatedModel?: AvailableGadgetModelSelection;
    isConfigured?: boolean | null | undefined;
    isInverseConfigured?: boolean | null | undefined;
};
export interface GadgetHasOneConfig extends GadgetFieldConfigInterface {
    __typename: 'GadgetHasOneConfig';
    fieldType: GadgetFieldType;
    validations: (GadgetFieldValidationUnion | null)[];
    relatedModelKey: (Scalars['String'] | null);
    relatedModel: (GadgetModel | null);
    inverseField: (GadgetModelField | null);
    isConfigured: Scalars['Boolean'];
    isInverseConfigured: Scalars['Boolean'];
}
export type AvailableGadgetHasOneConfigSelection = {
    __typename?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    validations?: AvailableGadgetFieldValidationUnionSelection;
    relatedModelKey?: boolean | null | undefined;
    relatedModel?: AvailableGadgetModelSelection;
    inverseField?: AvailableGadgetModelFieldSelection;
    isConfigured?: boolean | null | undefined;
    isInverseConfigured?: boolean | null | undefined;
};
export interface GadgetHasManyConfig extends GadgetFieldConfigInterface {
    __typename: 'GadgetHasManyConfig';
    fieldType: GadgetFieldType;
    validations: (GadgetFieldValidationUnion | null)[];
    relatedModelKey: (Scalars['String'] | null);
    relatedModel: (GadgetModel | null);
    inverseField: (GadgetModelField | null);
    isConfigured: Scalars['Boolean'];
    isInverseConfigured: Scalars['Boolean'];
    isJoinModelHasManyField: Scalars['Boolean'];
}
export type AvailableGadgetHasManyConfigSelection = {
    __typename?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    validations?: AvailableGadgetFieldValidationUnionSelection;
    relatedModelKey?: boolean | null | undefined;
    relatedModel?: AvailableGadgetModelSelection;
    inverseField?: AvailableGadgetModelFieldSelection;
    isConfigured?: boolean | null | undefined;
    isInverseConfigured?: boolean | null | undefined;
    isJoinModelHasManyField?: boolean | null | undefined;
};
export interface GadgetHasManyThroughConfig extends GadgetFieldConfigInterface {
    __typename: 'GadgetHasManyThroughConfig';
    fieldType: GadgetFieldType;
    validations: (GadgetFieldValidationUnion | null)[];
    relatedModelKey: (Scalars['String'] | null);
    relatedModel: (GadgetModel | null);
    inverseField: (GadgetModelField | null);
    joinModelKey: (Scalars['String'] | null);
    joinModel: (GadgetModel | null);
    inverseJoinModelField: (GadgetModelField | null);
    inverseRelatedModelField: (GadgetModelField | null);
    isConfigured: Scalars['Boolean'];
    isInverseConfigured: Scalars['Boolean'];
    joinModelHasManyFieldApiIdentifier: (Scalars['String'] | null);
}
export type AvailableGadgetHasManyThroughConfigSelection = {
    __typename?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    validations?: AvailableGadgetFieldValidationUnionSelection;
    relatedModelKey?: boolean | null | undefined;
    relatedModel?: AvailableGadgetModelSelection;
    inverseField?: AvailableGadgetModelFieldSelection;
    joinModelKey?: boolean | null | undefined;
    joinModel?: AvailableGadgetModelSelection;
    inverseJoinModelField?: AvailableGadgetModelFieldSelection;
    inverseRelatedModelField?: AvailableGadgetModelFieldSelection;
    isConfigured?: boolean | null | undefined;
    isInverseConfigured?: boolean | null | undefined;
    joinModelHasManyFieldApiIdentifier?: boolean | null | undefined;
};
export interface GadgetEnumConfig extends GadgetFieldConfigInterface {
    __typename: 'GadgetEnumConfig';
    fieldType: GadgetFieldType;
    validations: (GadgetFieldValidationUnion | null)[];
    allowMultiple: Scalars['Boolean'];
    allowOther: Scalars['Boolean'];
    options: GadgetEnumOption[];
}
export type AvailableGadgetEnumConfigSelection = {
    __typename?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    validations?: AvailableGadgetFieldValidationUnionSelection;
    allowMultiple?: boolean | null | undefined;
    allowOther?: boolean | null | undefined;
    options?: AvailableGadgetEnumOptionSelection;
};
export type GadgetEnumOption = {
    __typename: 'GadgetEnumOption';
    name: Scalars['String'];
    color: Scalars['String'];
};
export type AvailableGadgetEnumOptionSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    color?: boolean | null | undefined;
};
export interface GadgetDateTimeConfig extends GadgetFieldConfigInterface {
    __typename: 'GadgetDateTimeConfig';
    fieldType: GadgetFieldType;
    validations: (GadgetFieldValidationUnion | null)[];
    includeTime: Scalars['Boolean'];
}
export type AvailableGadgetDateTimeConfigSelection = {
    __typename?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    validations?: AvailableGadgetFieldValidationUnionSelection;
    includeTime?: boolean | null | undefined;
};
export interface GadgetNumberConfig extends GadgetFieldConfigInterface {
    __typename: 'GadgetNumberConfig';
    fieldType: GadgetFieldType;
    validations: (GadgetFieldValidationUnion | null)[];
    decimals: (Scalars['Int'] | null);
}
export type AvailableGadgetNumberConfigSelection = {
    __typename?: boolean | null | undefined;
    fieldType?: boolean | null | undefined;
    validations?: AvailableGadgetFieldValidationUnionSelection;
    decimals?: boolean | null | undefined;
};
export interface GadgetRegexFieldValidation extends GadgetFieldValidationInterface {
    __typename: 'GadgetRegexFieldValidation';
    name: Scalars['String'];
    specID: Scalars['String'];
    pattern: (Scalars['String'] | null);
}
export type AvailableGadgetRegexFieldValidationSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    specID?: boolean | null | undefined;
    pattern?: boolean | null | undefined;
};
/** The common bits that all field validation types share */
export type GadgetFieldValidationInterface = {
    __typename: 'GadgetRegexFieldValidation' | 'GadgetRangeFieldValidation' | 'GadgetOnlyImageFileFieldValidation' | 'GadgetGenericFieldValidation';
    name: Scalars['String'];
    specID: Scalars['String'];
};
export type AvailableGadgetFieldValidationInterfaceSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    specID?: boolean | null | undefined;
};
export interface GadgetRangeFieldValidation extends GadgetFieldValidationInterface {
    __typename: 'GadgetRangeFieldValidation';
    name: Scalars['String'];
    specID: Scalars['String'];
    min: (Scalars['Int'] | null);
    max: (Scalars['Int'] | null);
}
export type AvailableGadgetRangeFieldValidationSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    specID?: boolean | null | undefined;
    min?: boolean | null | undefined;
    max?: boolean | null | undefined;
};
export interface GadgetOnlyImageFileFieldValidation extends GadgetFieldValidationInterface {
    __typename: 'GadgetOnlyImageFileFieldValidation';
    name: Scalars['String'];
    specID: Scalars['String'];
    allowAnimatedImages: Scalars['Boolean'];
}
export type AvailableGadgetOnlyImageFileFieldValidationSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    specID?: boolean | null | undefined;
    allowAnimatedImages?: boolean | null | undefined;
};
export interface GadgetGenericFieldValidation extends GadgetFieldValidationInterface {
    __typename: 'GadgetGenericFieldValidation';
    name: Scalars['String'];
    specID: Scalars['String'];
}
export type AvailableGadgetGenericFieldValidationSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    specID?: boolean | null | undefined;
};
export type Query = {
    __typename: 'Query';
    gellyView: (Scalars['JSON'] | null);
    shopifyConnection: Shopify;
    internal: InternalQueries;
};
export type AvailableQuerySelection = {
    __typename?: boolean | null | undefined;
    gellyView?: boolean | null | undefined;
    shopifyConnection?: AvailableShopifySelection;
    internal?: AvailableInternalQueriesSelection;
};
/** Represents one of the roles an identity in the system can be entitled to */
export type GadgetRole = {
    __typename: 'GadgetRole';
    key: Scalars['String'];
    name: Scalars['String'];
    selectable: Scalars['Boolean'];
    order: Scalars['Int'];
};
export type AvailableGadgetRoleSelection = {
    __typename?: boolean | null | undefined;
    key?: boolean | null | undefined;
    name?: boolean | null | undefined;
    selectable?: boolean | null | undefined;
    order?: boolean | null | undefined;
};
export type GadgetGlobalAction = {
    __typename: 'GadgetGlobalAction';
    name: Scalars['String'];
    apiIdentifier: Scalars['String'];
    namespace: Scalars['String'][];
    requiresInput: Scalars['Boolean'];
    acceptsInput: Scalars['Boolean'];
    triggers: GadgetTrigger[];
    inputFields: GadgetObjectField[];
    examples: (GadgetGlobalActionGraphQLType | null);
};
export type AvailableGadgetGlobalActionSelection = {
    __typename?: boolean | null | undefined;
    name?: boolean | null | undefined;
    apiIdentifier?: boolean | null | undefined;
    namespace?: boolean | null | undefined;
    requiresInput?: boolean | null | undefined;
    acceptsInput?: boolean | null | undefined;
    triggers?: AvailableGadgetTriggerSelection;
    inputFields?: AvailableGadgetObjectFieldSelection;
    examples?: AvailableGadgetGlobalActionGraphQLTypeSelection;
};
export type GadgetGlobalActionGraphQLType = {
    __typename: 'GadgetGlobalActionGraphQLType';
    /** @deprecated moved to exampleGraphQLMutation */
    exampleMutation: Scalars['String'];
    exampleGraphQLMutation: Scalars['String'];
    inputGraphQLTypeSDL: (Scalars['String'] | null);
    outputGraphQLTypeSDL: Scalars['String'];
    inputTypeScriptInterface: (Scalars['String'] | null);
    outputTypeScriptInterface: Scalars['String'];
    exampleGraphQLVariables: Scalars['JSON'];
    exampleJSInputs: Scalars['JSON'];
    exampleImperativeInvocation: Scalars['String'];
    exampleReactHook: Scalars['String'];
};
export type AvailableGadgetGlobalActionGraphQLTypeSelection = {
    __typename?: boolean | null | undefined;
    /** @deprecated moved to exampleGraphQLMutation */
    exampleMutation?: boolean | null | undefined;
    exampleGraphQLMutation?: boolean | null | undefined;
    inputGraphQLTypeSDL?: boolean | null | undefined;
    outputGraphQLTypeSDL?: boolean | null | undefined;
    inputTypeScriptInterface?: boolean | null | undefined;
    outputTypeScriptInterface?: boolean | null | undefined;
    exampleGraphQLVariables?: boolean | null | undefined;
    exampleJSInputs?: boolean | null | undefined;
    exampleImperativeInvocation?: boolean | null | undefined;
    exampleReactHook?: boolean | null | undefined;
};
/** One upload target to use for the Direct Upload style of sending files to Gadget */
export type DirectUploadToken = {
    __typename: 'DirectUploadToken';
    /** The URL to upload a file to. */
    url: Scalars['String'];
    /** The token to pass to an action to reference the uploaded file. */
    token: Scalars['String'];
};
export type AvailableDirectUploadTokenSelection = {
    __typename?: boolean | null | undefined;
    /** The URL to upload a file to. */
    url?: boolean | null | undefined;
    /** The token to pass to an action to reference the uploaded file. */
    token?: boolean | null | undefined;
};
/** Information about the Shopify Connection */
export type Shopify = {
    __typename: 'Shopify';
    /** Whether the current session's shop requires a re-authentication with Shopify to acquire updated scopes */
    requiresReauthentication: (Scalars['Boolean'] | null);
    /** A list missing scopes compared to the Connection based on the current session's shop */
    missingScopes: Scalars['String'][];
};
export type AvailableShopifySelection = {
    __typename?: boolean | null | undefined;
    /** Whether the current session's shop requires a re-authentication with Shopify to acquire updated scopes */
    requiresReauthentication?: boolean | null | undefined;
    /** A list missing scopes compared to the Connection based on the current session's shop */
    missingScopes?: boolean | null | undefined;
};
export type InternalQueries = {
    __typename: 'InternalQueries';
    gellyView: (Scalars['JSON'] | null);
};
export type AvailableInternalQueriesSelection = {
    __typename?: boolean | null | undefined;
    gellyView?: boolean | null | undefined;
};
export type Mutation = {
    __typename: 'Mutation';
    installWebPixel: (InstallWebPixelResult | null);
    shopifyConnection: (ShopifyConnectionMutations | null);
    background: BackgroundMutations;
    internal: InternalMutations;
};
export type AvailableMutationSelection = {
    __typename?: boolean | null | undefined;
    installWebPixel?: AvailableInstallWebPixelResultSelection;
    shopifyConnection?: AvailableShopifyConnectionMutationsSelection;
    background?: AvailableBackgroundMutationsSelection;
    internal?: AvailableInternalMutationsSelection;
};
export type InstallWebPixelResult = {
    __typename: 'InstallWebPixelResult';
    success: Scalars['Boolean'];
    errors: ExecutionError[];
    result: (Scalars['JSON'] | null);
};
export type AvailableInstallWebPixelResultSelection = {
    __typename?: boolean | null | undefined;
    success?: boolean | null | undefined;
    errors?: AvailableExecutionErrorSelection;
    result?: boolean | null | undefined;
};
export type ShopifyConnectionMutations = {
    __typename: 'ShopifyConnectionMutations';
    fetchOrInstallShop: (ShopifyConnectionFetchOrInstallShopResult | null);
};
export type AvailableShopifyConnectionMutationsSelection = {
    __typename?: boolean | null | undefined;
    fetchOrInstallShop?: AvailableShopifyConnectionFetchOrInstallShopResultSelection;
};
export type ShopifyConnectionFetchOrInstallShopResult = {
    __typename: 'ShopifyConnectionFetchOrInstallShopResult';
    isAuthenticated: Scalars['Boolean'];
    redirectToOauth: Scalars['Boolean'];
    missingScopes: Scalars['String'][];
};
export type AvailableShopifyConnectionFetchOrInstallShopResultSelection = {
    __typename?: boolean | null | undefined;
    isAuthenticated?: boolean | null | undefined;
    redirectToOauth?: boolean | null | undefined;
    missingScopes?: boolean | null | undefined;
};
export type BackgroundMutations = {
    __typename: 'BackgroundMutations';
    installWebPixel: EnqueueBackgroundActionResult;
};
export type AvailableBackgroundMutationsSelection = {
    __typename?: boolean | null | undefined;
    installWebPixel?: AvailableEnqueueBackgroundActionResultSelection;
};
/** The value returned from enqueuing an action to run in the background */
export type EnqueueBackgroundActionResult = {
    __typename: 'EnqueueBackgroundActionResult';
    success: Scalars['Boolean'];
    errors: ExecutionError[];
    backgroundAction: (BackgroundActionHandle | null);
};
export type AvailableEnqueueBackgroundActionResultSelection = {
    __typename?: boolean | null | undefined;
    success?: boolean | null | undefined;
    errors?: AvailableExecutionErrorSelection;
    backgroundAction?: AvailableBackgroundActionHandleSelection;
};
/** One action enqueued for execution in the background */
export type BackgroundActionHandle = {
    __typename: 'BackgroundActionHandle';
    /** The ID of the background action */
    id: Scalars['String'];
};
export type AvailableBackgroundActionHandleSelection = {
    __typename?: boolean | null | undefined;
    /** The ID of the background action */
    id?: boolean | null | undefined;
};
export type InternalMutations = {
    __typename: 'InternalMutations';
    startTransaction: Scalars['String'];
    commitTransaction: Scalars['String'];
    rollbackTransaction: Scalars['String'];
    /** Acquire a backend lock, returning only once the lock has been acquired */
    acquireLock: LockOperationResult;
    triggerInstallWebPixel: (InstallWebPixelResult | null);
    cancelBackgroundAction: CancelBackgroundActionResult;
    bulkCancelBackgroundActions: BulkCancelBackgroundActionResult;
};
export type AvailableInternalMutationsSelection = {
    __typename?: boolean | null | undefined;
    startTransaction?: boolean | null | undefined;
    commitTransaction?: boolean | null | undefined;
    rollbackTransaction?: boolean | null | undefined;
    /** Acquire a backend lock, returning only once the lock has been acquired */
    acquireLock?: AvailableLockOperationResultSelection;
    triggerInstallWebPixel?: AvailableInstallWebPixelResultSelection;
    cancelBackgroundAction?: AvailableCancelBackgroundActionResultSelection;
    bulkCancelBackgroundActions?: AvailableBulkCancelBackgroundActionResultSelection;
};
export type LockOperationResult = {
    __typename: 'LockOperationResult';
    /** Whether the lock operation succeeded */
    success: Scalars['Boolean'];
    /** Any errors encountered during the locking/unlocking operation */
    errors: ExecutionError[];
};
export type AvailableLockOperationResultSelection = {
    __typename?: boolean | null | undefined;
    /** Whether the lock operation succeeded */
    success?: boolean | null | undefined;
    /** Any errors encountered during the locking/unlocking operation */
    errors?: AvailableExecutionErrorSelection;
};
/** The value returned from cancelling a background action */
export type CancelBackgroundActionResult = {
    __typename: 'CancelBackgroundActionResult';
    success: Scalars['Boolean'];
    errors: ExecutionError[];
    backgroundAction: (BackgroundActionHandle | null);
};
export type AvailableCancelBackgroundActionResultSelection = {
    __typename?: boolean | null | undefined;
    success?: boolean | null | undefined;
    errors?: AvailableExecutionErrorSelection;
    backgroundAction?: AvailableBackgroundActionHandleSelection;
};
/** The value returned from cancelling a background action */
export type BulkCancelBackgroundActionResult = {
    __typename: 'BulkCancelBackgroundActionResult';
    successCount: Scalars['Int'];
    failedCount: Scalars['Int'];
};
export type AvailableBulkCancelBackgroundActionResultSelection = {
    __typename?: boolean | null | undefined;
    successCount?: boolean | null | undefined;
    failedCount?: boolean | null | undefined;
};
export type Subscription = {
    __typename: 'Subscription';
    /** Subscribe to events about the application for the development harness */
    gadgetMetaHarnessEvents: GadgetApplicationHarnessEvent;
    backgroundAction: (BackgroundAction | null);
};
export type AvailableSubscriptionSelection = {
    __typename?: boolean | null | undefined;
    /** Subscribe to events about the application for the development harness */
    gadgetMetaHarnessEvents?: AvailableGadgetApplicationHarnessEventSelection;
    backgroundAction?: AvailableBackgroundActionSelection;
};
export type GadgetApplicationHarnessEvent = {
    __typename: 'GadgetApplicationHarnessEvent';
    id: Scalars['String'];
    event: Scalars['JSON'];
};
export type AvailableGadgetApplicationHarnessEventSelection = {
    __typename?: boolean | null | undefined;
    id?: boolean | null | undefined;
    event?: boolean | null | undefined;
};
export type BackgroundAction = {
    __typename: 'BackgroundAction';
    /** The ID of the background action */
    id: Scalars['String'];
    outcome: (BackgroundActionOutcome | null);
    result: (BackgroundActionResult | null);
};
export type AvailableBackgroundActionSelection = {
    __typename?: boolean | null | undefined;
    /** The ID of the background action */
    id?: boolean | null | undefined;
    outcome?: boolean | null | undefined;
    result?: AvailableBackgroundActionResultSelection;
};
export type ExplicitNestingRequired = never;
export type DeepFilterNever<T> = T extends Record<string, unknown> ? FilterNever<{
    [Key in keyof T]: T[Key] extends Record<string, unknown> ? DeepFilterNever<T[Key]> : T[Key];
}> : T;
/**
 * Given a schema we can select values from, apply a given selection to that schema to get the output type.
 **/
export type Select<Schema, Selection extends FieldSelection | null | undefined> = Selection extends null | undefined ? never : Schema extends (infer T)[] ? Select<T, Selection>[] : Schema extends null ? Select<Exclude<Schema, null>, Selection> | null : {
    [Key in keyof Selection & keyof Schema]: Selection[Key] extends true ? Schema[Key] : Selection[Key] extends FieldSelection ? Select<Schema[Key], Selection[Key]> : never;
};
export type IDsList = {
    ids: string[];
};
/**
 * For finder functions which accept the `live: true` argument, this type decides if the return type will be one value or an async iterable stream of values
 * If {live: true}, returns an AsyncIterable<Result>
 * Anything else, returns a Promise<Result>
 **/
export type PromiseOrLiveIterator<Options extends {
    live?: boolean;
}, Result> = Options extends {
    live: true;
} ? AsyncIterable<Result> : Promise<Result>;
export type { ComputedViewWithoutVariables, ComputedViewWithVariables, ComputedViewFunctionWithoutVariables, ComputedViewFunctionWithVariables };
