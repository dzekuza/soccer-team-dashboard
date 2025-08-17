import { defineSettings } from "gadget-server";

export const settings = defineSettings({
  name: "newpick",
  environment: "development",
  connections: {
    shopify: {
      enabled: true,
      scopes: [
        "read_products",
        "write_products", 
        "read_orders",
        "write_orders",
        "read_customers",
        "write_customers",
        "read_inventory",
        "write_inventory",
        "read_marketing_events",
        "write_marketing_events"
      ]
    }
  }
});

