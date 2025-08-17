import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sessionId = searchParams.get("session_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("shop_orders")
      .select(`
        *,
        shop_order_items (
          id,
          product_name,
          product_sku,
          variant_attributes,
          quantity,
          unit_price,
          total_price
        )
      `)
      .order("created_at", { ascending: false });

    if (sessionId) {
      query = query.eq("stripe_session_id", sessionId);
    } else if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Add pagination only if not searching by session_id
    if (!sessionId) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching shop orders:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: "Failed to fetch orders",
      details: message,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      cartItems,
      stripeSessionId,
      couponCode,
      couponDiscount,
    } = await request.json();

    if (
      !customerName || !customerEmail || !deliveryAddress || !cartItems ||
      !Array.isArray(cartItems) || cartItems.length === 0
    ) {
      return NextResponse.json({ error: "Missing required fields" }, {
        status: 400,
      });
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0,
    );
    const discountAmount = couponDiscount || 0;
    const totalAmount = subtotal - discountAmount;

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("shop_orders")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        subtotal,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        coupon_code: couponCode,
        coupon_discount: couponDiscount,
        stripe_session_id: stripeSessionId,
        created_by: user.id,
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.name,
      product_sku: item.sku,
      variant_attributes: item.variantAttributes,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("shop_order_items")
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: orderItems,
      },
    });
  } catch (error) {
    console.error("Error creating shop order:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: "Failed to create order",
      details: message,
    }, { status: 500 });
  }
}
