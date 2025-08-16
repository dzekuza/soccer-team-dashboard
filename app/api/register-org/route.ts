import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.email || !body.name || !body.organizationName) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Trūksta privalomų laukų. Pateikite userId, email, name ir organizationName." 
        }, 
        { status: 400 }
      );
    }

    console.log("Registering user with data:", {
      ...body,
      email: body.email.replace(/(?<=.).(?=.*@)/g, '*') // Log email with middle chars masked
    });

    const user = await supabaseService.registerUserWithCorporation(body);
    
    console.log("Successfully registered user:", {
      userId: user.userId,
      corporationId: user.corporationId
    });

    return NextResponse.json({ success: true, user });
  } catch (e) {
    const error = e as Error;
    console.error("Error in registration:", {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: "An error occurred during registration. Please try again or contact support."
      }, 
      { status: 500 }
    );
  }
} 