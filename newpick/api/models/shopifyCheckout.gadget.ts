import { defineModel } from "gadget-server";

export const shopifyCheckout = defineModel({
  name: "shopifyCheckout",
  storageKey: "DataModel-Shopify-Checkout",
  fields: {
    shopId: {
      type: "number",
      required: true,
    },
    checkoutId: {
      type: "string",
      required: true,
    },
    orderId: {
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
    byCheckoutId: {
      fields: ["checkoutId"],
    },
    byShopId: {
      fields: ["shopId"],
    },
    byOrderId: {
      fields: ["orderId"],
    },
  },
});
