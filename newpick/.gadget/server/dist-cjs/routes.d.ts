
import { NewpickClient } from "@gadget-client/newpick";
import type { FastifyInstance, FastifyReply, FastifyRequest, RequestGenericInterface, RouteGenericInterface, ContextConfigDefault, RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, RouteShorthandOptions, RouteHandlerMethod } from "fastify";
import { Logger } from "./AmbientContext";
import { AppConfiguration } from "./AppConfiguration";
import { AppConnections } from "./AppConnections";
import { Session } from "./Session";
import { GadgetConfig } from "./types";
/**
* Extend the fastify request type with our added decorations like `.api`, `.emails`, etc
* See https://fastify.dev/docs/latest/Reference/TypeScript#creating-type-definitions-for-a-fastify-plugin
**/
declare module "fastify" {
	interface FastifyRequest {
		/** The current request's session, if it has one. Requests made by browsers are given sessions, but requests made using Gadget API Keys are not. */
		session: Session | null;
		/** The current request's session ID, if it has one. Requests made by browsers are given sessions, but requests made using Gadget API Keys are not. */
		sessionID: string | null;
		/** All newpick configuration values */
		config: AppConfiguration;
		/** A map of connection name to instantiated connection objects for newpick */
		connections: AppConnections;
		/** A high performance structured logger which writes logs to the Logs Viewer in the Gadget Editor. */
		logger: Logger;
		/** Gadget configuration values for the current request. Useful for Remix SSR apps for accessing the Shopify install state or passing the values to client side code. */
		gadgetConfig: GadgetConfig;
		/** An context object used by Gadget to store request information that it is responsible for managing. */
		gadgetContext: Record<string, any>;
		/**
		* An instance of the API client for newpick.
		*
		* __Note__: This client is authorized using a superuser internal api token and has permission to invoke any action in the system using normal API mutations or the Internal API.
		**/
		api: NewpickClient;
		/** App URL for the current environment e.g. https://example.gadget.app */
		currentAppUrl: string;
		/** Fastify request object */
		request: this;
		/** Fastify reply object */
		reply: FastifyReply;
		/** @deprecated Use session instead */
		applicationSession?: Session;
		/** @deprecated Use sessionID instead */
		applicationSessionID?: string;
	}
	interface FastifyReply {}
}
/** A server instance, for hooking into various events, decorating requests, and so on.  */
export type Server = FastifyInstance;
/**
* A type representing the auto-loadable routes exported from the routes files.
*
* @example
* ```ts
* const route: RouteHandler<{ Body: { name: string } }> = async function ({ request, reply }) {
*   const { name } = request.body;
*
*   await reply.send({ message: `Hello, ${name}!` });
* }
* route.options = {
*   schema: {
*     body: {
*       type: 'object',
*       properties: {
*         name: { type: 'string' },
*       },
*     },
*   },
* }
*
* export default route;
* ```
*
* See https://docs.gadget.dev/guides/http-routes
*/
export type RouteHandler<
	RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
	ContextConfig = ContextConfigDefault
> = RouteHandlerMethod<RawServerDefault, RawRequestDefaultExpression<RawServerDefault>, RawReplyDefaultExpression<RawServerDefault>, RouteGeneric, ContextConfig> & {
	options?: RouteShorthandOptions<RawServerDefault, RawRequestDefaultExpression<RawServerDefault>, RawReplyDefaultExpression<RawServerDefault>, RouteGeneric, ContextConfig>
};
/** A request instance, to query data on an incoming HTTP request. */
export type RouteContext<InputTypes extends RequestGenericInterface = RequestGenericInterface> = FastifyRequest<InputTypes>;
export type Request<InputTypes extends RequestGenericInterface = RequestGenericInterface> = FastifyRequest<InputTypes>;
/** A reply instance, for sending headers and data in an HTTP response. */
export type Reply = FastifyReply;
