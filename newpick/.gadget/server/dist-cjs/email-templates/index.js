"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    renderEmailTemplate: function() {
        return renderEmailTemplate;
    },
    renderResetPasswordTemplate: function() {
        return renderResetPasswordTemplate;
    },
    renderVerifyEmailTemplate: function() {
        return renderVerifyEmailTemplate;
    }
});
const _AppConfigs = require("../AppConfigs");
const _emails = require("../emails");
const _errors = require("../errors");
const _globals = require("../globals");
const _resetpassword = require("./reset-password");
const _verifyemail = require("./verify-email");
/**
 * Renders an email template using EJS.
 * @param {string} template - The EJS template content
 * @param {object} data - The data to be passed to the template
 * @returns {string} - The rendered email template
 */ const renderEmailTemplate = (template, data)=>{
    if (!_emails.emails) {
        throw new _errors.GlobalNotSetError("emails is not yet defined");
    }
    try {
        return _emails.emails.render(template, data);
    } catch (error) {
        _globals.Globals.logger.error({
            error,
            name: "emails"
        }, "An error occurred rendering your EJS email template");
        throw error;
    }
};
/**
 * Renders the "Verify Email" template.
 * * @param {templateData} data - The data used to render the template.
 * @param {string} [data.app_name] - The name of your app, defaults to Config.appName (optional)
 * @param {string} data.url - The url for the user to verify their account.
 * @returns {string} - The rendered html of the email template
 */ const renderVerifyEmailTemplate = (data)=>{
    if (!_AppConfigs.Config.appName && !data.app_name) {
        throw new _errors.GlobalNotSetError("Config.appName is not yet defined");
    }
    const url = data.url;
    const app_name = data.app_name ?? _AppConfigs.Config.appName;
    return renderEmailTemplate(_verifyemail.VERIFY_EMAIL_TEMPLATE, {
        app_name,
        url
    });
};
/**
 * Renders the "Reset Password" template.
 * @param {templateData} data - The data used to render the template.
 * @param {string} [data.app_name] - The name of your app. If not provided, it defaults to Config.appName.
 * @param {string} data.url - The url for the user to reset their password.
 * @returns {string} - The rendered html of the email template.
 */ const renderResetPasswordTemplate = (data)=>{
    if (!_AppConfigs.Config.appName && !data.app_name) {
        throw new _errors.GlobalNotSetError("Config.appName is not yet defined");
    }
    const url = data.url;
    const app_name = data.app_name ?? _AppConfigs.Config.appName;
    return renderEmailTemplate(_resetpassword.RESET_PASSWORD_TEMPLATE, {
        app_name,
        url
    });
};
