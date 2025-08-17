
import type { AmbientContext } from "./AmbientContext";
import type { TriggerWithType, ActionExecutionScope } from "./types";
/** Context of the `installWebPixel` action. */
export interface InstallWebPixelGlobalActionContext extends AmbientContext {
	/**
	* @deprecated Use 'returnType' instead.
	* Useful for returning data from this action by setting `scope.result`.
	*/
	scope: ActionExecutionScope;
	/**
	* An object specifying the trigger to this action (e.g. API call, custom params).
	*/
	params: {
		shopId?: string
	};
	/**
	* An object specifying the trigger to this action (e.g. api call, scheduler etc.)
	*/
	trigger: TriggerWithType<"api"> | TriggerWithType<"background-action">;
	/**
	* @private The context of this action.
	*/
	context: InstallWebPixelGlobalActionContext;
}
