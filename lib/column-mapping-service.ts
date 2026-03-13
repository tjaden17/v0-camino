import { createAdminClient } from "@/lib/supabase/admin"

export type ColumnMappingTemplate = import("@/lib/column-mapping-utils").ColumnMappingTemplateShape

/**
 * List all pre-built and org-specific column mapping templates.
 * Global templates have organization_id = NULL; org overrides have organization_id set.
 */
export async function getColumnMappingTemplates(
  organizationId?: string | null
): Promise<ColumnMappingTemplate[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from("column_mappings")
    .select("id, source_tool, row_type, display_name, field_mappings")
    .order("display_name")

  if (organizationId) {
    query = query.or(`organization_id.is.null,organization_id.eq.${organizationId}`)
  } else {
    query = query.is("organization_id", null)
  }

  const { data: rows, error } = await query

  if (error) {
    console.error("[ColumnMappingService] getTemplates error:", error)
    return []
  }

  return (rows || []).map((r: any) => ({
    id: r.id,
    source_tool: r.source_tool,
    row_type: r.row_type,
    display_name: r.display_name,
    field_mappings: r.field_mappings || {},
  }))
}

/**
 * Get one template by source_tool (prefer org-specific if organizationId given).
 */
export async function getColumnMappingBySourceTool(
  sourceTool: string,
  organizationId?: string | null
): Promise<ColumnMappingTemplate | null> {
  const supabase = createAdminClient()

  // Try org-specific first
  if (organizationId) {
    const { data: orgRow } = await supabase
      .from("column_mappings")
      .select("id, source_tool, row_type, display_name, field_mappings")
      .eq("source_tool", sourceTool)
      .eq("organization_id", organizationId)
      .limit(1)
      .maybeSingle()

    if (orgRow) {
      return {
        id: orgRow.id,
        source_tool: orgRow.source_tool,
        row_type: orgRow.row_type,
        display_name: orgRow.display_name,
        field_mappings: orgRow.field_mappings || {},
      }
    }
  }

  // Fall back to global template
  const { data: globalRow } = await supabase
    .from("column_mappings")
    .select("id, source_tool, row_type, display_name, field_mappings")
    .eq("source_tool", sourceTool)
    .is("organization_id", null)
    .limit(1)
    .maybeSingle()

  if (!globalRow) return null

  return {
    id: globalRow.id,
    source_tool: globalRow.source_tool,
    row_type: globalRow.row_type,
    display_name: globalRow.display_name,
    field_mappings: globalRow.field_mappings || {},
  }
}

/** Re-export for callers that use the service. */
export { applyTemplateToColumns } from "@/lib/column-mapping-utils"
