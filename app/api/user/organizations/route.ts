/**
 * POST /api/user/organizations – create organization for the current user (Neon + Supabase sync).
 * Avoids Supabase RLS blocking inserts; app data lives in Neon, Supabase is synced for org membership UI.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

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

    const body = await request.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    // 1. Create organization in Neon
    const created = await sql`
      INSERT INTO organizations (name, created_by, created_at, updated_at)
      VALUES (${name}, ${user.id}, NOW(), NOW())
      RETURNING id, name, created_at, updated_at
    `
    const org = created?.[0] as { id: string; name: string; created_at: string; updated_at: string } | undefined
    if (!org) {
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 })
    }
    const orgId = String(org.id)

    // 2. Update user's profile in Neon
    await sql`
      UPDATE profiles
      SET organization_id = ${orgId}::uuid, updated_at = NOW()
      WHERE id = ${user.id}
    `

    // 3. Sync to Supabase so organization_members / getOrganizationMembers works
    await supabase.from("organizations").upsert(
      { id: orgId, name: org.name, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    )
    await supabase.from("organization_members").insert({
      organization_id: orgId,
      user_id: user.id,
      role: "admin",
      joined_at: new Date().toISOString(),
    })

    return NextResponse.json({ id: orgId, name: org.name, created_at: org.created_at, updated_at: org.updated_at })
  } catch (error) {
    console.error("[api/user/organizations] POST error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create organization" },
      { status: 500 }
    )
  }
}
