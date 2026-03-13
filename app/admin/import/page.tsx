'use client'

import React from "react"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Headphones,
  Users,
  Settings,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { AnalysisResult, DiscoveredSignal } from '@/lib/zoho-signal-discovery'

const CATEGORY_ICONS = {
  sales: TrendingUp,
  support: Headphones,
  customer: Users,
  operations: Settings
}

const CATEGORY_COLORS = {
  sales: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  support: 'bg-green-500/10 text-green-700 border-green-500/20',
  customer: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  operations: 'bg-orange-500/10 text-orange-700 border-orange-500/20'
}

interface UploadedFile {
  file: File
  analysis: AnalysisResult | null
  csvContent: string
  status: 'pending' | 'analyzing' | 'ready' | 'error'
  error?: string
}

export default function ImportPage() {
  const [step, setStep] = useState<'upload' | 'review' | 'complete'>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isEnabling, setIsEnabling] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [signals, setSignals] = useState<DiscoveredSignal[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['sales', 'support']))
  const [enabledCount, setEnabledCount] = useState({ created: 0, updated: 0 })
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  
  const { toast } = useToast()
  const router = useRouter()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const isValidFile = (f: File) => {
    const name = f.name.toLowerCase()
    return name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls')
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files).filter(isValidFile)
    if (files.length > 0) {
      await analyzeFiles(files)
    }
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(isValidFile)
    if (files.length > 0) {
      await analyzeFiles(files)
    }
  }

  const analyzeFiles = async (files: File[]) => {
    // Filter for valid files
    const validFiles = files.filter(isValidFile)
    
    if (validFiles.length === 0) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload CSV or Excel (.xlsx) files exported from Zoho',
        variant: 'destructive'
      })
      return
    }

    // Initialize uploaded files state
    const initialFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      analysis: null,
      csvContent: '',
      status: 'pending'
    }))
    
    setUploadedFiles(initialFiles)
    setIsAnalyzing(true)

    const allSignals: DiscoveredSignal[] = []
    const updatedFiles: UploadedFile[] = []

    // Analyze each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      
      // Update status to analyzing
      setUploadedFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'analyzing' } : f
      ))

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/import/analyze', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Analysis failed')
        }

        const data = await response.json()
        
        // Handle multi-sheet Excel files
        if (data.isMultiSheet && data.sheets) {
          // Process each sheet from the Excel file
          for (const sheet of data.sheets) {
            const prefixedSignals = sheet.analysis.signals.map((s: DiscoveredSignal) => ({
              ...s,
              id: `${sheet.analysis.source}_${sheet.sheetName}_${s.id}`,
              sourceFile: `${file.name} (${sheet.sheetName})`
            }))
            allSignals.push(...prefixedSignals)
          }
          
          // Use the first sheet's analysis for the file summary
          updatedFiles.push({
            file,
            analysis: {
              ...data.sheets[0].analysis,
              fileName: file.name,
              recordCount: data.sheets.reduce((sum: number, s: { analysis: { recordCount: number } }) => sum + s.analysis.recordCount, 0),
              // Store all sheets' data
              sheets: data.sheets
            },
            csvContent: data.sheets.map((s: { csvContent: string }) => s.csvContent).join('\n---SHEET_SEPARATOR---\n'),
            status: 'ready'
          })

          setUploadedFiles(prev => prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              analysis: {
                ...data.sheets[0].analysis,
                fileName: file.name,
                recordCount: data.sheets.reduce((sum: number, s: { analysis: { recordCount: number } }) => sum + s.analysis.recordCount, 0),
                sheets: data.sheets
              },
              csvContent: data.sheets.map((s: { csvContent: string }) => s.csvContent).join('\n---SHEET_SEPARATOR---\n'),
              status: 'ready' 
            } : f
          ))
        } else {
          // Handle single CSV file (original logic)
          const prefixedSignals = data.analysis.signals.map((s: DiscoveredSignal) => ({
            ...s,
            id: `${data.analysis.source}_${s.id}`,
            sourceFile: file.name
          }))
          
          allSignals.push(...prefixedSignals)
          
          updatedFiles.push({
            file,
            analysis: data.analysis,
            csvContent: data.csvContent,
            status: 'ready'
          })

          setUploadedFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, analysis: data.analysis, csvContent: data.csvContent, status: 'ready' } : f
          ))
        }
      } catch (error) {
        console.error(`[v0] Analysis error for ${file.name}:`, error)
        
        updatedFiles.push({
          file,
          analysis: null,
          csvContent: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'Analysis failed'
        })

        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Analysis failed' } : f
        ))
      }
    }

    setIsAnalyzing(false)

    // Combine all signals and move to review if at least one file succeeded
    const successfulFiles = updatedFiles.filter(f => f.status === 'ready')
    
    if (successfulFiles.length > 0) {
      setSignals(allSignals)
      setStep('review')
      
      const totalRecords = successfulFiles.reduce((sum, f) => sum + (f.analysis?.recordCount || 0), 0)
      toast({
        title: `${successfulFiles.length} file${successfulFiles.length > 1 ? 's' : ''} analyzed`,
        description: `Found ${allSignals.length} available signals from ${totalRecords.toLocaleString()} records`
      })
    } else {
      toast({
        title: 'Analysis failed',
        description: 'Could not analyze any of the uploaded files',
        variant: 'destructive'
      })
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const toggleSignal = (signalId: string) => {
    setSignals(prev => prev.map(s => 
      s.id === signalId ? { ...s, enabled: !s.enabled } : s
    ))
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const selectAllInCategory = (category: string) => {
    const categorySignals = signals.filter(s => s.category === category)
    const allSelected = categorySignals.every(s => s.enabled)
    
    setSignals(prev => prev.map(s => 
      s.category === category ? { ...s, enabled: !allSelected } : s
    ))
  }

  const enableSelectedSignals = async () => {
    const selectedSignals = signals.filter(s => s.enabled)
    
    if (selectedSignals.length === 0) {
      toast({
        title: 'No signals selected',
        description: 'Please select at least one signal to enable',
        variant: 'destructive'
      })
      return
    }

    setIsEnabling(true)

    let totalCreated = 0
    let totalUpdated = 0

    try {
      // Group signals by source file and process each
      const successfulFiles = uploadedFiles.filter(f => f.status === 'ready')
      
      for (const uploadedFile of successfulFiles) {
        const fileSignals = selectedSignals.filter(s => 
          (s as DiscoveredSignal & { sourceFile?: string }).sourceFile === uploadedFile.file.name ||
          s.id.startsWith(uploadedFile.analysis?.source || '')
        )
        
        if (fileSignals.length === 0) continue

        const response = await fetch('/api/admin/import/enable-signals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signals: fileSignals,
            source: uploadedFile.analysis?.source,
            csvContent: uploadedFile.csvContent
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to enable signals')
        }

        const data = await response.json()
        totalCreated += data.created
        totalUpdated += data.updated
      }

      setEnabledCount({ created: totalCreated, updated: totalUpdated })
      setStep('complete')

      toast({
        title: 'Signals enabled successfully',
        description: `${totalCreated} signals created, ${totalUpdated} signals updated`
      })
    } catch (error) {
      console.error('[v0] Enable signals error:', error)
      toast({
        title: 'Failed to enable signals',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsEnabling(false)
    }
  }

  const formatValue = (value: number | string | undefined, unit: string): string => {
    if (value === undefined) return '-'
    if (typeof value === 'string') return value
    
    switch (unit) {
      case 'currency':
        return new Intl.NumberFormat('en-AU', { 
          style: 'currency', 
          currency: 'AUD',
          maximumFractionDigits: 0 
        }).format(value)
      case 'percentage':
        return `${value}%`
      case 'hours':
        return `${value} hrs`
      case 'days':
        return `${value} days`
      default:
        return value.toLocaleString()
    }
  }

  // Group signals by category
  const signalsByCategory = signals.reduce((acc, signal) => {
    if (!acc[signal.category]) {
      acc[signal.category] = []
    }
    acc[signal.category].push(signal)
    return acc
  }, {} as Record<string, DiscoveredSignal[]>)

  const selectedCount = signals.filter(s => s.enabled).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Import Zoho Data</h1>
        <p className="text-muted-foreground mt-1">
          Upload your Zoho CRM or Desk export to discover and enable signals
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {['Upload File', 'Select Signals', 'Complete'].map((label, idx) => {
          const stepNum = idx + 1
          const isActive = (step === 'upload' && idx === 0) || 
                          (step === 'review' && idx === 1) || 
                          (step === 'complete' && idx === 2)
          const isComplete = (step === 'review' && idx === 0) || 
                            (step === 'complete' && idx <= 1)
          
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${isComplete ? 'bg-green-500 text-white' : 
                  isActive ? 'bg-primary text-primary-foreground' : 
                  'bg-muted text-muted-foreground'}
              `}>
                {isComplete ? <CheckCircle className="h-4 w-4" /> : stepNum}
              </div>
              <span className={`text-sm ${isActive || isComplete ? 'font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {idx < 2 && (
                <div className={`w-12 h-0.5 ${isComplete ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card className="p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isAnalyzing ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-primary/50'}
            `}
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div>
                  <p className="text-lg font-medium">Analyzing your data...</p>
                  <p className="text-sm text-muted-foreground">
                    Processing {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}...
                  </p>
                </div>
                {/* File progress */}
                <div className="w-full max-w-md mt-4 space-y-2">
                  {uploadedFiles.map((uf, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-left truncate">{uf.file.name}</span>
                      {uf.status === 'analyzing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {uf.status === 'ready' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {uf.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      {uf.status === 'pending' && (
                        <div className="h-4 w-4 rounded-full border-2 border-muted" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-lg font-medium mb-2">
                  Drag and drop your Zoho export files here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports CSV and Excel files (.xlsx with multiple tabs)
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Select Files
                  </label>
                </Button>
              </>
            )}
          </div>

          {/* Supported formats */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Zoho CRM Exports</p>
                <p className="text-xs text-muted-foreground">
                  Deals, Contacts, Accounts - for sales pipeline and conversion signals
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <Headphones className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Zoho Desk Exports</p>
                <p className="text-xs text-muted-foreground">
                  Tickets - for support metrics, SLA compliance, and resolution times
                </p>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Tip: Upload an Excel file with multiple tabs (Deals, Tickets, etc.) to import all data at once</span>
          </div>
        </Card>
      )}

      {/* Step 2: Review & Select Signals */}
      {step === 'review' && uploadedFiles.some(f => f.status === 'ready') && (
        <div className="space-y-6">
          {/* Files Summary */}
          <div className="grid gap-4 md:grid-cols-2">
            {uploadedFiles.filter(f => f.status === 'ready').map((uf, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      uf.analysis?.source === 'zoho_crm' 
                        ? 'bg-blue-500/10 text-blue-600' 
                        : 'bg-green-500/10 text-green-600'
                    }`}>
                      {uf.analysis?.source === 'zoho_crm' ? (
                        <TrendingUp className="h-6 w-6" />
                      ) : (
                        <Headphones className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold truncate max-w-[200px]">{uf.analysis?.fileName}</h2>
                      <p className="text-sm text-muted-foreground">
                        {uf.analysis?.source === 'zoho_crm' ? 'Zoho CRM' : 'Zoho Desk'} Export
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{uf.analysis?.recordCount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">records</p>
                  </div>
                </div>

                {uf.analysis?.dateRange && (
                  <div className="mt-4 pt-4 border-t flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date Range: </span>
                      <span className="font-medium">
                        {new Date(uf.analysis.dateRange.start).toLocaleDateString()} - {new Date(uf.analysis.dateRange.end).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Columns: </span>
                      <span className="font-medium">{uf.analysis?.columns.length}</span>
                    </div>
                  </div>
                )}

                {uf.analysis?.warnings && uf.analysis.warnings.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Warnings</span>
                    </div>
                    <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                      {uf.analysis.warnings.map((warning, wIdx) => (
                        <li key={wIdx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Combined totals */}
          {uploadedFiles.filter(f => f.status === 'ready').length > 1 && (
            <div className="flex items-center justify-center gap-6 p-4 rounded-lg bg-muted/50">
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {uploadedFiles.filter(f => f.status === 'ready').reduce((sum, f) => sum + (f.analysis?.recordCount || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold">{signals.length}</p>
                <p className="text-sm text-muted-foreground">Available Signals</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold">{uploadedFiles.filter(f => f.status === 'ready').length}</p>
                <p className="text-sm text-muted-foreground">Data Sources</p>
              </div>
            </div>
          )}

          {/* Signal Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Signals</h3>
              <Badge variant="outline" className="text-sm">
                {selectedCount} of {signals.length} selected
              </Badge>
            </div>

            <div className="space-y-4">
              {Object.entries(signalsByCategory).map(([category, categorySignals]) => {
                const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
                const isExpanded = expandedCategories.has(category)
                const selectedInCategory = categorySignals.filter(s => s.enabled).length
                const allSelected = selectedInCategory === categorySignals.length
                
                return (
                  <Card key={category} className="overflow-hidden">
                    {/* Category Header */}
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium capitalize">{category}</h4>
                          <p className="text-sm text-muted-foreground">
                            {categorySignals.length} signal{categorySignals.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            selectAllInCategory(category)
                          }}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                        <Badge variant={selectedInCategory > 0 ? 'default' : 'secondary'}>
                          {selectedInCategory} selected
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Signals List */}
                    {isExpanded && (
                      <div className="border-t divide-y">
                        {categorySignals.map(signal => (
                          <div 
                            key={signal.id}
                            className={`p-4 flex items-start gap-4 transition-colors ${
                              signal.enabled ? 'bg-primary/5' : 'hover:bg-muted/30'
                            }`}
                          >
                            <Checkbox
                              id={signal.id}
                              checked={signal.enabled}
                              onCheckedChange={() => toggleSignal(signal.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <label 
                                htmlFor={signal.id}
                                className="font-medium cursor-pointer"
                              >
                                {signal.name}
                              </label>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {signal.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Fields: {signal.dataFields.join(', ')}</span>
                                <Badge variant="outline" className={`text-xs ${
                                  signal.confidence === 'high' ? 'text-green-600' :
                                  signal.confidence === 'medium' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {signal.confidence} confidence
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">
                                {formatValue(signal.sampleValue, signal.unit)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Current value
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Upload Different File
            </Button>
            <Button 
              onClick={enableSelectedSignals}
              disabled={selectedCount === 0 || isEnabling}
              size="lg"
            >
              {isEnabling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enabling Signals...
                </>
              ) : (
                <>
                  Enable {selectedCount} Signal{selectedCount !== 1 ? 's' : ''}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 'complete' && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Import Complete!</h2>
          <p className="text-muted-foreground mb-6">
            {enabledCount.created > 0 && `${enabledCount.created} new signal${enabledCount.created !== 1 ? 's' : ''} created. `}
            {enabledCount.updated > 0 && `${enabledCount.updated} signal${enabledCount.updated !== 1 ? 's' : ''} updated.`}
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={() => {
              setStep('upload')
              setAnalysis(null)
              setSignals([])
              setCsvContent('')
            }}>
              Import More Data
            </Button>
            <Button onClick={() => router.push('/admin/signals')}>
              View Signals
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-left">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">What's Next?</p>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                  <li>Your signals are now visible in the Signals dashboard</li>
                  <li>Upload more data files to add additional data points over time</li>
                  <li>Connect Zoho directly for automatic data syncing</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
