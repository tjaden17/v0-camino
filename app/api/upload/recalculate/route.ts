/**
 * POST /api/upload/recalculate
 * Re-run signal calculations over the last N staged uploads (from raw_data_uploads + raw_data_rows).
 * Uses the same logic as the generate route with _recalc: true.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"

const DEFAULT_LIMIT = 5
const MAX_LIMIT = 20

function inferColumnTypes(columns: string[], rows: Record<string, string>[]): Record<string, "text" | "number" | "date" | "id"> {
  const types: Record<string, "text" | "number" | "date" | "id"> = {}
  const sample = rows.slice(0, Math.min(100, rows.length))
  for (const col of columns) {
    let numberCount = 0
    let dateCount = 0
    for (const row of sample) {
      const v = row[col]
      if (v == null || v === "") continue
      if (!Number.isNaN(Number(v.replace(/[$€£¥,\s%]/g, "")))) numberCount++
      const d = new Date(v.trim())
      if (!Number.isNaN(d.getTime()) && d.getFullYear() > 1990) dateCount++
    }
    if (dateCount > numberCount && dateCount > sample.length * 0.3) types[col] = "date"
    else if (numberCount > sample.length * 0.5) types[col] = "number"
    else types[col] = "text"
  }
  return types
}

export async function POST(request: Request) {
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
    const body = await request.json().catch(() => ({})) as { organizationId?: string | null; limit?: number }
    const organizationId = body.organizationId != null && body.organizationId !== "" ? body.organizationId : profileOrgId

    if (!organizationId) {
      return NextResponse.json({ error: "Organization required for recalc" }, { status: 400 })
    }

    const limit = Math.min(MAX_LIMIT, Math.max(1, body.limit ?? DEFAULT_LIMIT))

    const uploads = await sql`
      SELECT id, upload_name, file_name, total_rows, column_names, upload_metadata, uploaded_at
      FROM raw_data_uploads
      WHERE organization_id = ${organizationId}::uuid
      ORDER BY uploaded_at DESC
      LIMIT ${limit}
    ` as { id: string; upload_name: string; file_name: string; total_rows: number; column_names: string[]; upload_metadata: Record<string, unknown>; uploaded_at: string }[]

    if (!uploads?.length) {
      return NextResponse.json({
        success: true,
        message: "No staged uploads to recalculate",
        signalsUpdated: 0,
        uploadsProcessed: 0,
      })
    }

    const tabKeyToRawUploadId: Record<string, string> = {}
    const tabs: {
      tabKey: string
      tabName: string
      fileName: string
      rowCount: number
      columns: string[]
      columnTypes: Record<string, "text" | "number" | "date" | "id">
      answers: { rowType: string | null; metricColumn: string | null; dateColumn: string | null; customRowLabel?: string | null }
      rows: Record<string, string>[]
    }[] = []
    const signals: { name: string; description: string; operation: string; valueColumn: string | null; dateColumn: string | null; groupByColumn: string | null; tabKey: string; tabName: string }[] = []

    for (const u of uploads) {
      const meta = (u.upload_metadata || {}) as {
        tabKey?: string
        tabName?: string
        answers?: { rowType?: string | null; metricColumn?: string | null; dateColumn?: string | null; customRowLabel?: string | null }
        signalDefinitions?: { name: string; description: string; operation: string; valueColumn: string | null; dateColumn: string | null; groupByColumn: string | null; tabKey: string; tabName: string }[]
        columnTypes?: Record<string, "text" | "number" | "date" | "id">
      }
      const tabKey = meta.tabKey ?? u.id
      const tabName = meta.tabName ?? u.upload_name
      tabKeyToRawUploadId[tabKey] = u.id

      const rowsResult = await sql`
        SELECT row_index, original_data
        FROM raw_data_rows
        WHERE upload_id = ${u.id}::uuid
        ORDER BY row_index ASC
      ` as { row_index: number; original_data: Record<string, string> }[]

      const rows = (rowsResult ?? []).map((r) => r.original_data)
      const columns = Array.isArray(u.column_names) ? u.column_names : (u.column_names as unknown as string[]) ?? []
      const columnTypes = meta.columnTypes ?? inferColumnTypes(columns, rows)

      tabs.push({
        tabKey,
        tabName,
        fileName: u.file_name ?? "upload",
        rowCount: rows.length,
        columns,
        columnTypes,
        answers: {
          rowType: meta.answers?.rowType ?? null,
          metricColumn: meta.answers?.metricColumn ?? null,
          dateColumn: meta.answers?.dateColumn ?? null,
          customRowLabel: meta.answers?.customRowLabel ?? null,
        },
        rows,
      })

      const defs = meta.signalDefinitions ?? []
      for (const d of defs) {
        signals.push({
          name: d.name,
          description: d.description ?? "",
          operation: d.operation,
          valueColumn: d.valueColumn ?? null,
          dateColumn: d.dateColumn ?? null,
          groupByColumn: d.groupByColumn ?? null,
          tabKey,
          tabName,
        })
      }
    }

    if (signals.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No signal definitions in staged uploads",
        signalsUpdated: 0,
        uploadsProcessed: uploads.length,
      })
    }

    const origin = new URL(request.url).origin
    const res = await fetch(`${origin}/api/upload/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: request.headers.get("cookie") ?? "" },
      body: JSON.stringify({
        tabs,
        signals,
        organizationId,
        _recalc: true,
        _tabKeyToRawUploadId: tabKeyToRawUploadId,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json({
      success: true,
      signalsUpdated: data.signalsCreated ?? 0,
      uploadsProcessed: uploads.length,
      errors: data.errors,
    })
  } catch (error) {
    console.error("[v0] Recalculate error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recalculate failed" },
      { status: 500 }
    )
  }
}
