import { NewpickClient } from ".";

declare global {
  interface Window {
    /**
     * The Gadget client constructor
     *
     * @example
     * ```ts
     * const api = new NewpickClient();
     * ```
     */
    NewpickClient: typeof NewpickClient;

    /**
     * The Gadget client for NewpickClient
     * @deprecated Use window.NewpickClient instead
     */
    Gadget: typeof NewpickClient;
  }
}

// add the client to the window
window.NewpickClient = NewpickClient;

const previousValue: any = window.Gadget;

// add the client to the window at the old .Gadget property for backwards compatibility -- the NewpickClient property should be preferred instead
window.Gadget = NewpickClient;
(window.Gadget as any).previousValue = previousValue;
