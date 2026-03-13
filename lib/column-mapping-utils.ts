/**
 * Pure helpers for column mapping templates (no DB).
 * Used by upload client and column-mapping-service.
 */

export interface ColumnMappingTemplateShape {
  id: string
  source_tool: string
  row_type: string
  display_name: string
  field_mappings: Record<string, string>
}

/**
 * Map template fields to tab answers using the CSV columns that exist.
 * Returns { rowType, metricColumn, dateColumn } for the 3-question flow.
 */
export function applyTemplateToColumns(
  template: ColumnMappingTemplateShape,
  csvColumns: string[]
): { rowType: string; metricColumn: string | null; dateColumn: string | null } {
  const colSet = new Set(csvColumns.map((c) => c.trim()))
  const findCol = (normalizedField: string): string | null => {
    const csvCol = template.field_mappings[normalizedField]
    if (!csvCol) return null
    const trimmed = csvCol.trim()
    const exact = csvColumns.find((c) => c.trim() === trimmed)
    if (exact) return exact
    if (colSet.has(trimmed)) return trimmed
    const byLower = csvColumns.find((c) => c.trim().toLowerCase() === trimmed.toLowerCase())
    if (byLower) return byLower
    return null
  }

  const rowType = template.row_type

  let metricColumn: string | null = null
  if (template.row_type === "deals") {
    metricColumn = findCol("deal_value")
  } else if (template.row_type === "tickets") {
    metricColumn = findCol("resolution_time")
  }
  if (!metricColumn) metricColumn = "none"

  const dateColumn = findCol("close_date") ?? findCol("created") ?? null

  return { rowType, metricColumn, dateColumn }
}
