import { defineModel } from "gadget-server";

export const session = defineModel({
    name: "session",
    storageKey: "DataModel-Session",
    fields: {
        userId: {
            type: "number",
            required: true,
        },
        shopId: {
            type: "number",
            required: false,
        },
        expiresAt: {
            type: "dateTime",
            required: true,
        },
        token: {
            type: "string",
            required: true,
        },
    },
    indexes: {
        byToken: {
            fields: ["token"],
        },
        byUserId: {
            fields: ["userId"],
        },
    },
});
