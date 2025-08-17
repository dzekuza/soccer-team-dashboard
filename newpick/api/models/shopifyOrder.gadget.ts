import { defineModel } from "gadget-server";

export const shopifyOrder = defineModel({
    name: "shopifyOrder",
    storageKey: "DataModel-Shopify-Order",
    fields: {
        shopId: {
            type: "number",
            required: true,
        },
        orderId: {
            type: "string",
            required: true,
        },
        orderNumber: {
            type: "string",
            required: false,
        },
        customerId: {
            type: "string",
            required: false,
        },
        totalPrice: {
            type: "string",
            required: true,
        },
        currency: {
            type: "string",
            required: true,
        },
        status: {
            type: "string",
            required: true,
        },
        fulfillmentStatus: {
            type: "string",
            required: false,
        },
        financialStatus: {
            type: "string",
            required: false,
        },
        createdAt: {
            type: "dateTime",
            required: true,
        },
        updatedAt: {
            type: "dateTime",
            required: true,
        },
    },
    indexes: {
        byOrderId: {
            fields: ["orderId"],
        },
        byShopId: {
            fields: ["shopId"],
        },
        byCustomerId: {
            fields: ["customerId"],
        },
    },
});
