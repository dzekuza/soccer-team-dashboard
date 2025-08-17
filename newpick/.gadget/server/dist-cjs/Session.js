"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Session", {
    enumerable: true,
    get: function() {
        return Session;
    }
});
function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}
function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
}
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
var _storage = /*#__PURE__*/ new WeakMap();
/**
 * Bag of key-values associated with the current actor running this request or action
 **/ class Session {
    static fromInput(input) {
        if (input) {
            return new Session(input.id, input);
        }
    }
    get(key) {
        return _class_private_field_get(this, _storage)[key];
    }
    set(key, value) {
        this.changedKeys.add(key);
        _class_private_field_get(this, _storage)[key] = value;
    }
    touch() {
        this.touched = true;
    }
    delete(key) {
        this.changedKeys.add(key);
        _class_private_field_get(this, _storage)[key] = null;
    }
    end() {
        this.changedKeys.add("id");
        this.ended = true;
    }
    clearChanges() {
        this.changedKeys.clear();
    }
    get changed() {
        return this.changedKeys.size > 0;
    }
    toJSON() {
        return _class_private_field_get(this, _storage);
    }
    toChangedJSON() {
        const changes = {};
        for (const key of this.changedKeys){
            changes[key] = _class_private_field_get(this, _storage)[key];
        }
        return changes;
    }
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
        this.set("id", this._id);
    }
    constructor(_id, obj){
        _define_property(this, "_id", void 0);
        _define_property(this, "changedKeys", void 0);
        _define_property(this, "ended", void 0);
        _define_property(this, "touched", void 0);
        _class_private_field_init(this, _storage, {
            writable: true,
            value: void 0
        });
        this._id = _id;
        this.changedKeys = new Set();
        this.ended = false;
        this.touched = false;
        _class_private_field_set(this, _storage, obj);
    }
}
