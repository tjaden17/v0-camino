/**
 * GET /api/admin/organizations/[id]/catalog
 * Returns the 7 catalog signals for the given org (same shape as user /api/signals/catalog).
 * Used by admin to see "what the user sees" for that organization.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"
import { getCatalogSignalsForRole, hasRequiredColumns, ROW_TYPE_TO_SOURCE } from "@/lib/mss-catalog"
import { getOrgTabsMetadata } from "@/lib/catalog-org-tabs"
import type { CatalogSignalItem } from "@/app/api/signals/catalog/route"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: orgId } = await params
    if (!orgId) {
      return NextResponse.json({ error: "Organization id required" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") ?? "manager"

    const catalogSignals = getCatalogSignalsForRole(role)
    const tabs = await getOrgTabsMetadata(orgId)

    let signalsByName: Record<string, { id: string; absolute_value: string | null; trend: string | null }> = {}
    if (catalogSignals.length > 0) {
      const names = catalogSignals.map((s) => s.name)
      const rows = await sql`
        SELECT id, name, absolute_value, trend
        FROM signals
        WHERE organization_id = ${orgId}::uuid
          AND name = ANY(${names})
      ` as { id: string; name: string; absolute_value: string | null; trend: string | null }[]
      for (const r of rows ?? []) {
        signalsByName[r.name] = { id: r.id, absolute_value: r.absolute_value, trend: r.trend }
      }
    }

    const trendForUI = (t: string | null | undefined): string =>
      t === "up" ? "increasing" : t === "down" ? "decreasing" : (t || "stable")

    const sourceLabel: Record<string, string> = {
      deals: "deals",
      leads: "leads",
      tickets: "tickets",
    }

    const result: CatalogSignalItem[] = catalogSignals.map((signal) => {
      const dbSignal = signalsByName[signal.name]
      const tabsOfType = tabs.filter((t) => ROW_TYPE_TO_SOURCE[t.rowType ?? ""] === signal.sourceType)

      if (dbSignal && dbSignal.absolute_value !== null && dbSignal.absolute_value !== "") {
        const value = parseFloat(dbSignal.absolute_value)
        return {
          id: signal.id,
          name: signal.name,
          category: signal.category,
          status: "calculated" as const,
          value: !Number.isNaN(value) ? value : null,
          formattedValue: dbSignal.absolute_value,
          trend: trendForUI(dbSignal.trend),
          trendPercentage: null,
          signalId: dbSignal.id,
        }
      }

      if (tabsOfType.length === 0) {
        const required = signal.requiredColumns.join(", ")
        return {
          id: signal.id,
          name: signal.name,
          category: signal.category,
          status: "missing" as const,
          message: `Upload ${sourceLabel[signal.sourceType] ?? signal.sourceType} data with ${required} to unlock ${signal.name}.`,
          requiredColumns: signal.requiredColumns,
        }
      }

      const firstTab = tabsOfType[0]
      const { ok, missing } = hasRequiredColumns(firstTab.columns, signal)
      if (!ok && missing.length > 0) {
        return {
          id: signal.id,
          name: signal.name,
          category: signal.category,
          status: "partial" as const,
          message: `Add column${missing.length > 1 ? "s" : ""} "${missing.join('", "')}" to calculate ${signal.name}.`,
          requiredColumns: signal.requiredColumns,
        }
      }

      return {
        id: signal.id,
        name: signal.name,
        category: signal.category,
        status: "partial" as const,
        message: `Re-upload your ${sourceLabel[signal.sourceType] ?? signal.sourceType} file to update ${signal.name}.`,
        requiredColumns: signal.requiredColumns,
      }
    })

    return NextResponse.json({ success: true, signals: result })
  } catch (error) {
    console.error("[v0] GET /api/admin/organizations/[id]/catalog error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load catalog" },
      { status: 500 }
    )
  }
}
