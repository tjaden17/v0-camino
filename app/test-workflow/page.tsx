'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SignalCard } from '@/components/signal-card'
import { Loader2 } from 'lucide-react'

interface TestSignal {
  id: string
  name: string
  category: string
  latest_value: number
  previous_value: number
  trend: 'increasing' | 'decreasing' | 'stable'
  benchmark_value: number
  change_percentage: number
  interpretation?: string
  opportunities?: string[]
  risks?: string[]
  dataQuality?: {
    score: number
    issues: string[]
  }
}

export default function TestWorkflowPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [signals, setSignals] = useState<TestSignal[]>([])
  const [selectedSignal, setSelectedSignal] = useState<TestSignal | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUploadAndProcess = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Use the test upload endpoint
      const uploadResponse = await fetch('/api/test/workflow-upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      }

      const uploadData = await uploadResponse.json()
      console.log('[test-workflow] Upload response:', uploadData)

      // Extract data rows from upload
      const dataRows = uploadData.rows || []

      if (dataRows.length === 0) {
        throw new Error('No data rows found in file')
      }

      // Call signal discovery
      const discoveryResponse = await fetch('/api/test/workflow-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_rows: dataRows,
          file_name: file.name,
        }),
      })

      if (!discoveryResponse.ok) {
        throw new Error(`Signal discovery failed: ${discoveryResponse.statusText}`)
      }

      const signalsData = await discoveryResponse.json()
      console.log('[test-workflow] Signals discovered:', signalsData)

      // Process signals with AI analysis
      const testSignals: TestSignal[] = signalsData.signals.map((signal: any) => ({
        id: signal.id || Math.random().toString(),
        name: signal.name,
        category: signal.category || 'Custom',
        latest_value: signal.latest_value || 0,
        previous_value: signal.previous_value || 0,
        trend: signal.trend || 'stable',
        benchmark_value: signal.benchmark_value || 0,
        change_percentage: signal.change_percentage || 0,
        interpretation: signal.interpretation,
        opportunities: signal.opportunities,
        risks: signal.risks,
        dataQuality: {
          score: 85,
          issues: [],
        },
      }))

      setSignals(testSignals)
      if (testSignals.length > 0) {
        setSelectedSignal(testSignals[0])
      }
    } catch (err) {
      console.error('[test-workflow] Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Signal Workflow Test</h1>
          <p className="text-muted-foreground mt-2">
            Test the complete signal workflow: upload → analyze → display
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Step 1: Upload Data</CardTitle>
              <CardDescription>CSV or Excel file with metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer block"
                >
                  <div className="text-sm text-muted-foreground">
                    {file ? (
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-xs mt-1">Ready to process</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Click to select file</p>
                        <p className="text-xs mt-1">or drag and drop</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <Button
                onClick={handleUploadAndProcess}
                disabled={!file || loading}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Processing...' : 'Upload & Analyze'}
              </Button>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signals Grid */}
          <div className="lg:col-span-2 space-y-6">
            {signals.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Step 2: Detected Signals</CardTitle>
                    <CardDescription>
                      {signals.length} signal{signals.length !== 1 ? 's' : ''} discovered
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {signals.map((signal) => (
                        <div
                          key={signal.id}
                          onClick={() => setSelectedSignal(signal)}
                          className="cursor-pointer"
                        >
                          <SignalCard signal={signal} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Expanded Signal View */}
                {selectedSignal && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Step 3: Signal Details</CardTitle>
                      <CardDescription>{selectedSignal.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Value</p>
                          <p className="text-2xl font-bold">
                            {selectedSignal.latest_value.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Change</p>
                          <p
                            className={`text-2xl font-bold ${
                              selectedSignal.change_percentage > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {selectedSignal.change_percentage > 0 ? '+' : ''}
                            {selectedSignal.change_percentage.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Trend</p>
                          <p className="text-lg font-semibold capitalize">
                            {selectedSignal.trend}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Benchmark</p>
                          <p className="text-lg font-semibold">
                            {selectedSignal.benchmark_value.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* AI Interpretation */}
                      {selectedSignal.interpretation && (
                        <div className="space-y-2 border-t pt-4">
                          <h4 className="font-semibold">AI Analysis</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedSignal.interpretation}
                          </p>
                        </div>
                      )}

                      {/* Opportunities */}
                      {selectedSignal.opportunities && selectedSignal.opportunities.length > 0 && (
                        <div className="space-y-2 border-t pt-4">
                          <h4 className="font-semibold">Opportunities</h4>
                          <ul className="text-sm space-y-1">
                            {selectedSignal.opportunities.map((opp, idx) => (
                              <li key={idx} className="text-muted-foreground flex gap-2">
                                <span>•</span>
                                <span>{opp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Risks */}
                      {selectedSignal.risks && selectedSignal.risks.length > 0 && (
                        <div className="space-y-2 border-t pt-4">
                          <h4 className="font-semibold">Risks</h4>
                          <ul className="text-sm space-y-1">
                            {selectedSignal.risks.map((risk, idx) => (
                              <li key={idx} className="text-muted-foreground flex gap-2">
                                <span>•</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!loading && signals.length === 0 && file && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>Upload a file to see signals appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
