import { sql } from "@/lib/db/neon"

export type ColumnMappingTemplate = import("@/lib/column-mapping-utils").ColumnMappingTemplateShape

/**
 * List all pre-built and org-specific column mapping templates.
 * Global templates have organization_id = NULL; org overrides have organization_id set.
 */
export async function getColumnMappingTemplates(
  organizationId?: string | null
): Promise<ColumnMappingTemplate[]> {
  const rows = await sql`
    SELECT id, source_tool, row_type, display_name, field_mappings
    FROM column_mappings
    WHERE organization_id IS NULL
       OR organization_id = ${organizationId ?? null}
    ORDER BY display_name
  `
  return (rows as { id: string; source_tool: string; row_type: string; display_name: string; field_mappings: Record<string, string | string[] | undefined> }[]).map((r) => ({
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
  const orgRow = organizationId
    ? await sql`
        SELECT id, source_tool, row_type, display_name, field_mappings
        FROM column_mappings
        WHERE source_tool = ${sourceTool} AND organization_id = ${organizationId}
        LIMIT 1
      `
    : []
  const row = orgRow?.[0] ?? (await sql`
    SELECT id, source_tool, row_type, display_name, field_mappings
    FROM column_mappings
    WHERE source_tool = ${sourceTool} AND organization_id IS NULL
    LIMIT 1
  `)?.[0]
  if (!row) return null
  const r = row as { id: string; source_tool: string; row_type: string; display_name: string; field_mappings: Record<string, string | string[] | undefined> }
  return {
    id: r.id,
    source_tool: r.source_tool,
    row_type: r.row_type,
    display_name: r.display_name,
    field_mappings: r.field_mappings || {},
  }
}

/**
 * Save an org-scoped custom template (from a completed non-Zoho upload).
 * field_mappings must include: metric, date, columns (array); optional: custom_row_label, group_by_columns (array).
 */
export async function saveColumnMappingTemplate(
  organizationId: string,
  displayName: string,
  rowType: string,
  fieldMappings: Record<string, string | string[] | undefined>
): Promise<ColumnMappingTemplate> {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "custom"
  const sourceTool = `custom-${slug}-${Date.now().toString(36)}`

  const rows = await sql`
    INSERT INTO column_mappings (organization_id, source_tool, row_type, display_name, field_mappings)
    VALUES (${organizationId}, ${sourceTool}, ${rowType}, ${displayName}, ${JSON.stringify(fieldMappings)}::jsonb)
    RETURNING id, source_tool, row_type, display_name, field_mappings
  `
  const r = (rows as { id: string; source_tool: string; row_type: string; display_name: string; field_mappings: Record<string, string | string[] | undefined> }[])[0]
  if (!r) throw new Error("Insert failed")
  return {
    id: r.id,
    source_tool: r.source_tool,
    row_type: r.row_type,
    display_name: r.display_name,
    field_mappings: r.field_mappings || {},
  }
}

/** Re-export for callers that use the service. */
export { applyTemplateToColumns, templateMatchesColumns } from "@/lib/column-mapping-utils"
