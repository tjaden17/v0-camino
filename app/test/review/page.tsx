'use client'

import React from "react"

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ClipboardCheck, Shield, FileStack, ExternalLink } from 'lucide-react'
import { DELIVERY_PLAN, getDeliveryStats, getReleaseProgress } from '@/docs/delivery-plan'

type ReviewType = 'delivery' | 'tech' | 'both'

interface ReviewRun {
  type: ReviewType
  label: string
  content: string
  status: 'idle' | 'streaming' | 'complete' | 'error'
  startedAt?: number
  completedAt?: number
}

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-sm font-bold text-foreground mt-5 mb-1.5">
          {renderInline(trimmed.slice(5))}
        </h4>
      )
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-foreground mt-6 mb-2">
          {renderInline(trimmed.slice(4))}
        </h3>
      )
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-lg font-bold text-foreground mt-8 mb-3 pb-2 border-b border-border">
          {renderInline(trimmed.slice(3))}
        </h2>
      )
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-xl font-bold text-foreground mt-8 mb-4 pb-2 border-b-2 border-border">
          {renderInline(trimmed.slice(2))}
        </h1>
      )
    } else if (trimmed.startsWith('---')) {
      elements.push(<hr key={i} className="my-6 border-border" />)
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.slice(2)
      // Color-code status items
      let statusClass = 'text-muted-foreground'
      if (content.includes('DONE') || content.includes('MET') || content.includes('SHIPPED') || content.includes('Built')) {
        statusClass = 'text-green-600'
      } else if (content.includes('PARTIAL') || content.includes('AT RISK') || content.includes('ON TRACK')) {
        statusClass = 'text-amber-600'
      } else if (content.includes('NOT STARTED') || content.includes('BLOCKED') || content.includes('UNMET')) {
        statusClass = 'text-red-600'
      }
      elements.push(
        <div key={i} className="flex gap-2 py-0.5 pl-2">
          <span className="text-muted-foreground mt-0.5 shrink-0 text-xs">{'--'}</span>
          <span className={`text-sm leading-relaxed ${statusClass}`}>{renderInline(content)}</span>
        </div>
      )
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.+)/)
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 py-0.5 pl-2">
            <span className="text-muted-foreground mt-0.5 shrink-0 font-mono text-xs w-5">{match[1]}.</span>
            <span className="text-sm text-muted-foreground leading-relaxed">{renderInline(match[2])}</span>
          </div>
        )
      }
    } else if (trimmed.startsWith('|')) {
      // Simple table rendering
      const cells = trimmed.split('|').filter(c => c.trim() !== '')
      if (cells.some(c => /^[-:]+$/.test(c.trim()))) {
        // Separator row, skip
        continue
      }
      const isHeader = i + 1 < lines.length && lines[i + 1].trim().startsWith('|') && lines[i + 1].includes('---')
      elements.push(
        <div key={i} className={`flex gap-0 text-xs ${isHeader ? 'font-semibold text-foreground border-b border-border' : 'text-muted-foreground'}`}>
          {cells.map((cell, j) => (
            <div key={j} className="flex-1 py-1 px-2 truncate">{renderInline(cell.trim())}</div>
          ))}
        </div>
      )
    } else if (trimmed === '') {
      elements.push(<div key={i} className="h-2" />)
    } else {
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">{renderInline(trimmed)}</p>
      )
    }
  }

  return <>{elements}</>
}

function renderInline(text: string): React.ReactNode[] {
  // Split on bold markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  const result: React.ReactNode[] = []

  for (let j = 0; j < parts.length; j++) {
    const part = parts[j]
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2)
      // Color-code specific statuses in bold
      let cls = 'font-semibold text-foreground'
      if (['DONE', 'SHIPPED', 'MET', 'Built'].some(s => inner.includes(s))) cls = 'font-semibold text-green-600'
      else if (['PARTIAL', 'AT RISK', 'ON TRACK'].some(s => inner.includes(s))) cls = 'font-semibold text-amber-600'
      else if (['NOT STARTED', 'BLOCKED', 'UNMET'].some(s => inner.includes(s))) cls = 'font-semibold text-red-600'
      result.push(<strong key={j} className={cls}>{inner}</strong>)
    } else {
      // Handle inline code
      const codeParts = part.split(/(`[^`]+`)/g)
      for (let k = 0; k < codeParts.length; k++) {
        const cp = codeParts[k]
        if (cp.startsWith('`') && cp.endsWith('`')) {
          result.push(
            <code key={`${j}-${k}`} className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">
              {cp.slice(1, -1)}
            </code>
          )
        } else {
          result.push(<span key={`${j}-${k}`}>{cp}</span>)
        }
      }
    }
  }

  return result
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Record<ReviewType, ReviewRun>>({
    delivery: { type: 'delivery', label: 'Delivery Manager', content: '', status: 'idle' },
    tech: { type: 'tech', label: 'Head of Technology', content: '', status: 'idle' },
    both: { type: 'both', label: 'Full Review', content: '', status: 'idle' },
  })
  const [activeReview, setActiveReview] = useState<ReviewType | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const runReview = async (type: ReviewType) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setActiveReview(type)
    setReviews(prev => ({
      ...prev,
      [type]: { ...prev[type], content: '', status: 'streaming', startedAt: Date.now(), completedAt: undefined },
    }))

    try {
      const response = await fetch('/api/test/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewType: type }),
        signal: controller.signal,
      })

      if (!response.ok) throw new Error(`Review failed: ${response.status}`)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk
        setReviews(prev => ({
          ...prev,
          [type]: { ...prev[type], content: fullContent },
        }))
      }

      setReviews(prev => ({
        ...prev,
        [type]: { ...prev[type], status: 'complete', completedAt: Date.now() },
      }))
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Unknown error'
      setReviews(prev => ({
        ...prev,
        [type]: { ...prev[type], status: 'error', content: `${prev[type].content}\n\nERROR: ${message}` },
      }))
    } finally {
      setActiveReview(null)
    }
  }

  const formatDuration = (start?: number, end?: number) => {
    if (!start) return ''
    const elapsed = (end || Date.now()) - start
    return `${(elapsed / 1000).toFixed(1)}s`
  }

  const isAnyRunning = activeReview !== null

  const reviewCards: { type: ReviewType; icon: typeof ClipboardCheck; title: string; description: string; buttonLabel: string }[] = [
    {
      type: 'delivery',
      icon: ClipboardCheck,
      title: 'Delivery Manager',
      description: 'Reviews against delivery plan: release status, user story acceptance criteria, module health, and sprint recommendations.',
    buttonLabel: 'Run Delivery Review',
    },
    {
      type: 'tech',
      icon: Shield,
      title: 'Head of Technology',
      description: 'Architecture consistency, security audit, database health, performance risks, tech debt, and scalability.',
      buttonLabel: 'Run Tech Review',
    },
    {
      type: 'both',
      icon: FileStack,
      title: 'Full Review',
      description: 'Both reviews in one pass. Delivery plan assessment plus full technical audit.',
      buttonLabel: 'Run Full Review',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Product Review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI reviews your codebase against the delivery plan. 6 releases, 28 user stories, 5 modules.
          </p>
        </div>

        {/* Review Cards */}
        <div className="space-y-3">
          {reviewCards.map(({ type, icon: Icon, title, description, buttonLabel }) => {
            const review = reviews[type]
            const isStreaming = review.status === 'streaming'
            const isComplete = review.status === 'complete'

            return (
              <Card
                key={type}
                className={`transition-all ${isComplete ? 'border-green-500/30' : ''} ${isStreaming ? 'border-primary' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${isComplete ? 'bg-green-500/10' : 'bg-muted'}`}>
                        <Icon className={`h-4 w-4 ${isComplete ? 'text-green-600' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isComplete && review.startedAt && review.completedAt && (
                        <span className="text-xs text-muted-foreground">{formatDuration(review.startedAt, review.completedAt)}</span>
                      )}
                      <Button
                        onClick={() => runReview(type)}
                        disabled={isAnyRunning}
                        size="sm"
                        variant={isComplete ? 'outline' : 'default'}
                        className="min-w-[100px]"
                      >
                        {isStreaming && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                        {isComplete ? 'Re-run' : buttonLabel}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Streaming/Complete content */}
                {review.content && (
                  <CardContent className="pt-0">
                    <div className="border-t border-border pt-4 mt-1">
                      {isStreaming && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                          <span className="text-xs text-primary font-medium">Reviewing...</span>
                        </div>
                      )}
                      <div className="max-w-none">
                        <MarkdownRenderer text={review.content} />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Delivery Plan Summary (always visible) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Plan Summary</CardTitle>
            <CardDescription className="text-xs">
              What the AI reviews against. Extracted from PRODUCT_SPEC_DOC.md and MODULES_3_FEB_2026.md.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Releases */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Releases</h3>
                <div className="space-y-1.5">
                  {[
                    { name: 'R1: Foundation', stories: 4, status: 'In Progress' },
                    { name: 'R2: Data In + Signal Core', stories: 4, status: 'In Progress' },
                    { name: 'R3: Executive Experience', stories: 8, status: 'In Progress' },
                    { name: 'R4: Sharing + Collaboration', stories: 2, status: 'Not Started' },
                    { name: 'R5: Admin Panel', stories: 8, status: 'In Progress' },
                    { name: 'R6: Demos + Prospects', stories: 2, status: 'Not Started' },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center justify-between text-sm py-1 px-2 rounded bg-muted/50">
                      <span className="text-foreground font-medium">{r.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{r.stories} stories</span>
                        <span className={`text-xs font-medium ${r.status === 'In Progress' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modules */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Modules</h3>
                <div className="space-y-1.5">
                  {[
                    { name: 'Data In', built: 4, total: 5 },
                    { name: 'Signal Core', built: 4, total: 5 },
                    { name: 'Synthesis (AI)', built: 4, total: 6 },
                    { name: 'User Context', built: 3, total: 5 },
                    { name: 'Presentation', built: 5, total: 7 },
                  ].map((m) => (
                    <div key={m.name} className="flex items-center justify-between text-sm py-1 px-2 rounded bg-muted/50">
                      <span className="text-foreground font-medium">{m.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(m.built / m.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{m.built}/{m.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
