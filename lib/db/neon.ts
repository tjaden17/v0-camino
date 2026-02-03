import { neon } from "@neondatabase/serverless"

// Use NEON_DATABASE_URL which is available in the project
const connectionString =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.NEON_POSTGRES_URL

if (!connectionString) {
  console.warn(
    "No Neon database connection string found. Set DATABASE_URL or NEON_DATABASE_URL.",
  )
}

// Create a reusable SQL client
export const sql = neon(connectionString || "")

// Helper function to check if the database is connected
export async function checkConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`
    return true
  } catch {
    return false
  }
}
