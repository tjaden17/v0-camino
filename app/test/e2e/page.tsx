'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type StepStatus = 'pending' | 'running' | 'pass' | 'fail' | 'skip'

interface FlowStep {
  name: string
  status: StepStatus
  responseTime?: number
  statusCode?: number
  error?: string
  detail?: string
}

interface E2EFlow {
  id: string
  name: string
  description: string
  steps: FlowStep[]
  status: StepStatus
  totalTime?: number
}

// Helper to generate a small CSV blob for upload tests
function generateTestCSV(): Blob {
  const csv = [
    'Month,Revenue,Churn_Rate,NPS_Score,Customer_Count',
    'Jan,45000,3.2,52,120',
    'Feb,48000,2.9,55,125',
    'Mar,51000,2.7,58,130',
    'Apr,53000,2.5,60,138',
    'May,56000,2.3,62,142',
    'Jun,58000,2.1,65,148',
  ].join('\n')
  return new Blob([csv], { type: 'text/csv' })
}

export default function E2ETestPage() {
  const [flows, setFlows] = useState<E2EFlow[]>([])
  const [running, setRunning] = useState(false)
  const [currentFlow, setCurrentFlow] = useState<string | null>(null)
  const abortRef = useRef(false)

  const updateFlow = useCallback((flowId: string, updater: (flow: E2EFlow) => E2EFlow) => {
    setFlows(prev => prev.map(f => f.id === flowId ? updater(f) : f))
  }, [])

  const updateStep = useCallback((flowId: string, stepIndex: number, updates: Partial<FlowStep>) => {
    setFlows(prev => prev.map(f => {
      if (f.id !== flowId) return f
      const newSteps = [...f.steps]
      newSteps[stepIndex] = { ...newSteps[stepIndex], ...updates }
      return { ...f, steps: newSteps }
    }))
  }, [])

  // Timed fetch helper
  async function timedFetch(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: any; time: number }> {
    const start = performance.now()
    try {
      const res = await fetch(url, options)
      const time = Math.round(performance.now() - start)
      let data: any = null
      try { data = await res.json() } catch { data = null }
      return { ok: res.ok, status: res.status, data, time }
    } catch (err) {
      const time = Math.round(performance.now() - start)
      return { ok: false, status: 0, data: null, time }
    }
  }

  // ---- FLOW 1: Test Data Upload Flow ----
  async function runUploadFlow(): Promise<E2EFlow> {
    const flowId = 'upload-flow'
    const steps: FlowStep[] = [
      { name: 'Generate test CSV', status: 'pending' },
      { name: 'POST /api/test/workflow-upload', status: 'pending' },
      { name: 'Validate parsed rows', status: 'pending' },
      { name: 'POST /api/test/workflow-signals', status: 'pending' },
      { name: 'Validate signal detection', status: 'pending' },
      { name: 'Validate AI interpretation', status: 'pending' },
    ]

    const flow: E2EFlow = { id: flowId, name: 'Data Upload + Signal Detection', description: 'Upload CSV -> parse -> detect signals -> AI analysis', steps, status: 'running' }
    setFlows(prev => [...prev.filter(f => f.id !== flowId), flow])
    setCurrentFlow(flowId)
    const start = performance.now()

    try {
      // Step 1: Generate CSV
      updateStep(flowId, 0, { status: 'running' })
      const csvBlob = generateTestCSV()
      updateStep(flowId, 0, { status: 'pass', detail: `${csvBlob.size} bytes, 6 data rows` })

      if (abortRef.current) throw new Error('Aborted')

      // Step 2: Upload
      updateStep(flowId, 1, { status: 'running' })
      const formData = new FormData()
      formData.append('file', csvBlob, 'test-data.csv')
      const upload = await timedFetch('/api/test/workflow-upload', { method: 'POST', body: formData })
      updateStep(flowId, 1, { status: upload.ok ? 'pass' : 'fail', statusCode: upload.status, responseTime: upload.time, error: upload.ok ? undefined : JSON.stringify(upload.data) })
      if (!upload.ok) throw new Error(`Upload failed: ${upload.status}`)

      // Step 3: Validate parsed rows
      updateStep(flowId, 2, { status: 'running' })
      const rows = upload.data?.rows || []
      const headers = upload.data?.headers || []
      const rowPass = rows.length >= 5 && headers.length >= 4
      updateStep(flowId, 2, { status: rowPass ? 'pass' : 'fail', detail: `${rows.length} rows, ${headers.length} columns: ${headers.join(', ')}` })
      if (!rowPass) throw new Error('Insufficient parsed data')

      if (abortRef.current) throw new Error('Aborted')

      // Step 4: Signal detection
      updateStep(flowId, 3, { status: 'running' })
      const signals = await timedFetch('/api/test/workflow-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_rows: rows, file_name: 'test-data.csv' }),
      })
      updateStep(flowId, 3, { status: signals.ok ? 'pass' : 'fail', statusCode: signals.status, responseTime: signals.time, error: signals.ok ? undefined : JSON.stringify(signals.data) })
      if (!signals.ok) throw new Error(`Signal detection failed: ${signals.status}`)

      // Step 5: Validate signals
      updateStep(flowId, 4, { status: 'running' })
      const detectedSignals = signals.data?.signals || []
      const sigPass = detectedSignals.length >= 3
      updateStep(flowId, 4, { status: sigPass ? 'pass' : 'fail', detail: `${detectedSignals.length} signals detected: ${detectedSignals.map((s: any) => s.name).join(', ')}` })

      // Step 6: AI interpretation
      updateStep(flowId, 5, { status: 'running' })
      const hasInterpretation = detectedSignals.some((s: any) => s.interpretation && s.interpretation.length > 10)
      const hasOpps = detectedSignals.some((s: any) => s.opportunities && s.opportunities.length > 0)
      updateStep(flowId, 5, { status: hasInterpretation ? 'pass' : 'fail', detail: `AI text: ${hasInterpretation ? 'Yes' : 'No'}, Opportunities: ${hasOpps ? 'Yes' : 'No'}` })

      const totalTime = Math.round(performance.now() - start)
      const allPassed = [rowPass, signals.ok, sigPass, hasInterpretation].every(Boolean)
      updateFlow(flowId, f => ({ ...f, status: allPassed ? 'pass' : 'fail', totalTime }))
      return { ...flow, status: allPassed ? 'pass' : 'fail', totalTime }
    } catch (err) {
      const totalTime = Math.round(performance.now() - start)
      updateFlow(flowId, f => ({
        ...f,
        status: 'fail',
        totalTime,
        steps: f.steps.map(s => s.status === 'pending' ? { ...s, status: 'skip' as StepStatus } : s),
      }))
      return { ...flow, status: 'fail', totalTime }
    }
  }

  // ---- FLOW 2: API Health Check Flow ----
  async function runAPIHealthFlow(): Promise<E2EFlow> {
    const flowId = 'api-health'
    const endpoints = [
      '/api/signals',
      '/api/decisions',
      '/api/insights',
      '/api/kpis',
      '/api/integrations',
      '/api/benchmarks',
      '/api/data-quality',
      '/api/data-sources',
      '/api/relationships',
    ]
    const steps: FlowStep[] = endpoints.map(ep => ({ name: `GET ${ep}`, status: 'pending' as StepStatus }))

    const flow: E2EFlow = { id: flowId, name: 'API Health Check', description: 'Hit all GET endpoints, expect JSON responses (auth errors OK, 500s fail)', steps, status: 'running' }
    setFlows(prev => [...prev.filter(f => f.id !== flowId), flow])
    setCurrentFlow(flowId)
    const start = performance.now()

    let failures = 0
    for (let i = 0; i < endpoints.length; i++) {
      if (abortRef.current) break
      updateStep(flowId, i, { status: 'running' })
      const res = await timedFetch(endpoints[i])
      const isServerError = res.status >= 500
      updateStep(flowId, i, {
        status: isServerError ? 'fail' : 'pass',
        statusCode: res.status,
        responseTime: res.time,
        detail: res.status === 401 || res.status === 403 ? 'Auth required (expected)' : undefined,
        error: isServerError ? JSON.stringify(res.data)?.substring(0, 200) : undefined,
      })
      if (isServerError) failures++
    }

    const totalTime = Math.round(performance.now() - start)
    updateFlow(flowId, f => ({ ...f, status: failures === 0 ? 'pass' : 'fail', totalTime }))
    return { ...flow, status: failures === 0 ? 'pass' : 'fail', totalTime }
  }

  // ---- FLOW 3: Test Endpoints Flow ----
  async function runTestEndpointsFlow(): Promise<E2EFlow> {
    const flowId = 'test-endpoints'
    const endpoints = [
      { url: '/api/test/organizations', method: 'GET' },
      { url: '/api/test/users', method: 'GET' },
      { url: '/api/test/signals', method: 'GET' },
    ]
    const steps: FlowStep[] = endpoints.map(ep => ({ name: `${ep.method} ${ep.url}`, status: 'pending' as StepStatus }))

    const flow: E2EFlow = { id: flowId, name: 'Test Data Endpoints', description: 'Test endpoints that bypass auth for development', steps, status: 'running' }
    setFlows(prev => [...prev.filter(f => f.id !== flowId), flow])
    setCurrentFlow(flowId)
    const start = performance.now()

    let failures = 0
    for (let i = 0; i < endpoints.length; i++) {
      if (abortRef.current) break
      updateStep(flowId, i, { status: 'running' })
      const res = await timedFetch(endpoints[i].url)
      const pass = res.status < 500
      updateStep(flowId, i, {
        status: pass ? 'pass' : 'fail',
        statusCode: res.status,
        responseTime: res.time,
        detail: res.data ? `Records: ${Array.isArray(res.data) ? res.data.length : (res.data?.count || 'N/A')}` : undefined,
        error: !pass ? JSON.stringify(res.data)?.substring(0, 200) : undefined,
      })
      if (!pass) failures++
    }

    const totalTime = Math.round(performance.now() - start)
    updateFlow(flowId, f => ({ ...f, status: failures === 0 ? 'pass' : 'fail', totalTime }))
    return { ...flow, status: failures === 0 ? 'pass' : 'fail', totalTime }
  }

  // ---- FLOW 4: Page Load Flow ----
  async function runPageLoadFlow(): Promise<E2EFlow> {
    const flowId = 'page-loads'
    const pages = [
      { url: '/', name: 'Landing' },
      { url: '/auth/login', name: 'Login' },
      { url: '/auth/signup', name: 'Signup' },
      { url: '/test-workflow', name: 'Test Workflow' },
      { url: '/dashboard', name: 'Dashboard' },
      { url: '/signals', name: 'Signals' },
      { url: '/decisions', name: 'Decisions' },
      { url: '/guidance', name: 'Guidance' },
    ]
    const steps: FlowStep[] = pages.map(p => ({ name: `Load ${p.name} (${p.url})`, status: 'pending' as StepStatus }))

    const flow: E2EFlow = { id: flowId, name: 'Page Load Test', description: 'Verify all critical pages load without server errors', steps, status: 'running' }
    setFlows(prev => [...prev.filter(f => f.id !== flowId), flow])
    setCurrentFlow(flowId)
    const start = performance.now()

    let failures = 0
    for (let i = 0; i < pages.length; i++) {
      if (abortRef.current) break
      updateStep(flowId, i, { status: 'running' })
      const pageStart = performance.now()
      try {
        const res = await fetch(pages[i].url)
        const time = Math.round(performance.now() - pageStart)
        const isError = res.status >= 500
        updateStep(flowId, i, {
          status: isError ? 'fail' : 'pass',
          statusCode: res.status,
          responseTime: time,
          detail: res.status === 307 || res.status === 302 ? 'Redirected (auth required)' : undefined,
        })
        if (isError) failures++
      } catch (err) {
        const time = Math.round(performance.now() - pageStart)
        updateStep(flowId, i, { status: 'fail', responseTime: time, error: String(err) })
        failures++
      }
    }

    const totalTime = Math.round(performance.now() - start)
    updateFlow(flowId, f => ({ ...f, status: failures === 0 ? 'pass' : 'fail', totalTime }))
    return { ...flow, status: failures === 0 ? 'pass' : 'fail', totalTime }
  }

  // ---- FLOW 5: AI Interpretation Flow ----
  async function runAIFlow(): Promise<E2EFlow> {
    const flowId = 'ai-flow'
    const steps: FlowStep[] = [
      { name: 'POST /api/test/interpret', status: 'pending' },
      { name: 'Validate AI response structure', status: 'pending' },
      { name: 'Check response quality', status: 'pending' },
    ]

    const flow: E2EFlow = { id: flowId, name: 'AI Interpretation', description: 'Test AI analysis endpoint with sample signal data', steps, status: 'running' }
    setFlows(prev => [...prev.filter(f => f.id !== flowId), flow])
    setCurrentFlow(flowId)
    const start = performance.now()

    try {
      // Step 1: Call interpret endpoint
      updateStep(flowId, 0, { status: 'running' })
      const res = await timedFetch('/api/test/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal_name: 'Revenue',
          value: 58000,
          change_percent: 12.5,
          context: 'Monthly recurring revenue for a SaaS company',
        }),
      })
      updateStep(flowId, 0, { status: res.ok ? 'pass' : 'fail', statusCode: res.status, responseTime: res.time, error: res.ok ? undefined : JSON.stringify(res.data)?.substring(0, 200) })
      if (!res.ok) throw new Error(`Interpret failed: ${res.status}`)

      // Step 2: Validate structure
      updateStep(flowId, 1, { status: 'running' })
      const hasFields = res.data && (res.data.interpretation || res.data.what_we_found || res.data.result)
      updateStep(flowId, 1, { status: hasFields ? 'pass' : 'fail', detail: `Fields present: ${Object.keys(res.data || {}).join(', ')}` })

      // Step 3: Check quality
      updateStep(flowId, 2, { status: 'running' })
      const responseText = JSON.stringify(res.data)
      const hasSubstance = responseText.length > 50
      updateStep(flowId, 2, { status: hasSubstance ? 'pass' : 'fail', detail: `Response length: ${responseText.length} chars` })

      const allPass = res.ok && hasFields && hasSubstance
      const totalTime = Math.round(performance.now() - start)
      updateFlow(flowId, f => ({ ...f, status: allPass ? 'pass' : 'fail', totalTime }))
      return { ...flow, status: allPass ? 'pass' : 'fail', totalTime }
    } catch (err) {
      const totalTime = Math.round(performance.now() - start)
      updateFlow(flowId, f => ({
        ...f,
        status: 'fail',
        totalTime,
        steps: f.steps.map(s => s.status === 'pending' ? { ...s, status: 'skip' as StepStatus } : s),
      }))
      return { ...flow, status: 'fail', totalTime }
    }
  }

  // Run all flows
  const runAll = async () => {
    setRunning(true)
    abortRef.current = false
    setFlows([])

    await runPageLoadFlow()
    if (!abortRef.current) await runAPIHealthFlow()
    if (!abortRef.current) await runTestEndpointsFlow()
    if (!abortRef.current) await runUploadFlow()
    if (!abortRef.current) await runAIFlow()

    setRunning(false)
    setCurrentFlow(null)
  }

  const abort = () => {
    abortRef.current = true
  }

  // Summary counts
  const totalSteps = flows.reduce((sum, f) => sum + f.steps.length, 0)
  const passedSteps = flows.reduce((sum, f) => sum + f.steps.filter(s => s.status === 'pass').length, 0)
  const failedSteps = flows.reduce((sum, f) => sum + f.steps.filter(s => s.status === 'fail').length, 0)
  const skippedSteps = flows.reduce((sum, f) => sum + f.steps.filter(s => s.status === 'skip').length, 0)
  const totalTime = flows.reduce((sum, f) => sum + (f.totalTime || 0), 0)

  const statusIcon = (status: StepStatus) => {
    switch (status) {
      case 'pass': return <span className="text-green-600 font-bold">PASS</span>
      case 'fail': return <span className="text-red-600 font-bold">FAIL</span>
      case 'skip': return <span className="text-muted-foreground">SKIP</span>
      case 'running': return <span className="text-blue-600 animate-pulse font-medium">Running...</span>
      default: return <span className="text-muted-foreground">--</span>
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">End-to-End Tests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Simulates real user flows through the full stack
            </p>
          </div>
          <div className="flex gap-2">
            {running ? (
              <Button variant="destructive" onClick={abort}>Stop</Button>
            ) : (
              <Button onClick={runAll}>Run All Flows</Button>
            )}
          </div>
        </div>

        {/* Summary Bar */}
        {flows.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-6 text-sm">
                  <span className="text-green-600 font-semibold">{passedSteps} passed</span>
                  <span className="text-red-600 font-semibold">{failedSteps} failed</span>
                  <span className="text-muted-foreground">{skippedSteps} skipped</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {totalTime > 0 ? `${(totalTime / 1000).toFixed(1)}s total` : ''}
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
                {totalSteps > 0 && (
                  <>
                    <div className="bg-green-600 h-full transition-all" style={{ width: `${(passedSteps / totalSteps) * 100}%` }} />
                    <div className="bg-red-600 h-full transition-all" style={{ width: `${(failedSteps / totalSteps) * 100}%` }} />
                    <div className="bg-muted-foreground/30 h-full transition-all" style={{ width: `${(skippedSteps / totalSteps) * 100}%` }} />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flow Results */}
        {flows.map(flow => (
          <Card key={flow.id} className={flow.status === 'fail' ? 'border-red-300' : flow.status === 'pass' ? 'border-green-300' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{flow.name}</CardTitle>
                  <CardDescription>{flow.description}</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {flow.totalTime != null && (
                    <span className="text-xs text-muted-foreground">{(flow.totalTime / 1000).toFixed(1)}s</span>
                  )}
                  {statusIcon(flow.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {flow.steps.map((step, idx) => (
                  <div key={idx} className={`flex items-start justify-between p-3 rounded-lg text-sm ${
                    step.status === 'fail' ? 'bg-red-50' :
                    step.status === 'pass' ? 'bg-green-50' :
                    step.status === 'running' ? 'bg-blue-50' :
                    'bg-muted/50'
                  }`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{step.name}</span>
                        {step.statusCode && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                            step.statusCode < 300 ? 'bg-green-200 text-green-800' :
                            step.statusCode < 400 ? 'bg-yellow-200 text-yellow-800' :
                            step.statusCode < 500 ? 'bg-orange-200 text-orange-800' :
                            'bg-red-200 text-red-800'
                          }`}>{step.statusCode}</span>
                        )}
                        {step.responseTime != null && (
                          <span className={`text-xs ${step.responseTime > 3000 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                            {step.responseTime}ms
                          </span>
                        )}
                      </div>
                      {step.detail && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{step.detail}</p>
                      )}
                      {step.error && (
                        <p className="text-xs text-red-600 mt-1 truncate">{step.error}</p>
                      )}
                    </div>
                    <div className="ml-3 shrink-0">
                      {statusIcon(step.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {flows.length === 0 && !running && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p className="text-lg font-medium mb-2">No tests run yet</p>
              <p className="text-sm mb-6">
                E2E tests simulate real user journeys: page loads, data upload, signal detection, AI analysis.
                Each flow chains multiple API calls together, where each step depends on the previous one.
              </p>
              <Button onClick={runAll}>Run All Flows</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
