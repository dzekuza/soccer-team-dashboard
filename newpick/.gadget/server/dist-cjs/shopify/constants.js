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
    invalidPlanDisplayNames: function() {
        return invalidPlanDisplayNames;
    },
    invalidPlanNames: function() {
        return invalidPlanNames;
    }
});
const invalidPlanNames = [
    "frozen",
    "fraudulent",
    "cancelled"
];
const invalidPlanDisplayNames = [
    "Frozen",
    "Fraudulent",
    "Cancelled"
];
