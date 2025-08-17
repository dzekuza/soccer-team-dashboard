/* eslint-disable @typescript-eslint/no-namespace */

export type GadgetPluginOptions = Record<string, never>;

// Augment the global JSX types with Gadget's custom elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      /** The Gadget Sparkle Button custom component -- shouldn't be used by end user code */
      ["gadget-sparkle-button"]: any;
    }
  }
}
