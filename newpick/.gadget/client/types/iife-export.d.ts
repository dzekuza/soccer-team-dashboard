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
