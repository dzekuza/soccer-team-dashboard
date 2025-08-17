
import type { GadgetMailer } from "./types.js";
/**
* An instance of the Gadget NodeMailer
*/
export declare let emails: GadgetMailer;
/**
* This is used internally to set the gadget nodemailer Instance
* @internal
*/
export declare const setGadgetNodeMailer: (transporter: any) => void;
