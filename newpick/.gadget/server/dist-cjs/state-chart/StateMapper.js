"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    StateMapper: function() {
        return StateMapper;
    },
    flattenStateValue: function() {
        return flattenStateValue;
    },
    isStateHistoryValue: function() {
        return isStateHistoryValue;
    },
    isStateValue: function() {
        return isStateValue;
    },
    stateValueFromPath: function() {
        return stateValueFromPath;
    }
});
const _utils = /*#__PURE__*/ _interop_require_wildcard(require("../utils"));
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
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
    if ((0, _utils.isObject)(state)) {
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
/** Determine if a given value is a state value */ function isStateValue(value) {
    if ((0, _utils.isString)(value)) {
        return true;
    }
    if (!(0, _utils.isObject)(value)) {
        return false;
    }
    return Object.entries(value).every(([key, value])=>(0, _utils.isString)(key) && isStateValue(value));
}
/** Determine if a given value is a state history value */ function isStateHistoryValue(value) {
    if (!(0, _utils.isObject)(value)) {
        return false;
    }
    const record = value;
    if (!("current" in record) || !(0, _utils.isString)(record.current)) {
        return false;
    }
    if ("children" in record && record.children) {
        if (!(0, _utils.isObject)(record.children)) {
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
 */ class StateMapper {
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
        return (0, _utils.assert)(this.stateKeyToDataMap[stateKey], `state key "${stateKey}" not found in state map`);
    }
    get apiIdentifierToStateKeyMap() {
        return (0, _utils.invert)((0, _utils.default)(this.stateKeyToDataMap, ({ apiIdentifier })=>apiIdentifier));
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
    constructor(model){
        _define_property(this, "model", void 0);
        _define_property(this, "stateKeyToDataMap", void 0);
        this.model = model;
        this.stateKeyToDataMap = {};
        this.populateStateMaps(model.stateChart.childStates, []);
    }
}
/**
 * Compute a state value, from a "path" of identifiers.
 *
 * **NOTE**: State values are persisted, so bear that in mind when changing the shape.
 */ function stateValueFromPath(path) {
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
 */ function flattenStateValue(state) {
    if ((0, _utils.isString)(state)) {
        return [
            state
        ];
    }
    if ((0, _utils.isEmpty)(state)) {
        return [];
    }
    const [key, stateValue] = Object.entries(state)[0];
    return [
        key,
        ...flattenStateValue(stateValue)
    ];
}
