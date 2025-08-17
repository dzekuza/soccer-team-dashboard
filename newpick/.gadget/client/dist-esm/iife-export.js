import { NewpickClient } from ".";
window.NewpickClient = NewpickClient;
const previousValue = window.Gadget;
window.Gadget = NewpickClient;
window.Gadget.previousValue = previousValue;
//# sourceMappingURL=iife-export.js.map
