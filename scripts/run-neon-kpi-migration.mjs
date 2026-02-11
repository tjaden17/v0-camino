#!/usr/bin/env node
/**
 * Add kpi_1, kpi_2, kpi_3 to profiles table in Neon.
 * Run: node --env-file=.env.local scripts/run-neon-kpi-migration.mjs
 */
import { neon } from "@neondatabase/serverless"

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("Missing NEON_DATABASE_URL or DATABASE_URL in environment.")
  process.exit(1)
}

const sql = neon(connectionString)

async function run() {
  console.log("Adding kpi_1, kpi_2, kpi_3 to profiles (if not exist)...")
  await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kpi_1 TEXT`
  await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kpi_2 TEXT`
  await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kpi_3 TEXT`
  console.log("Done. profiles now has kpi_1, kpi_2, kpi_3.")
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
