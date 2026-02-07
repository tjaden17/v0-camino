import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sql } from "@/lib/db/neon"
import * as XLSX from "xlsx"
import { parseCSV } from "@/lib/csv-parser"
import { discoverSignals, type SignalDiscoveryResult } from "@/lib/signal-discovery-service"

// Parse XLSX file to row format
function parseXLSX(buffer: ArrayBuffer): { headers: string[]; rows: Record<string, string>[] } {
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" })
  
  if (jsonData.length === 0) {
    return { headers: [], rows: [] }
  }
  
  const headers = Object.keys(jsonData[0])
  const rows = jsonData.map(row => {
    const stringRow: Record<string, string> = {}
    for (const key of headers) {
      stringRow[key] = row[key]?.toString() || ""
    }
    return stringRow
  })
  
  return { headers, rows }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Parse file based on type
    const fileName = file.name.toLowerCase()
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls")
    
    let rows: Record<string, string>[]
    
    if (isExcel) {
      const buffer = await file.arrayBuffer()
      const result = parseXLSX(buffer)
      rows = result.rows
    } else {
      const text = await file.text()
      const result = parseCSV(text)
      rows = result.rows
    }

    if (rows.length === 0) {
      return NextResponse.json({ 
        error: "File is empty or has no data rows",
        discovery: null 
      }, { status: 400 })
    }

    // Get user's organization_id
    const userContextResult = await sql`
      SELECT organization_id FROM user_context WHERE user_id = ${user.id}
    `
    const organizationId = userContextResult[0]?.organization_id
    
    if (!organizationId) {
      return NextResponse.json({ error: "User organization not found" }, { status: 400 })
    }

    // Run signal discovery
    const discovery = await discoverSignals(rows, file.name)
    
    // Categorize signals as new/updated/partial
    const existingSignalNames = new Set<string>()
    try {
      const existingSignals = await sql`
        SELECT DISTINCT name FROM signals WHERE organization_id = ${organizationId}
      `
      existingSignals.forEach((s: any) => existingSignalNames.add(s.name))
    } catch (err) {
      console.error("[v0] Error fetching existing signals:", err)
    }

    // Categorize discovered signals
    const categorized = {
      new: discovery.availableSignals.filter(s => !existingSignalNames.has(s.signal.signalName)),
      updated: discovery.availableSignals.filter(s => existingSignalNames.has(s.signal.signalName)),
      partial: discovery.partialSignals,
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      rowCount: rows.length,
      discovery: {
        ...discovery,
        categorized, // Add categorization: { new, updated, partial }
      },
    })
  } catch (error) {
    console.error("[v0] Discovery error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Discovery failed" },
      { status: 500 }
    )
  }
}
