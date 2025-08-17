import { defineModel } from "gadget-server";

export const shopifyShop = defineModel({
  name: "shopifyShop",
  storageKey: "DataModel-Shopify-Shop",
  fields: {
    shopifyId: {
      type: "string",
      required: true,
    },
    domain: {
      type: "string",
      required: true,
    },
    name: {
      type: "string",
      required: false,
    },
    email: {
      type: "string",
      required: false,
    },
    accessToken: {
      type: "string",
      required: true,
    },
    isActive: {
      type: "boolean",
      required: true,
      defaultValue: true,
    },
    planName: {
      type: "string",
      required: false,
    },
    currency: {
      type: "string",
      required: false,
    },
    timezone: {
      type: "string",
      required: false,
    },
  },
  indexes: {
    byShopifyId: {
      fields: ["shopifyId"],
    },
    byDomain: {
      fields: ["domain"],
    },
  },
});
