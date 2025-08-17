"use strict";
var import__ = require(".");
window.NewpickClient = import__.NewpickClient;
const previousValue = window.Gadget;
window.Gadget = import__.NewpickClient;
window.Gadget.previousValue = previousValue;
//# sourceMappingURL=iife-export.js.map
