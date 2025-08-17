/** A high performance structured logger which writes logs to the Logs Viewer in the Gadget Editor. */ /** Represents the data that's in always context */ export { }; /** The current request's session, if it has one. Requests made by browsers are given sessions, but requests made using Gadget API Keys are not. */  /** The current request's session ID, if it has one. Requests made by browsers are given sessions, but requests made using Gadget API Keys are not. */  /** All newpick configuration values */  /** A map of connection name to instantiated connection objects for newpick */  /** A high performance structured logger which writes logs to the Logs Viewer in the Gadget Editor. */  /**
   * An instance of the API client for newpick.
   *
   * __Note__: This client is authorized using a superuser internal api token and has permission to invoke any action in the system using normal API mutations or the Internal API.
   **/  /**
   * The details of the request that is invoking this unit of work, if it was invoked by a request.
   *
   * __Note__: Request details are not always present, like during a background connection sync, a background job, or an action retry.
   **/  /** App URL for the current environment e.g. https://example.gadget.app */  /** An instance of the GadgetMailer, responsible for handling email sending */  /**
   * A signal for if/when the request for processing this unit of work gets prematurely aborted. Useful for passing along to long running requests that should be interrupted when the client goes away.
   */ 
