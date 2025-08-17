/**
 * An instance of the Gadget NodeMailer
 */ export let emails;
/**
 * This is used internally to set the gadget nodemailer Instance
 * @internal
 */ export const setGadgetNodeMailer = (transporter)=>{
    emails = transporter;
};
