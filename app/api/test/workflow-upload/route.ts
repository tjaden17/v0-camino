import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file buffer
    const buffer = await file.arrayBuffer()
    
    let headers: string[] = []
    let rows: Record<string, string>[] = []

    // Handle CSV
    if (file.name.endsWith('.csv')) {
      const text = new TextDecoder().decode(buffer)
      const lines = text.split('\n')
      if (lines.length > 0) {
        headers = lines[0].split(',').map(h => h.trim())
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim())
            const row: Record<string, string> = {}
            headers.forEach((header, idx) => {
              row[header] = values[idx] || ''
            })
            rows.push(row)
          }
        }
      }
    } else {
      // Handle XLSX
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' })
      
      if (jsonData.length > 0) {
        headers = Object.keys(jsonData[0])
        rows = jsonData.map(row => {
          const stringRow: Record<string, string> = {}
          headers.forEach(header => {
            stringRow[header] = row[header]?.toString() || ''
          })
          return stringRow
        })
      }
    }

    return NextResponse.json({
      success: true,
      file_name: file.name,
      headers,
      rows,
      row_count: rows.length,
    })
  } catch (error) {
    console.error('[test-workflow] Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
