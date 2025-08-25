import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: post, error } = await supabase
      .from("banga_posts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      return NextResponse.json(
        { error: "Failed to fetch post" },
        { status: 500 },
      );
    }

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 },
      );
    }

    const response = NextResponse.json({ post });

    // Add cache control headers to prevent caching
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error in get post API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error } = await supabase
      .from("banga_posts")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting post:", error);
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete post API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
