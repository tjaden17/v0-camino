import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeZohoCRM, analyzeZohoDesk, analyzeZohoLeads, analyzeZohoContacts, analyzeZohoAccounts, detectZohoFileType } from '@/lib/zoho-signal-discovery'
import { parseXLSX, detectSheetType, getSheetTypeName } from '@/lib/xlsx-parser'
import type { AnalysisResult } from '@/lib/zoho-signal-discovery'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    
    // Handle Excel files with multiple sheets
    if (isExcel) {
      const buffer = await file.arrayBuffer()
      const workbook = parseXLSX(buffer, file.name)
      
      if (workbook.sheets.length === 0) {
        return NextResponse.json({ 
          error: 'No data found in the Excel file',
        }, { status: 400 })
      }

      // Analyze each sheet and combine results
      const analyses: Array<{ analysis: AnalysisResult; csvContent: string; sheetName: string; sheetType: string }> = []
      
      for (const sheet of workbook.sheets) {
        const sheetType = detectSheetType(sheet.columns)
        
        // Skip unknown sheet types
        if (sheetType === 'unknown') continue
        
        // Use the appropriate analyzer based on sheet type
        let analysis
        switch (sheetType) {
          case 'zoho_crm_deals':
            analysis = analyzeZohoCRM(sheet.csvContent, `${file.name} - ${sheet.name}`)
            break
          case 'zoho_crm_leads':
            analysis = analyzeZohoLeads(sheet.csvContent, `${file.name} - ${sheet.name}`)
            break
          case 'zoho_crm_contacts':
            analysis = analyzeZohoContacts(sheet.csvContent, `${file.name} - ${sheet.name}`)
            break
          case 'zoho_crm_accounts':
            analysis = analyzeZohoAccounts(sheet.csvContent, `${file.name} - ${sheet.name}`)
            break
          case 'zoho_desk_tickets':
            analysis = analyzeZohoDesk(sheet.csvContent, `${file.name} - ${sheet.name}`)
            break
          case 'zoho_desk_accounts':
            analysis = analyzeZohoAccounts(sheet.csvContent, `${file.name} - ${sheet.name}`)
            break
          default:
            continue
        }
        
        analyses.push({
          analysis,
          csvContent: sheet.csvContent,
          sheetName: sheet.name,
          sheetType: getSheetTypeName(sheetType)
        })
      }

      if (analyses.length === 0) {
        return NextResponse.json({ 
          error: 'No recognizable Zoho data found in any sheet. Expected Deals, Tickets, Contacts, or Accounts data.',
          sheets: workbook.sheets.map(s => ({ name: s.name, columns: s.columns.slice(0, 10) }))
        }, { status: 400 })
      }

      // Return multi-sheet response
      return NextResponse.json({ 
        success: true,
        isMultiSheet: true,
        fileName: file.name,
        sheets: analyses,
        // For backwards compatibility, also return combined data
        analysis: analyses[0].analysis,
        csvContent: analyses[0].csvContent
      })
    }
    
    // Handle CSV files (original logic)
    const csvContent = await file.text()
    
    // Auto-detect file type if not specified
    let detectedType = fileType as 'zoho_crm' | 'zoho_desk' | null
    if (!detectedType) {
      detectedType = detectZohoFileType(csvContent)
      if (detectedType === 'unknown') {
        return NextResponse.json({ 
          error: 'Could not detect file type. Please specify if this is a Zoho CRM or Zoho Desk export.',
          detectedColumns: csvContent.split('\n')[0]
        }, { status: 400 })
      }
    }
    
    // Analyze the file
    const analysis = detectedType === 'zoho_crm' 
      ? analyzeZohoCRM(csvContent, file.name)
      : analyzeZohoDesk(csvContent, file.name)
    
    return NextResponse.json({ 
      success: true, 
      analysis,
      csvContent // Return content for later processing
    })
    
  } catch (error) {
    console.error('[v0] Import analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
