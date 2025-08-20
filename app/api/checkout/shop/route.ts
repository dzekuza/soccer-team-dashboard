import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CartItem } from "@/context/cart-context";
import { getAppUrl } from "@/lib/utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
    try {
        const {
            cartItems,
            purchaserEmail,
            purchaserName,
            purchaserPhone,
            deliveryAddress,
            couponId,
        } = await request.json();

        if (
            !cartItems || !Array.isArray(cartItems) || cartItems.length === 0 ||
            !purchaserEmail || !purchaserName
        ) {
            return NextResponse.json({ error: "Trūksta privalomų laukų" }, {
                status: 400,
            });
        }

        const line_items = cartItems.map((item: CartItem) => {
            return {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: item.name,
                        description: item.category,
                        images: [item.image],
                    },
                    unit_amount: Math.round(item.price * 100), // Price in cents
                },
                quantity: item.quantity,
            };
        });

        console.log("🛒 Creating shop checkout session with metadata:", {
            purchaserName,
            purchaserEmail,
            purchaserPhone,
            itemCount: cartItems.length,
        });

        // Get the origin from the request headers or environment variables
        const origin = getAppUrl(request.headers.get("origin"));

        // Create Stripe Checkout session for shop products
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: line_items,
            mode: "payment",
            customer_email: purchaserEmail,
            success_url:
                `${origin}/checkout/shop-success?session_id={CHECKOUT_SESSION_ID}&customer_name=${
                    encodeURIComponent(purchaserName)
                }&customer_email=${
                    encodeURIComponent(purchaserEmail)
                }&customer_phone=${encodeURIComponent(purchaserPhone || "")}`,
            cancel_url: `${origin}/shop`,
            metadata: {
                purchaseType: "shop",
                purchaserName,
                purchaserEmail,
                purchaserPhone: purchaserPhone || "",
                deliveryAddress: JSON.stringify(deliveryAddress || {}),
                couponId: couponId || "",
                cart: JSON.stringify(cartItems.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    name: item.name,
                    price: item.price,
                    color: item.color || null,
                }))),
            },
        });

        console.log("✅ Shop checkout session created:", session.id);
        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("❌ Shop Stripe Checkout session error:", error);
        return NextResponse.json({
            error: "Failed to create shop Stripe session",
        }, { status: 500 });
    }
}
