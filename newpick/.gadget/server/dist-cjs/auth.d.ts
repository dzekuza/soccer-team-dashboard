
import type { GadgetRecord } from "@gadgetinc/api-client-core";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AnyParams, FieldMetadata, ModelDescriptor } from "./types";
declare module "fastify" {
	interface FastifyRequest {
		gadgetAuth?: {
			redirectToSignIn: boolean
			signInPath: string
		};
	}
}
export declare const generateCode: (numBytes?: number) => string;
export declare const hashCode: (code: string) => string;
/**
* Safely compares a password reset code and hash
* @param {string} [code] - The password reset code
* @param {string} [hash] - The hashed password reset code
* @returns {boolean} - Whether the code is valid or not
*/
/**
* Utility function to wrap route handlers with protection from unauthenticated requests.
*
* @param handler The route handler to protect
* @param {ProtectedRouteOptions} options Options for the protected route
* @returns handler function that is wrapped with route protection
*
* @example
* ```ts
* // routes/GET-protected-route.js
* import { preValidation } from "gadget-server";
*
* module.exports = async ({ request, reply }) => {
*  await reply.send("this is a protected route");
* }
*
* module.options = {
*   preValidation,
* }
* ```
*/
export declare const preValidation: <RouteContext extends FastifyRequest>(request: RouteContext, reply: FastifyReply) => Promise<void>;
export declare function validateBelongsToLink(options: {
	input: any
	record: any
	params: AnyParams
	tenantId: string
	model: ModelDescriptor
	tenantModelKey: string
	tenantBelongsToField?: string | undefined
	tenantType: string
	tenantName?: string
}): void;
export declare function setBelongsToLink(input: any, record: GadgetRecord<any>, params: AnyParams, model: ModelDescriptor, relatedField: FieldMetadata, tenantId: string): void;
