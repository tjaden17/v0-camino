import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get("orgId")

  try {
    const supabase = createAdminClient()
    
    let query = supabase
      .from("profiles")
      .select("id, email, full_name")
      .order("full_name")

    if (orgId) {
      query = query.eq("organization_id", orgId)
    }

    const { data: users, error } = await query.limit(50)

    if (error) {
      console.error("[v0] Error fetching users:", error)
      return NextResponse.json({ users: [] })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error("[v0] Users API error:", error)
    return NextResponse.json({ users: [] })
  }
}
