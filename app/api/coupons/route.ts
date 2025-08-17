import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all coupon codes
    const { data: coupons, error } = await supabase
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
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    const { data: existingCoupon } = await supabase
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
    const { data: coupon, error } = await supabase
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
        created_by: user.id,
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
