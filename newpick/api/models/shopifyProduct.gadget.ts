import { defineModel } from "gadget-server";

export const shopifyProduct = defineModel({
  name: "shopifyProduct",
  storageKey: "DataModel-Shopify-Product",
  fields: {
    shopId: {
      type: "number",
      required: true,
    },
    productId: {
      type: "string",
      required: true,
    },
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: false,
    },
    vendor: {
      type: "string",
      required: false,
    },
    productType: {
      type: "string",
      required: false,
    },
    status: {
      type: "string",
      required: true,
    },
    publishedAt: {
      type: "dateTime",
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
    byProductId: {
      fields: ["productId"],
    },
    byShopId: {
      fields: ["shopId"],
    },
    byStatus: {
      fields: ["status"],
    },
  },
});
