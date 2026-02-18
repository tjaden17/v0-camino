/**
 * GET: list organizations from Neon (admin).
 * POST: create organization in Neon (master admin). Fixes hang when admin panel used Supabase for orgs while app data is in Neon.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

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

    const rows = await sql`
      SELECT id, name, created_at, updated_at
      FROM organizations
      ORDER BY created_at DESC
    `
    // Normalise id to string so links and client comparison work (Neon may return UUID type)
    const list = (rows ?? []).map((r: Record<string, unknown>) => ({
      ...r,
      id: r.id != null ? String(r.id) : r.id,
    }))
    return NextResponse.json(list)
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

    const created = await sql`
      INSERT INTO organizations (name, created_by, created_at, updated_at)
      VALUES (${name}, ${user.id}, NOW(), NOW())
      RETURNING id, name, created_at, updated_at
    `
    const org = created?.[0]
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
