import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-service";

export async function GET() {
  try {
    // For admin operations, we'll use the admin client directly
    // In a production environment, you should still validate the user's session

    // Fetch all coupon codes
    const { data: coupons, error } = await supabaseAdmin
      .from("coupon_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coupons:", error);
      return NextResponse.json({ error: "Failed to fetch coupons" }, {
        status: 500,
      });
    }

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Error in GET /api/coupons:", error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // For admin operations, we'll use the admin client directly
    // In a production environment, you should still validate the user's session

    const body = await request.json();
    const {
      code,
      description,
      discount_type,
      discount_value,
      max_uses,
      min_order_amount,
      valid_from,
      valid_until,
    } = body;

    // Validate required fields
    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ error: "Missing required fields" }, {
        status: 400,
      });
    }

    // Validate discount type
    if (!["percentage", "fixed"].includes(discount_type)) {
      return NextResponse.json({ error: "Invalid discount type" }, {
        status: 400,
      });
    }

    // Validate discount value
    if (
      discount_type === "percentage" &&
      (discount_value <= 0 || discount_value > 100)
    ) {
      return NextResponse.json({
        error: "Percentage must be between 0 and 100",
      }, { status: 400 });
    }

    if (discount_type === "fixed" && discount_value <= 0) {
      return NextResponse.json({
        error: "Fixed discount must be greater than 0",
      }, { status: 400 });
    }

    // Check if code already exists
    const { data: existingCoupon } = await supabaseAdmin
      .from("coupon_codes")
      .select("id")
      .eq("code", code.toUpperCase())
      .single();

    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, {
        status: 400,
      });
    }

    // Create new coupon
    const { data: coupon, error } = await supabaseAdmin
      .from("coupon_codes")
      .insert({
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        max_uses,
        min_order_amount: min_order_amount || 0,
        valid_from: valid_from || new Date().toISOString(),
        valid_until,
        created_by: null, // We'll set this to null for now since we're using admin client
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating coupon:", error);
      return NextResponse.json({ error: "Failed to create coupon" }, {
        status: 500,
      });
    }

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/coupons:", error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}
