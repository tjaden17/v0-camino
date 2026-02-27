/**
 * POST /api/admin/organizations/[id]/signals/delete – delete signals (and their data points) from Neon.
 * Used by the org details page when "Delete All Signals" or single signal delete is used.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

export async function POST(
  request: NextRequest,
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

    const body = await request.json()
    const signalIds = Array.isArray(body.signalIds) ? body.signalIds : []
    if (signalIds.length === 0) {
      return NextResponse.json({ error: "signalIds array required" }, { status: 400 })
    }

    for (const signalId of signalIds) {
      const id = String(signalId).trim()
      if (!id) continue
      try {
        await sql`DELETE FROM signal_data_points WHERE signal_id = ${id}::uuid`
        await sql`DELETE FROM signals WHERE id = ${id}::uuid`
      } catch (e) {
        console.error("[api/admin/organizations/.../signals/delete]", id, e)
        return NextResponse.json(
          { error: "Failed to delete one or more signals" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[api/admin/organizations/.../signals/delete]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete signals" },
      { status: 500 }
    )
  }
}
