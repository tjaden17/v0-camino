/**
 * GET /api/upload/discovery?limit=10
 * Returns staged uploads for the current org (from raw_data_uploads) for mining:
 * column names, upload_metadata (answers, signal definitions), total_rows, uploaded_at.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileResult = await sql`
      SELECT organization_id FROM profiles WHERE id = ${user.id} LIMIT 1
    `
    const profileOrgId = profileResult?.[0]?.organization_id ?? null
    const { searchParams } = new URL(request.url)
    const orgParam = searchParams.get("organizationId")
    const organizationId = orgParam != null && orgParam !== "" ? orgParam : profileOrgId

    if (!organizationId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 })
    }

    const limitParam = searchParams.get("limit")
    const limit = Math.min(MAX_LIMIT, Math.max(1, limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT))

    const uploads = await sql`
      SELECT id, upload_name, file_name, source_type, total_rows, column_names, upload_metadata, uploaded_at
      FROM raw_data_uploads
      WHERE organization_id = ${organizationId}::uuid
      ORDER BY uploaded_at DESC
      LIMIT ${limit}
    `

    const list = (Array.isArray(uploads) ? uploads : []).map((u: Record<string, unknown>) => ({
      id: u.id,
      uploadName: u.upload_name,
      fileName: u.file_name,
      sourceType: u.source_type,
      totalRows: u.total_rows,
      columnNames: u.column_names,
      uploadMetadata: u.upload_metadata,
      uploadedAt: u.uploaded_at,
    }))

    return NextResponse.json({ success: true, uploads: list })
  } catch (error) {
    console.error("[v0] Discovery error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Discovery failed" },
      { status: 500 }
    )
  }
}
