import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `team-logo-${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from("team-logo")
      .upload(fileName, file, { upsert: false })
    if (error) throw new Error(error.message)
    // Return the filename (not the public URL)
    return NextResponse.json({ filename: fileName })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
} 