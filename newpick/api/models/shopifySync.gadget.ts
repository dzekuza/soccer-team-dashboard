import { defineModel } from "gadget-server";

export const shopifySync = defineModel({
    name: "shopifySync",
    storageKey: "DataModel-Shopify-Sync",
    fields: {
        shopId: {
            type: "number",
            required: true,
        },
        resourceType: {
            type: "string",
            required: true,
        },
        resourceId: {
            type: "string",
            required: true,
        },
        lastSyncedAt: {
            type: "dateTime",
            required: true,
        },
        syncStatus: {
            type: "string",
            required: true,
            defaultValue: "pending",
        },
        errorMessage: {
            type: "string",
            required: false,
        },
        retryCount: {
            type: "number",
            required: true,
            defaultValue: 0,
        },
    },
    indexes: {
        byShopAndResource: {
            fields: ["shopId", "resourceType", "resourceId"],
        },
        byStatus: {
            fields: ["syncStatus"],
        },
    },
});
