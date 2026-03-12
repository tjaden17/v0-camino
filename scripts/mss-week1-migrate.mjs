import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "")

async function run() {
  console.log("Step 1: Dedup signals...")
  await sql`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY name, COALESCE(organization_id::text, '__null__')
        ORDER BY updated_at DESC NULLS LAST
      ) AS rn
      FROM signals
    )
    DELETE FROM signals WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
  `
  console.log("Done dedup signals.")

  console.log("Step 2: Dedup data points...")
  await sql`
    WITH ranked_dp AS (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY signal_id, date
        ORDER BY created_at DESC NULLS LAST
      ) AS rn
      FROM signal_data_points
    )
    DELETE FROM signal_data_points WHERE id IN (SELECT id FROM ranked_dp WHERE rn > 1)
  `
  console.log("Done dedup data points.")

  console.log("Step 3: Drop old indexes...")
  await sql`DROP INDEX IF EXISTS signals_name_org_unique`
  await sql`DROP INDEX IF EXISTS signals_name_null_org_unique`
  await sql`DROP INDEX IF EXISTS signal_data_points_signal_date_unique`
  console.log("Done dropping old indexes.")

  console.log("Step 4: Create unique indexes...")
  await sql`CREATE UNIQUE INDEX signals_name_org_unique ON signals (name, organization_id) WHERE organization_id IS NOT NULL`
  await sql`CREATE UNIQUE INDEX signals_name_null_org_unique ON signals (name) WHERE organization_id IS NULL`
  await sql`CREATE UNIQUE INDEX signal_data_points_signal_date_unique ON signal_data_points (signal_id, date)`
  console.log("Done creating indexes.")

  console.log("Migration complete!")
}

run().catch(err => {
  console.error("Migration failed:", err)
  process.exit(1)
})
