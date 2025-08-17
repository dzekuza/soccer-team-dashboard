/**
* A map from configuration value name to value all the configuration values and secrets in newpick.
* __Note__: Any encrypted configuration values are decrypted and ready for use in this map.
*/
export interface AppConfiguration {
  GADGET_ENV: string | undefined;
  GADGET_APP: string | undefined;
  /**
  * The value for the NODE_ENV environment variable set in the Gadget Environment Variables settings section. 
  */
  NODE_ENV: string | undefined;
};


declare global {
  namespace NodeJS {
    interface ProcessEnv extends AppConfiguration {
    }
  }
}
