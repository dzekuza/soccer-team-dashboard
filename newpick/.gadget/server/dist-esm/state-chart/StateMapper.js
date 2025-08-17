import mapValue, { assert, invert, isEmpty, isObject, isString } from "../utils.js";
/**
 * The value representing a state.
 *
 * For example,
 *
 * - `"created"`, for simple states;
 * - `{ "created": "unfulfilled" }`, for compound states; and
 * - `{ "created": { "fulfilled": "no", "reviewed": "no } } }`, for parallel states.
 */ /**
 * A value storing the historical state values.
 *
 * For example,
 *
 * ```js
 * {
 *   current: "created",
 *   children: {
 *     created: {
 *       current: "fulfilled",
 *     },
 *     archive: {
 *       current: "softDeleted",
 *     },
 *   }
 * }
 * ```
 */ /** The name of the state that was previously active */ /** Historical values of all nested states */ /** Data about a state, as returned by lookup by state key via `StateMapper` */ /** The state value for a given state, as we'd persist it in the DB */ /** The API identifier for the state (can be changed by the user) */ /** The `StateBlob` this state was derived from, as given to the app sandbox */ /** A path to key to this state from the root, useful with lodash's get/set */ /** Deeply map the keys/values of a state value */ function mapStateValue(state, mapper) {
    if (isObject(state)) {
        const result = {};
        for (const [key, value] of Object.entries(state)){
            result[mapper(key)] = mapStateValue(value, mapper);
        }
        return result;
    }
    return mapper(state);
}
/** Deeply map the keys/values of a state history value */ function mapStateHistoryValue(state, mapper) {
    const result = {
        current: mapper(state.current)
    };
    if (state.children) {
        result.children = {};
        for (const [name, history] of Object.entries(state.children)){
            result.children[mapper(name)] = mapStateHistoryValue(history, mapper);
        }
    }
    return result;
}
/** Determine if a given value is a state value */ export function isStateValue(value) {
    if (isString(value)) {
        return true;
    }
    if (!isObject(value)) {
        return false;
    }
    return Object.entries(value).every(([key, value])=>isString(key) && isStateValue(value));
}
/** Determine if a given value is a state history value */ export function isStateHistoryValue(value) {
    if (!isObject(value)) {
        return false;
    }
    const record = value;
    if (!("current" in record) || !isString(record.current)) {
        return false;
    }
    if ("children" in record && record.children) {
        if (!isObject(record.children)) {
            return false;
        }
        return Object.values(record.children).every((v)=>isStateHistoryValue(v));
    }
    return true;
}
/**
 * Map state keys to data on those states.
 *
 * The things in the state chart are deeply nested, so the `StateMapper` takes care of flattening this structure into an efficient lookup
 * table, based on the state keys.
 *
 * `StateMapper` also exposes functions to map back and forth between transit state values (using the API identifiers) and storage state
 * values (using state keys).
 */ export class StateMapper {
    model;
    stateKeyToDataMap;
    constructor(model){
        this.model = model;
        this.stateKeyToDataMap = {};
        this.populateStateMaps(model.stateChart.childStates, []);
    }
    mapStorageValueToApiIdentifiers(stateValue) {
        return mapStateValue(stateValue, (key)=>{
            if (key in this.stateKeyToDataMap) {
                return this.stateKeyToDataMap[key].apiIdentifier;
            }
            return key;
        });
    }
    mapApiIdentifiersToStorageValue(stateValue) {
        return mapStateValue(stateValue, (apiIdentifier)=>{
            if (apiIdentifier in this.apiIdentifierToStateKeyMap) {
                return this.apiIdentifierToStateKeyMap[apiIdentifier];
            }
            return apiIdentifier;
        });
    }
    mapStorageHistoryValueToApiIdentifiers(stateHistoryValue) {
        return mapStateHistoryValue(stateHistoryValue, (key)=>{
            if (key in this.stateKeyToDataMap) {
                return this.stateKeyToDataMap[key].apiIdentifier;
            }
            return key;
        });
    }
    mapApiIdentifiersToStorageHistoryValue(stateHistoryValue) {
        return mapStateHistoryValue(stateHistoryValue, (apiIdentifier)=>{
            if (apiIdentifier in this.apiIdentifierToStateKeyMap) {
                return this.apiIdentifierToStateKeyMap[apiIdentifier];
            }
            return apiIdentifier;
        });
    }
    stateKeyToData(stateKey) {
        return assert(this.stateKeyToDataMap[stateKey], `state key "${stateKey}" not found in state map`);
    }
    get apiIdentifierToStateKeyMap() {
        return invert(mapValue(this.stateKeyToDataMap, ({ apiIdentifier })=>apiIdentifier));
    }
    populateStateMaps(states, path) {
        for (const state of states){
            path.push(state.apiIdentifier);
            this.stateKeyToDataMap[state.key] = {
                apiIdentifier: state.apiIdentifier,
                blob: state,
                value: stateValueFromPath(path),
                path: path.slice()
            };
            if (state.childStates) {
                this.populateStateMaps(state.childStates, path);
            }
            path.pop();
        }
    }
}
/**
 * Compute a state value, from a "path" of identifiers.
 *
 * **NOTE**: State values are persisted, so bear that in mind when changing the shape.
 */ export function stateValueFromPath(path) {
    if (path.length == 0) {
        // Note, we're not throwing a special error here because we're in control of the code that calls this method, and should always pass in a non-empty path
        throw new Error("can't compute state value from an empty path");
    }
    if (path.length == 1) {
        return path[0];
    }
    let index = path.length - 1;
    let stateValue = path[index];
    while(--index >= 0){
        const stateApiIdentifier = path[index];
        stateValue = {
            [stateApiIdentifier]: stateValue
        };
    }
    return stateValue;
}
/**
 * Flatten a state value.
 *
 * For example,
 *
 * ```json
 * { "created": { "unfulfilled": "needsReview" } } }
 * ```
 *
 * will be flattened into `["created", "unfulfilled", "needsReview"]`
 */ export function flattenStateValue(state) {
    if (isString(state)) {
        return [
            state
        ];
    }
    if (isEmpty(state)) {
        return [];
    }
    const [key, stateValue] = Object.entries(state)[0];
    return [
        key,
        ...flattenStateValue(stateValue)
    ];
}
