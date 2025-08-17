/**
      * The array of scopes configured for this connection and what Shopify will prompt the user to grant.
      * If the shop records `grantedScopes` value doesn't include all these scopes, a new OAuth grant should be requested.
      */ /**
        * The current shop in context for the app. In-context means the shop the requests is coming from, or the webhook arrived from, or the sync is running for. There isn't always a shop in context, and this will be undefined if not.
        */ /**
           * The ID of the shop
           */ /**
           * The domain of the shop
           */ /**
           * The API version of the shop
           */ /**
        * The client id of the Shopify app that the current shop is connected to. The current shop is inferred from the request context.
        */ /**
        * The client secret of the Shopify app that the current shop is connected to. The current shop is inferred from the request context.
        */ /**
        * Shopify client for the current in context shop or record
        */ /**
        * Configuration of the shopify connection
        **/ /**
        * The maximum number of retries for requests to Shopify
        **/ /**
        * The Shopify Session token details for the current request, if present. A request must be authenticated with a Shopify Session token for this to be present, otherwise it will be undefined. Gadget validates the incoming session token against your app's client secret and won't permit invalid, expired, or incorrectly signed tokens.
        */ /**
        * The ID of the shop set up as the current in-context tenant for this context. The current shop is inferred from the request context.
        */ /**
        * The domain of the shop set up as the current in-context tenant for this context. The current shop is inferred from the request context.
        */ /**
        * @param {GadgetRecord<Record<string, any>>} shop - A shopify shop record
        * @returns {Shopify} Shopify Client for the given shop
        */ /**
        * @param {bigint} shopId Shop ID from the Shop model
        * @returns {Promise<Shopify>} Promise which resolves to a Shopify Client
        */ /**
        * @param {string} shopDomain The Shopify domain
        * @returns {Promise<Shopify>} Promise which resolves to a Shopify Client
        */ /**
        * @param {bigint} shopId to set for the current context
        * @returns {Promise<void>} Resolves when the shop context has been updated
        **/ /**
        * API keys (also known as Client keys) for all connected Shopify apps
        */ /**
        * All Shopify models currently enabled on the application.
        */ /**
 * A map from connection name to instantiated connection object for all the connections in newpick
 */ export { }; /** An instantiated API client object for the Shopify connection. */ 
