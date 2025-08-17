import { defineModel } from "gadget-server";

export const shopifyGdprRequest = defineModel({
  name: "shopifyGdprRequest",
  storageKey: "DataModel-Shopify-GdprRequest",
  fields: {
    shopId: {
      type: "number",
      required: true,
    },
    requestId: {
      type: "string",
      required: true,
    },
    requestType: {
      type: "string",
      required: true,
    },
    customerId: {
      type: "string",
      required: false,
    },
    status: {
      type: "string",
      required: true,
      defaultValue: "pending",
    },
    processedAt: {
      type: "dateTime",
      required: false,
    },
    createdAt: {
      type: "dateTime",
      required: true,
    },
  },
  indexes: {
    byRequestId: {
      fields: ["requestId"],
    },
    byShopId: {
      fields: ["shopId"],
    },
    byStatus: {
      fields: ["status"],
    },
  },
});
