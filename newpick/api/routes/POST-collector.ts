import { RouteHandler } from "gadget-server";

interface TrackingEvent {
  type: "page_view" | "product_view" | "add_to_cart" | "begin_checkout" | "checkout_completed" | "checkout_abandoned";
  shopDomain: string;
  sessionId: string;
  clickId: string | null;
  path: string;
  productId: string | null;
  value: number | null;
  timestamp: string;
}

const route: RouteHandler<{ Body: TrackingEvent }> = async ({ request, reply, logger }) => {
  try {
    // Handle CORS for storefront requests
    await reply.header("Access-Control-Allow-Origin", "*");
    await reply.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    await reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      await reply.code(200).send();
      return;
    }

    const event = request.body;

    // Basic validation - additional validation is handled by the schema
    if (!event) {
      await reply.code(400).send({ error: "No event data provided" });
      return;
    }

    // Extract shop domain from body or headers as fallback
    const shopDomain = event.shopDomain || request.headers["x-shop-domain"] as string;
    
    if (!shopDomain) {
      await reply.code(400).send({ error: "Shop domain is required" });
      return;
    }

    // Log the tracking event
    logger.info({
      eventType: event.type,
      shopDomain,
      sessionId: event.sessionId,
      clickId: event.clickId,
      path: event.path,
      productId: event.productId,
      value: event.value,
      timestamp: event.timestamp,
      userAgent: request.headers["user-agent"],
      ip: request.ip
    }, "Received tracking event");

    // Return success response
    await reply.code(200).send({ 
      success: true, 
      message: "Event received successfully",
      eventId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    logger.error(error, "Error processing tracking event");
    await reply.code(500).send({ 
      error: "Internal server error",
      message: "Failed to process tracking event"
    });
  }
};

route.options = {
  schema: {
    body: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["page_view", "product_view", "add_to_cart", "begin_checkout", "checkout_completed", "checkout_abandoned"]
        },
        shopDomain: { type: "string" },
        sessionId: { type: "string" },
        clickId: { type: ["string", "null"] },
        path: { type: "string" },
        productId: { type: ["string", "null"] },
        value: { type: ["number", "null"] },
        timestamp: { type: "string" }
      },
      required: ["type", "shopDomain", "sessionId", "path", "timestamp"],
      additionalProperties: false
    }
  },
  preHandler: async (request, reply) => {
    // Handle CORS preflight for all requests
    if (request.method === "OPTIONS") {
      await reply.header("Access-Control-Allow-Origin", "*");
      await reply.header("Access-Control-Allow-Methods", "POST, OPTIONS");
      await reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      await reply.code(200).send();
      return;
    }
  }
};

export default route;