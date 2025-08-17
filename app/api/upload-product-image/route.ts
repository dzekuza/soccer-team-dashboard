import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-service";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, {
            status: 400,
        });
    }

    // Validate file type
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({
            error: "Invalid file type. Only images are allowed.",
        }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return NextResponse.json({
            error: "File too large. Maximum size is 5MB.",
        }, { status: 400 });
    }

    try {
        const fileExt = file.name.split(".").pop();
        const fileName = `product-${Date.now()}-${
            Math.random().toString(36).substring(2)
        }.${fileExt}`;

        console.log(
            "Attempting to upload file:",
            fileName,
            "to bucket: team-logo",
        );

        const { data, error } = await supabaseAdmin.storage
            .from("team-logo")
            .upload(fileName, file, {
                upsert: false,
                cacheControl: "3600",
                contentType: file.type,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            throw new Error(error.message);
        }

        console.log("File uploaded successfully:", data);

        // Get the public URL
        const { data: urlData } = supabaseAdmin.storage
            .from("team-logo")
            .getPublicUrl(fileName);

        console.log("Public URL generated:", urlData.publicUrl);

        return NextResponse.json({
            filename: fileName,
            url: urlData.publicUrl,
            success: true,
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({
            error: error.message || "Upload failed",
        }, { status: 500 });
    }
}
