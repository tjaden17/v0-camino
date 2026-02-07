'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type TestStatus = 'pending' | 'running' | 'pass' | 'fail' | 'warn'

interface TestResult {
  name: string
  path: string
  category: string
  status: TestStatus
  statusCode?: number
  responseTime?: number
  error?: string
  details?: string
}

const SMOKE_TESTS: Omit<TestResult, 'status'>[] = [
  // Auth pages (should load without login)
  { name: 'Landing Page', path: '/', category: 'Pages (Public)' },
  { name: 'Login Page', path: '/auth/login', category: 'Pages (Public)' },
  { name: 'Signup Page', path: '/auth/signup', category: 'Pages (Public)' },
  { name: 'Admin Login', path: '/auth/admin-login', category: 'Pages (Public)' },
  { name: 'Test Workflow', path: '/test-workflow', category: 'Pages (Public)' },
  { name: 'Test Page', path: '/test', category: 'Pages (Public)' },
  { name: 'Guidance Page', path: '/guidance', category: 'Pages (Public)' },
  { name: 'Setup Page', path: '/setup', category: 'Pages (Public)' },

  // API - GET endpoints (should return JSON, even if auth error)
  { name: 'GET /api/signals', path: '/api/signals', category: 'API (GET)' },
  { name: 'GET /api/decisions', path: '/api/decisions', category: 'API (GET)' },
  { name: 'GET /api/insights', path: '/api/insights', category: 'API (GET)' },
  { name: 'GET /api/kpis', path: '/api/kpis', category: 'API (GET)' },
  { name: 'GET /api/integrations', path: '/api/integrations', category: 'API (GET)' },
  { name: 'GET /api/benchmarks', path: '/api/benchmarks', category: 'API (GET)' },
  { name: 'GET /api/data-quality', path: '/api/data-quality', category: 'API (GET)' },
  { name: 'GET /api/data-sources', path: '/api/data-sources', category: 'API (GET)' },
  { name: 'GET /api/relationships', path: '/api/relationships', category: 'API (GET)' },
  { name: 'GET /api/signals/ranked', path: '/api/signals/ranked', category: 'API (GET)' },
  { name: 'GET /api/user/context', path: '/api/user/context', category: 'API (GET)' },
  { name: 'GET /api/user/onboarding-status', path: '/api/user/onboarding-status', category: 'API (GET)' },

  // API - Test endpoints (no auth needed)
  { name: 'GET /api/test/signals', path: '/api/test/signals', category: 'API (Test)' },
  { name: 'GET /api/test/users', path: '/api/test/users', category: 'API (Test)' },
  { name: 'GET /api/test/organizations', path: '/api/test/organizations', category: 'API (Test)' },

  // API - Admin endpoints
  { name: 'GET /api/admin/signals/availability', path: '/api/admin/signals/availability', category: 'API (Admin)' },
]

function statusIcon(status: TestStatus) {
  switch (status) {
    case 'pass': return '●'
    case 'fail': return '●'
    case 'warn': return '●'
    case 'running': return '◌'
    default: return '○'
  }
}

function statusColor(status: TestStatus) {
  switch (status) {
    case 'pass': return 'text-green-600'
    case 'fail': return 'text-red-600'
    case 'warn': return 'text-amber-600'
    case 'running': return 'text-blue-600 animate-pulse'
    default: return 'text-muted-foreground'
  }
}

export default function SmokeTestPage() {
  const [results, setResults] = useState<TestResult[]>(
    SMOKE_TESTS.map(t => ({ ...t, status: 'pending' as TestStatus }))
  )
  const [running, setRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)

  const updateResult = useCallback((path: string, update: Partial<TestResult>) => {
    setResults(prev => prev.map(r => r.path === path ? { ...r, ...update } : r))
  }, [])

  const runAllTests = async () => {
    setRunning(true)
    setStartTime(Date.now())
    setEndTime(null)
    setResults(SMOKE_TESTS.map(t => ({ ...t, status: 'pending' as TestStatus })))

    for (const test of SMOKE_TESTS) {
      updateResult(test.path, { status: 'running' })

      const t0 = performance.now()
      try {
        const res = await fetch(test.path, {
          method: 'GET',
          redirect: 'follow',
          headers: { 'Accept': 'text/html,application/json' },
        })
        const responseTime = Math.round(performance.now() - t0)
        const contentType = res.headers.get('content-type') || ''

        let details = ''
        if (contentType.includes('application/json')) {
          try {
            const json = await res.json()
            if (json.error) details = `Error: ${json.error}`
            else details = `JSON response (${Object.keys(json).length} keys)`
          } catch {
            details = 'Could not parse JSON'
          }
        } else {
          details = `HTML response (${res.status})`
        }

        // Determine status
        let status: TestStatus = 'pass'
        if (res.status >= 500) {
          status = 'fail'
        } else if (res.status === 401 || res.status === 403) {
          // Auth errors are expected for protected routes
          if (test.category.includes('Public') || test.category.includes('Test')) {
            status = 'fail'
          } else {
            status = 'warn'
            details = `Auth required (${res.status}) - expected for protected routes`
          }
        } else if (res.status >= 400) {
          status = 'warn'
        }

        updateResult(test.path, { status, statusCode: res.status, responseTime, details })
      } catch (err) {
        const responseTime = Math.round(performance.now() - t0)
        updateResult(test.path, {
          status: 'fail',
          responseTime,
          error: err instanceof Error ? err.message : 'Network error',
        })
      }
    }

    setEndTime(Date.now())
    setRunning(false)
  }

  const categories = [...new Set(SMOKE_TESTS.map(t => t.category))]
  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warnCount = results.filter(r => r.status === 'warn').length
  const totalTime = startTime && endTime ? ((endTime - startTime) / 1000).toFixed(1) : null

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Smoke Tests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Critical path health check across {SMOKE_TESTS.length} endpoints
            </p>
          </div>
          <Button onClick={runAllTests} disabled={running} size="lg">
            {running ? 'Running...' : 'Run All Tests'}
          </Button>
        </div>

        {/* Summary Bar */}
        {(passCount > 0 || failCount > 0) && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold text-2xl">{passCount}</span>
                  <span className="text-sm text-muted-foreground">Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-bold text-2xl">{failCount}</span>
                  <span className="text-sm text-muted-foreground">Failed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold text-2xl">{warnCount}</span>
                  <span className="text-sm text-muted-foreground">Warnings</span>
                </div>
                {totalTime && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-muted-foreground text-sm">Completed in {totalTime}s</span>
                  </div>
                )}
              </div>
              {/* Progress bar */}
              <div className="flex h-2 rounded-full overflow-hidden mt-4 bg-muted">
                {passCount > 0 && (
                  <div
                    className="bg-green-500 transition-all duration-500"
                    style={{ width: `${(passCount / results.length) * 100}%` }}
                  />
                )}
                {warnCount > 0 && (
                  <div
                    className="bg-amber-500 transition-all duration-500"
                    style={{ width: `${(warnCount / results.length) * 100}%` }}
                  />
                )}
                {failCount > 0 && (
                  <div
                    className="bg-red-500 transition-all duration-500"
                    style={{ width: `${(failCount / results.length) * 100}%` }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results by Category */}
        {categories.map(category => {
          const categoryTests = results.filter(r => r.category === category)
          const catFails = categoryTests.filter(r => r.status === 'fail').length

          return (
            <Card key={category} className={catFails > 0 ? 'border-red-200' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {category}
                  {catFails > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {catFails} failed
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{categoryTests.length} tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {categoryTests.map(test => (
                    <div
                      key={test.path}
                      className={`flex items-start gap-3 py-2.5 px-3 rounded-lg text-sm ${
                        test.status === 'fail' ? 'bg-red-50' : 
                        test.status === 'warn' ? 'bg-amber-50' : ''
                      }`}
                    >
                      {/* Status icon */}
                      <span className={`text-lg leading-none mt-0.5 ${statusColor(test.status)}`}>
                        {statusIcon(test.status)}
                      </span>

                      {/* Test info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{test.name}</span>
                          {test.statusCode && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                              test.statusCode < 300 ? 'bg-green-100 text-green-800' :
                              test.statusCode < 400 ? 'bg-blue-100 text-blue-800' :
                              test.statusCode < 500 ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {test.statusCode}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                          {test.path}
                        </p>
                        {(test.details || test.error) && (
                          <p className={`text-xs mt-1 ${test.error ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {test.error || test.details}
                          </p>
                        )}
                      </div>

                      {/* Response time */}
                      {test.responseTime !== undefined && (
                        <span className={`text-xs font-mono whitespace-nowrap ${
                          test.responseTime > 3000 ? 'text-red-600' :
                          test.responseTime > 1000 ? 'text-amber-600' :
                          'text-muted-foreground'
                        }`}>
                          {test.responseTime}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
