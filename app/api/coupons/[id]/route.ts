import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const { data: coupon, error } = await supabase
      .from("coupon_codes")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Coupon not found" }, {
          status: 404,
        });
      }
      console.error("Error fetching coupon:", error);
      return NextResponse.json({ error: "Failed to fetch coupon" }, {
        status: 500,
      });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error in GET /api/coupons/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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
      is_active,
    } = body;

    // Validate discount type if provided
    if (discount_type && !["percentage", "fixed"].includes(discount_type)) {
      return NextResponse.json({ error: "Invalid discount type" }, {
        status: 400,
      });
    }

    // Validate discount value if provided
    if (
      discount_type === "percentage" && discount_value &&
      (discount_value <= 0 || discount_value > 100)
    ) {
      return NextResponse.json({
        error: "Percentage must be between 0 and 100",
      }, { status: 400 });
    }

    if (discount_type === "fixed" && discount_value && discount_value <= 0) {
      return NextResponse.json({
        error: "Fixed discount must be greater than 0",
      }, { status: 400 });
    }

    // Check if code already exists (if updating code)
    if (code) {
      const { data: existingCoupon } = await supabase
        .from("coupon_codes")
        .select("id")
        .eq("code", code.toUpperCase())
        .neq("id", params.id)
        .single();

      if (existingCoupon) {
        return NextResponse.json({ error: "Coupon code already exists" }, {
          status: 400,
        });
      }
    }

    // Update coupon
    const updateData: any = {};
    if (code) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (discount_type) updateData.discount_type = discount_type;
    if (discount_value !== undefined) {
      updateData.discount_value = discount_value;
    }
    if (max_uses !== undefined) updateData.max_uses = max_uses;
    if (min_order_amount !== undefined) {
      updateData.min_order_amount = min_order_amount;
    }
    if (valid_from !== undefined) updateData.valid_from = valid_from;
    if (valid_until !== undefined) updateData.valid_until = valid_until;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: coupon, error } = await supabase
      .from("coupon_codes")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating coupon:", error);
      return NextResponse.json({ error: "Failed to update coupon" }, {
        status: 500,
      });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error in PUT /api/coupons/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const { error } = await supabase
      .from("coupon_codes")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting coupon:", error);
      return NextResponse.json({ error: "Failed to delete coupon" }, {
        status: 500,
      });
    }

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/coupons/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, {
      status: 500,
    });
  }
}
