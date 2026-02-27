/**
 * Pure helpers for column mapping templates (no DB).
 * Used by upload client and column-mapping-service.
 * field_mappings: for Zoho templates, normalized key -> column name; for saved custom, metric/date/custom_row_label/group_by_columns/columns.
 */
export interface ColumnMappingTemplateShape {
  id: string
  source_tool: string
  row_type: string
  display_name: string
  field_mappings: Record<string, string | string[] | undefined>
}

export interface ApplyTemplateResult {
  rowType: string | null
  metricColumn: string | null
  dateColumn: string | null
  customRowLabel?: string | null
  groupByColumns?: string[]
}

/**
 * Map template fields to tab answers using the CSV columns that exist.
 * For "custom" template with no saved mapping, returns nulls.
 * For saved custom templates (field_mappings.metric / .columns), returns full answers including customRowLabel and groupByColumns.
 */
export function applyTemplateToColumns(
  template: ColumnMappingTemplateShape,
  csvColumns: string[]
): ApplyTemplateResult {
  if (template.row_type === "custom" && !template.field_mappings.metric && !template.field_mappings.columns) {
    return { rowType: null, metricColumn: null, dateColumn: null }
  }

  const colSet = new Set(csvColumns.map((c) => c.trim()))
  const findCol = (normalizedField: string): string | null => {
    const csvCol = template.field_mappings[normalizedField]
    if (csvCol == null) return null
    const trimmed = String(csvCol).trim()
    const exact = csvColumns.find((c) => c.trim() === trimmed)
    if (exact) return exact
    if (colSet.has(trimmed)) return trimmed
    const byLower = csvColumns.find((c) => c.trim().toLowerCase() === trimmed.toLowerCase())
    if (byLower) return byLower
    return null
  }

  // Saved custom template: metric, date, custom_row_label, group_by_columns, columns
  const savedMetric = template.field_mappings.metric
  const savedDate = template.field_mappings.date
  const savedCustomLabel = template.field_mappings.custom_row_label
  const savedGroupBy = template.field_mappings.group_by_columns

  if (savedMetric != null || savedDate != null) {
    const rowType = (template.row_type === "custom" ? "other" : template.row_type) as string
    const resolveStoredCol = (stored: string | undefined): string | null => {
      if (stored == null) return null
      const s = String(stored).trim()
      const exact = csvColumns.find((c) => c.trim() === s)
      if (exact) return exact
      const byLower = csvColumns.find((c) => c.trim().toLowerCase() === s.toLowerCase())
      return byLower ?? null
    }
    const metricColumn = savedMetric != null ? resolveStoredCol(String(savedMetric)) ?? "none" : "none"
    const dateColumn = savedDate != null ? resolveStoredCol(String(savedDate)) : null
    let groupByColumns: string[] = []
    if (Array.isArray(savedGroupBy) && savedGroupBy.length > 0) {
      groupByColumns = savedGroupBy
        .map((col) => resolveStoredCol(String(col)))
        .filter((c): c is string => c != null)
    }
    return {
      rowType,
      metricColumn: metricColumn ?? "none",
      dateColumn,
      customRowLabel: savedCustomLabel != null ? String(savedCustomLabel).trim() || null : null,
      groupByColumns,
    }
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

/**
 * Returns true if the file's columns match the template (exact or template columns ⊆ file columns).
 * Templates store column list in field_mappings.columns (array).
 */
export function templateMatchesColumns(
  template: ColumnMappingTemplateShape,
  csvColumns: string[]
): boolean {
  const stored = template.field_mappings.columns
  if (!Array.isArray(stored) || stored.length === 0) return false
  const fileSet = new Set(csvColumns.map((c) => c.trim().toLowerCase()))
  return stored.every((col) => fileSet.has(String(col).trim().toLowerCase()))
}
