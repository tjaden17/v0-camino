import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Only allow in development
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  try {
    const supabase = createAdminClient()
    
    const { data: organizations, error } = await supabase
      .from("organizations")
      .select("id, name")
      .order("name")

    if (error) {
      console.error("[v0] Error fetching organizations:", error)
      return NextResponse.json({ organizations: [] })
    }

    return NextResponse.json({ organizations: organizations || [] })
  } catch (error) {
    console.error("[v0] Organizations API error:", error)
    return NextResponse.json({ organizations: [] })
  }
}
