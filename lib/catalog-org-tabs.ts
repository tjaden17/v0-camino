/**
 * Fetch tab metadata per org from raw_data_uploads (for catalog API status: partial / missing).
 * Does not load row data; only column names and row type for matching against catalog required columns.
 */

import { sql } from "@/lib/db/neon"

export interface OrgTabMetadata {
  uploadId: string
  rowType: string | null
  columns: string[]
}

/**
 * Returns one entry per upload (tab) for the org: rowType and column list from upload_metadata and column_names.
 */
export async function getOrgTabsMetadata(organizationId: string | null): Promise<OrgTabMetadata[]> {
  if (!organizationId) return []
  try {
    const rows = await sql`
      SELECT id, column_names, upload_metadata
      FROM raw_data_uploads
      WHERE organization_id = ${organizationId}::uuid
      ORDER BY uploaded_at DESC
    ` as {
      id: string
      column_names: string[] | unknown
      upload_metadata: { answers?: { rowType?: string | null } } | null
    }[]
    if (!rows?.length) return []
    return rows.map((r) => {
      const meta = r.upload_metadata ?? {}
      const answers = meta.answers ?? {}
      const columns = Array.isArray(r.column_names) ? r.column_names : (r.column_names as string[]) ?? []
      return {
        uploadId: r.id,
        rowType: answers.rowType ?? null,
        columns,
      }
    })
  } catch {
    return []
  }
}
