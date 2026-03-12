/**
 * One-time migration script: Copy data from Neon to Supabase.
 *
 * Prerequisites:
 *   - Run scripts/015_consolidate_signal_data_points.sql in Supabase first
 *   - Set environment variables:
 *     NEON_DATABASE_URL  (source - Neon)
 *     SUPABASE_URL       (destination - Supabase)
 *     SUPABASE_SERVICE_ROLE_KEY (destination - Supabase)
 *
 * Usage:
 *   node scripts/migrate-neon-to-supabase.mjs
 */

import { neon } from "@neondatabase/serverless"
import { createClient } from "@supabase/supabase-js"

const NEON_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!NEON_URL) {
  console.error("Missing NEON_DATABASE_URL or DATABASE_URL")
  process.exit(1)
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const sql = neon(NEON_URL)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function migrateTable(tableName, conflictColumn) {
  console.log(`\n--- Migrating ${tableName} ---`)

  try {
    const rows = await sql`SELECT * FROM ${sql(tableName)}`
    console.log(`  Neon: ${rows.length} rows found`)

    if (rows.length === 0) {
      console.log(`  Skipping (empty table)`)
      return { table: tableName, neonCount: 0, migratedCount: 0 }
    }

    // Batch upsert in chunks of 500
    const BATCH_SIZE = 500
    let migratedCount = 0

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE)

      const { error } = conflictColumn
        ? await supabase.from(tableName).upsert(batch, { onConflict: conflictColumn, ignoreDuplicates: true })
        : await supabase.from(tableName).insert(batch)

      if (error) {
        console.error(`  Error in batch ${i}-${i + batch.length}:`, error.message)
        // Try individual inserts for failed batch
        for (const row of batch) {
          const { error: rowError } = conflictColumn
            ? await supabase.from(tableName).upsert(row, { onConflict: conflictColumn, ignoreDuplicates: true })
            : await supabase.from(tableName).insert(row)

          if (!rowError) migratedCount++
        }
      } else {
        migratedCount += batch.length
      }
    }

    console.log(`  Supabase: ${migratedCount} rows migrated`)
    return { table: tableName, neonCount: rows.length, migratedCount }
  } catch (err) {
    console.error(`  Error migrating ${tableName}:`, err.message || err)
    return { table: tableName, neonCount: -1, migratedCount: 0, error: err.message }
  }
}

async function migrateProfileKPIs() {
  console.log(`\n--- Migrating KPI columns on profiles ---`)

  try {
    const rows = await sql`
      SELECT id, kpi_1, kpi_2, kpi_3 FROM profiles
      WHERE kpi_1 IS NOT NULL OR kpi_2 IS NOT NULL OR kpi_3 IS NOT NULL
    `
    console.log(`  Neon: ${rows.length} profiles with KPIs`)

    let updated = 0
    for (const row of rows) {
      const updateData = {}
      if (row.kpi_1) updateData.kpi_1 = row.kpi_1
      if (row.kpi_2) updateData.kpi_2 = row.kpi_2
      if (row.kpi_3) updateData.kpi_3 = row.kpi_3

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", row.id)

        if (!error) updated++
        else console.error(`  Failed to update profile ${row.id}:`, error.message)
      }
    }

    console.log(`  Supabase: ${updated} profiles updated with KPIs`)
    return { updated }
  } catch (err) {
    console.error(`  Error migrating profile KPIs:`, err.message || err)
    return { updated: 0, error: err.message }
  }
}

async function main() {
  console.log("=== Neon → Supabase Data Migration ===")
  console.log(`Source: ${NEON_URL.substring(0, 30)}...`)
  console.log(`Destination: ${SUPABASE_URL}`)
  console.log("")

  const results = []

  // Migrate tables in dependency order
  results.push(await migrateTable("signals", "id"))
  results.push(await migrateTable("signal_data_points", "signal_id,date"))
  await migrateProfileKPIs()

  // Optional: migrate staging tables if they exist in Neon
  try {
    results.push(await migrateTable("staged_uploads", "id"))
    results.push(await migrateTable("staged_fields", "id"))
    results.push(await migrateTable("field_availability", "id"))
    results.push(await migrateTable("signal_opportunities", "id"))
  } catch {
    console.log("\n  Some staging tables don't exist in Neon (expected)")
  }

  console.log("\n=== Migration Summary ===")
  for (const r of results) {
    if (r) {
      const status = r.error ? `ERROR: ${r.error}` : `${r.migratedCount}/${r.neonCount} rows`
      console.log(`  ${r.table}: ${status}`)
    }
  }
  console.log("\nDone. Verify data in Supabase before removing Neon.")
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
