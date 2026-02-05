'use client'

import React from "react"
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface TestWorkflowState {
  signals: any[]
  existingData?: {
    columns_previously_uploaded: string[]
    last_upload_date: string | null
    recommendation: string
  }
  error?: string
}

interface UserProfile {
  id: string
  name: string
  role: string
  orgName: string
  orgKpis: {
    label: string
    value: string
    trend?: string
  }[]
  userKpis: {
    label: string
    value: string
    trend?: string
  }[]
}

const DUMMY_PROFILES: UserProfile[] = [
  {
    id: 'cso-sarah',
    name: 'Sarah Chen',
    role: 'Customer Success Manager',
    orgName: 'Acme Corp',
    orgKpis: [
      { label: 'Annual Recurring Revenue', value: '$2.4M', trend: '+12%' },
      { label: 'Net Churn Rate', value: '2.1%', trend: '-0.3%' },
      { label: 'NPS Score', value: '58', trend: '+5' },
      { label: 'Customer Count', value: '142', trend: '+8' },
    ],
    userKpis: [
      { label: 'Accounts Managed', value: '23', trend: '+2' },
      { label: 'Health Score', value: '87%', trend: '+5%' },
      { label: 'Renewal Rate', value: '95%', trend: '+2%' },
      { label: 'Expansion Revenue', value: '$145K', trend: '+18%' },
    ],
  },
  {
    id: 'sales-james',
    name: 'James Rodriguez',
    role: 'Sales Director',
    orgName: 'TechFlow Inc',
    orgKpis: [
      { label: 'Monthly Recurring Revenue', value: '$850K', trend: '+8%' },
      { label: 'Win Rate', value: '34%', trend: '+2%' },
      { label: 'Average Deal Size', value: '$45K', trend: '+12%' },
      { label: 'Sales Pipeline', value: '$5.2M', trend: '+22%' },
    ],
    userKpis: [
      { label: 'Deals Closed (YTD)', value: '18', trend: '+4' },
      { label: 'Quota Attainment', value: '118%', trend: '+15%' },
      { label: 'Avg Sales Cycle', value: '45 days', trend: '-5' },
      { label: 'Revenue Generated', value: '$810K', trend: '+25%' },
    ],
  },
  {
    id: 'ops-maria',
    name: 'Maria Gonzalez',
    role: 'Operations Manager',
    orgName: 'DataSync Solutions',
    orgKpis: [
      { label: 'Monthly Active Users', value: '8,432', trend: '+18%' },
      { label: 'System Uptime', value: '99.98%', trend: '+0.02%' },
      { label: 'Average Response Time', value: '245ms', trend: '-42ms' },
      { label: 'Customer Incidents', value: '12', trend: '-4' },
    ],
    userKpis: [
      { label: 'Processes Automated', value: '16', trend: '+5' },
      { label: 'Time Saved (hrs/week)', value: '58', trend: '+12' },
      { label: 'Error Rate', value: '0.3%', trend: '-0.2%' },
      { label: 'Efficiency Score', value: '92%', trend: '+8%' },
    ],
  },
]

export default function TestWorkflowPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [signals, setSignals] = useState<any[]>([])
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [existingData, setExistingData] = useState<TestWorkflowState['existingData'] | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)

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

      // Store existing data info
      if (signalsData.existing_data) {
        setExistingData(signalsData.existing_data)
      }

      // Process signals with AI analysis
      const testSignals = signalsData.signals || []
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
            Test the complete signal workflow: select profile → upload → analyze → display
          </p>
        </div>

        {!selectedProfile ? (
          // Step 1: Profile Selection
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Choose Your Profile</CardTitle>
              <CardDescription>Select a user profile to see context and KPIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DUMMY_PROFILES.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile)}
                    className="cursor-pointer border rounded-lg p-4 hover:border-primary hover:bg-muted transition-all"
                  >
                    <div className="space-y-4">
                      {/* User Info */}
                      <div>
                        <h3 className="font-bold text-lg">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.role}</p>
                        <p className="text-xs font-medium text-primary mt-2">{profile.orgName}</p>
                      </div>

                      {/* Org KPIs */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Org KPIs</p>
                        <div className="space-y-1">
                          {profile.orgKpis.slice(0, 2).map((kpi, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">{kpi.label}</span>
                              <div className="flex gap-1">
                                <span className="font-semibold">{kpi.value}</span>
                                {kpi.trend && (
                                  <span className={kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                                    {kpi.trend}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* User KPIs */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Your KPIs</p>
                        <div className="space-y-1">
                          {profile.userKpis.slice(0, 2).map((kpi, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">{kpi.label}</span>
                              <div className="flex gap-1">
                                <span className="font-semibold">{kpi.value}</span>
                                {kpi.trend && (
                                  <span className={kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                                    {kpi.trend}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full mt-4" size="sm">
                        Select Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Steps 2-4: File Upload & Signal Analysis
          <div className="space-y-6">
            {/* Profile Context Bar */}
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedProfile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProfile.role} at {selectedProfile.orgName}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProfile(null)
                      setFile(null)
                      setSignals([])
                      setSelectedSignal(null)
                    }}
                  >
                    Change Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upload Section */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Step 2: Upload Data</CardTitle>
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
                    {/* Existing Data Info */}
                    {existingData && (
                      <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                          <CardTitle className="text-blue-900">Previous Uploads</CardTitle>
                          <CardDescription>
                            {existingData.columns_previously_uploaded.length > 0
                              ? `${existingData.columns_previously_uploaded.length} columns previously uploaded`
                              : 'First upload detected'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {existingData.columns_previously_uploaded.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-blue-900">Columns:</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {existingData.columns_previously_uploaded.map((col) => (
                                  <span
                                    key={col}
                                    className="inline-block bg-blue-200 text-blue-900 text-xs px-2 py-1 rounded"
                                  >
                                    {col}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {existingData.last_upload_date && (
                            <p className="text-xs text-blue-700">
                              Last upload: {new Date(existingData.last_upload_date).toLocaleDateString()}
                            </p>
                          )}
                          <p className="text-sm text-blue-900 font-medium border-t pt-2">
                            {existingData.recommendation}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle>Step 3: Detected Signals</CardTitle>
                        <CardDescription>
                          {signals.length} signal{signals.length !== 1 ? 's' : ''} discovered
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {signals.map((signal) => (
                            <div
                              key={signal.name}
                              onClick={() => setSelectedSignal(signal)}
                              className="cursor-pointer p-4 border rounded-lg hover:bg-muted transition-colors"
                            >
                              <h4 className="font-semibold">{signal.name}</h4>
                              <p className="text-sm text-muted-foreground">{signal.category}</p>
                              <p className="text-lg font-bold mt-2">{signal.value}</p>
                              <p
                                className={`text-sm ${
                                  signal.change_percent > 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {signal.change_percent > 0 ? '+' : ''}
                                {signal.change_percent.toFixed(1)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Expanded Signal View */}
                    {selectedSignal && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Step 4: Signal Details</CardTitle>
                          <CardDescription>{selectedSignal.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Current Value</p>
                              <p className="text-2xl font-bold">{selectedSignal.value}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Change</p>
                              <p
                                className={`text-2xl font-bold ${
                                  selectedSignal.change_percent > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {selectedSignal.change_percent > 0 ? '+' : ''}
                                {selectedSignal.change_percent.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Trend</p>
                              <p className="text-lg font-semibold capitalize">{selectedSignal.trend}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Category</p>
                              <p className="text-lg font-semibold">{selectedSignal.category}</p>
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
                                {selectedSignal.opportunities.map((opp: string, idx: number) => (
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
                                {selectedSignal.risks.map((risk: string, idx: number) => (
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
        )}
      </div>
    </div>
  )
}
