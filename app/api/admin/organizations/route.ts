/**
 * GET: list organizations (admin).
 * POST: create organization (master admin).
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: list, error } = await admin
      .from("organizations")
      .select("id, name, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(list ?? [])
  } catch (error) {
    console.error("[api/admin/organizations] GET error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load organizations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (user.email !== "admin@admin.com") {
      return NextResponse.json({ error: "Forbidden: master admin only" }, { status: 403 })
    }

    const body = await request.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: org, error } = await admin
      .from("organizations")
      .insert({ name, created_by: user.id })
      .select()
      .single()

    if (error) {
      throw error
    }
    if (!org) {
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 })
    }

    return NextResponse.json(org)
  } catch (error) {
    console.error("[api/admin/organizations] POST error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create organization" },
      { status: 500 }
    )
  }
}
