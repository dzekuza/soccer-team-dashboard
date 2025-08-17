
export type GadgetPluginOptions = Record<string, never>;
declare global {
	namespace JSX {
		interface IntrinsicElements {
			/** The Gadget Sparkle Button custom component -- shouldn't be used by end user code */
			["gadget-sparkle-button"]: any;
		}
	}
}
