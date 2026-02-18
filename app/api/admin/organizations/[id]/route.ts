/**
 * PATCH: update organization in Neon.
 * DELETE: delete organization in Neon.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 })
    }

    const body = await _request.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const updated = await sql`
      UPDATE organizations
      SET name = ${name}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, created_at, updated_at
    `
    const org = updated?.[0]
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }
    return NextResponse.json(org)
  } catch (error) {
    console.error("[api/admin/organizations/[id]] PATCH error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update organization" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 })
    }

    await sql`DELETE FROM organizations WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/admin/organizations/[id]] DELETE error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete organization" },
      { status: 500 }
    )
  }
}
