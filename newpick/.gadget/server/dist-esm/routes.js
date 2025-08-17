/**
 * Extend the fastify request type with our added decorations like `.api`, `.emails`, etc
 * See https://fastify.dev/docs/latest/Reference/TypeScript#creating-type-definitions-for-a-fastify-plugin
 **/ /** The current request's session, if it has one. Requests made by browsers are given sessions, but requests made using Gadget API Keys are not. */ /** The current request's session ID, if it has one. Requests made by browsers are given sessions, but requests made using Gadget API Keys are not. */ /** All newpick configuration values */ /** A map of connection name to instantiated connection objects for newpick */ /** A high performance structured logger which writes logs to the Logs Viewer in the Gadget Editor. */ /** Gadget configuration values for the current request. Useful for Remix SSR apps for accessing the Shopify install state or passing the values to client side code. */ /** An context object used by Gadget to store request information that it is responsible for managing. */ /**
     * An instance of the API client for newpick.
     *
     * __Note__: This client is authorized using a superuser internal api token and has permission to invoke any action in the system using normal API mutations or the Internal API.
     **/ /** App URL for the current environment e.g. https://example.gadget.app */ /** Fastify request object */ /** Fastify reply object */ /** @deprecated Use session instead */ /** @deprecated Use sessionID instead */ // eslint-disable-next-line @typescript-eslint/no-empty-object-type
// no reply extensions yet
/** A server instance, for hooking into various events, decorating requests, and so on.  */ /**
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
 */ /** A request instance, to query data on an incoming HTTP request. */ /** A reply instance, for sending headers and data in an HTTP response. */ export { };
