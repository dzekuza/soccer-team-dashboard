import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, {
        status: 400,
      });
    }

    // Fetch the coupon code
    const { data: coupon, error } = await supabase
      .from("coupon_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, {
        status: 404,
      });
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return NextResponse.json({ error: "Coupon is inactive" }, {
        status: 400,
      });
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ error: "Coupon is not yet valid" }, {
        status: 400,
      });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({ error: "Coupon has expired" }, {
        status: 400,
      });
    }

    // Check usage limits
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, {
        status: 400,
      });
    }

    // Check minimum order amount
    if (
      orderAmount && coupon.min_order_amount &&
      orderAmount < coupon.min_order_amount
    ) {
      return NextResponse.json({
        error: `Minimum order amount is €${coupon.min_order_amount.toFixed(2)}`,
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (orderAmount * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/coupons/validate:", error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}
