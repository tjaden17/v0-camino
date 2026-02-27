/**
 * DELETE /api/admin/organizations/[id]/members/[userId]
 * Remove a member from an organization: clear Neon profile.organization_id and delete Supabase organization_members row.
 * Members list is loaded from Neon (details API), so we must update Neon for the member to disappear.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sql } from "@/lib/db/neon"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
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

    const { id: orgId, userId } = await params
    if (!orgId || !userId) {
      return NextResponse.json({ error: "Organization id and user id required" }, { status: 400 })
    }

    // 1. Clear organization_id in Neon (so details API no longer returns this member)
    const neonResult = await sql`
      UPDATE profiles
      SET organization_id = NULL
      WHERE id = ${userId}::uuid AND organization_id = ${orgId}::uuid
      RETURNING id
    `
    if (!neonResult?.length) {
      return NextResponse.json(
        { error: "Member not found or not in this organization" },
        { status: 404 }
      )
    }

    // 2. Remove from Supabase organization_members (by org + user, no membership row id needed)
    try {
      const admin = createAdminClient()
      await admin
        .from("organization_members")
        .delete()
        .eq("organization_id", orgId)
        .eq("user_id", userId)
    } catch (e) {
      console.error("[api/admin/organizations/.../members] Supabase delete:", e)
      // Neon already updated; non-fatal if Supabase row missing or different
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/admin/organizations/.../members] DELETE error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove member" },
      { status: 500 }
    )
  }
}
