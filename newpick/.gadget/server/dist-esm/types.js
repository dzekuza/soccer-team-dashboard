/**
 * An object passed between all preconditions and effects of an action execution at the `scope` property.
 * Useful for transferring data between effects.
 **/ /** Information about the current request being processed by Gadget. */ /** The remote IP address of the request */ /** The requested URL */ /** The HTTP method for this request (like GET, POST, etc) */ /** A unique identifier for this request */ /** The user agent header of the request */ /** Headers passed to this request */ /** Describes an action triggered by running a Shopify webhook */ /** The topic of the incoming webhook from Shopify, like products/update or orders/create */ /** The raw incoming payload from Shopify */ /** The ID of the shop receiving the webhook */ /** The number of times this webhook has been retried */ /** Mutation name called in the API */ /** Model identifier the mutation was called on. Usually the same as the model the action is being run on, but will be different if the action is nested. Is not set for global actions. */ /** Action identifier triggered by the mutation. Usually the same as the action is being run, but will be different if the current action is nested */ /** The params passed to this API call, including any data for nested actions if passed */ /** Describes an action triggered by calling a mutation in the app's generated GraphQL API */ /** Describes an action triggered by running a sync on a Shopify model. */ /** The shop id being synced */ /** The API version of the shop being synced */ /** The available oauth scopes of the shop being synced */ /** The id of the sync record tracking the state of this sync, if available */ /** The specified date range of this sync, if set when the sync was started */ /** The list of model apiIdentifiers this sync will work on. */ /** If this sync is being run in force mode, which will always run actions, even if the updated_at timestamps match between Gadget and Shopify */ /** The string reason why this sync was started if set when the sync began */ /** Describes an action run by one event on a schedule */ /** Describes an action run as a background job */ /** How many attempts we have made to run this job */ /** Whether this is the final attempt */ /** ID of the background action record */ /** Describes an action run by a Shopify merchant completing the OAuth process to install an application */ /** Describes an action run by a Shopify Admin app being installed into Gadget */ /** Describes an action run by a Shopify customer who has logged in to a customer UI extension that has called this app */ /** Represents actions triggered by happenings inside the Gadget platform, like maintenance, or administrative actions taken inside the Gadget editor */ /** Represents actions triggered by tests within the Gadget platform */ /** Describes an action triggered by running a BigCommerce webhook */ /** The scope of the incoming webhook from BigCommerce, like store/products/updated or store/orders/* */ /** The raw incoming data from BigCommerce */ /** The storeHash of the store producing the webhook */ /** The time at which the webhook was created */ /** A hash sent by BigCommerce with each webhook to help with duplicate events */ /** The number of times this webhook has been retried */ /** @hidden */ /**
 * The base attributes most records have
 **/ /** Gadget's Error tracking object used in validation code effects for adding errors when a validation fails.*/ /**
   * Add an error to the errors list for a given field
   * @param {string} field - The `apiIdentifier` of the field you wish to add an error to
   * @param {string} message - A mesage describing the error in detail.
   */ /**
   * Returns the number of errors for this record validation pass.
   */ /**
   * Returns `true` if there are no errors, otherwise returns `false`.
   */ /**
   * Returns an array of objects containing the field's `apiIdentifier` and the error `message` string for all errors added so far.
   */ /**
   * Returns a simplified JSON object representing the error messages grouped by `apiIdentifier`
   */ /** A generic interface for an object that doesn't have a committed a public interface. */ /** Represents the data that's in always context */ /** The current request's session, if it has one. Requests made by browsers are given sessions, but requests made using Gadget API Keys are not. */ /** The current request's session ID, if it has one. Requests made by browsers are given sessions, but requests made using Gadget API Keys are not. */ /** All <%- applicationName %> configuration values */ /** A map of connection name to instantiated connection objects for <%- applicationName %> */ /** A signal for if/when the request for processing this unit of work gets prematurely aborted. Useful for passing along to long running requests that should be interrupted when the client goes away. */ /** A high performance structured logger which writes logs to the Logs Viewer in the Gadget Editor. */ /**
   * An instance of the API client for <%- applicationName %>.
   *
   * __Note__: This client is authorized using a superuser internal api token and has permission to invoke any action in the system using normal API mutations or the Internal API.
   **/ /**
   * The details of the request that is invoking this unit of work, if it was invoked by a request.
   *
   * __Note__: Request details are not always present, like during a background connection sync, a background job, or an action retry.
   **/ /**
   * A unique identifier for this context
   */ /**
   * A boolean describing if this unit of work will be retried automatically or not
   */ /** App URL for the current environment e.g. https://example.gadget.app */ /** An object for sending emails */ /**
   * The current tenancy for this unit of work
   * @internal
   */ /** @internal */ /** @internal */ /** @internal */ /** @internal */ /** The context for a request passed to an HTTP route */ /** @deprecated */ /** @deprecated */ /** @deprecated */ /** A signal for if/when the request for processing this unit of work gets prematurely aborted. Useful for passing along to long running requests that should be interrupted when the client goes away. */ /** Details about what triggered this action or global action to run */ /**
   * An object passed between all preconditions and effects of an action execution at the \`scope\` property.
   * Useful for transferring data between effects.
   */ /**
   * @internal
   */ /**
 * An action context type for use in actions that can run on any model.
 */ /** Details about the action being executed */ /**
   * The record this action is operating on.
   */ /**
   * The model this action is for.
   */ /**
   * The parameters passed to the action.
   */ /** The phase of execution we're running currently */ /**
   * The current context for this action
   */ /**
   * @deprecated
   */ /**
 * Describes the context passed to every global action.
 */ /** Details about the global action being executed */ /** What phase of execution this global action is currently in */ /**
   * The parameters passed to the action.
   */ /**
   * The current context for this global action
   */ /**
 * Represents all the context available when executing one effect of an action or global action
 **/ /**
   * The parameters passed to this effect.
   */ /**
   * The specific connection this effect has been contributed by
   **/ // present for effects on actions, not present for effects on GlobalActions
// present for effects on actions, not present for effects on GlobalActions
/**
 * Represents all the context available when executing one precondition of an action or global action
 * @deprecated
 **/ // present for effects on actions, not present for effects on GlobalActions
// present for effects on actions, not present for effects on GlobalActions
/**
 * @hidden
 */ /**
 * @hidden
 */ /** Gadget wrapper for NodeMailer, used to facilitate the sending of emails.*/ /** Verifies SMTP configuration */ /** Sets the transport configuration used for transporting emails */ /** Sends the email using the set transporter, alias for `sendMail` */ /** Sends the email using the set transporter */ /** Renders an ejs template */ /**
 * @internal
 */ /**
 * @internal
 */ /** The options for the mail object being sent */ /** An array of recipients e-mail addresses that will appear on the To: field */ /** The subject of the e-mail */ /** The body of the email in plain text */ /** The body of the email in HTML */ /** The From address displayed to users as to who the email came from. If using Gadget transport, must end in the app's approved subdomain, the value of primaryDomain found in Config. If one is not provided then a default address for the app will be used */ /** The Sender header used to identify the agent responsible for the actual transmission of the email. Can only be set when using a Custom transport */ /** An array of attachments */ /** Comma separated list or an array of recipients e-mail addresses that will appear on the Cc: field */ /** Comma separated list or an array of recipients e-mail addresses that will appear on the Bcc: field */ /** Comma separated list or an array of e-mail addresses that will appear on the Reply-To: field */ /** The message-id this message is replying */ /** Message-id list (an array or space separated string) */ /** An object or array of additional header fields */ export { }; /** the filename of the attachment. If not provided, will be derived from the path */  /** path to a file */  /** the content of the attachment */ 
