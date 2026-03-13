"use client"

import React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2, ChevronDown, ChevronRight, CheckCircle2, Circle, AlertCircle,
  XCircle, Clock, Target, ClipboardCheck, BarChart3, Minus, Zap, Layers,
  AlertTriangle, Lightbulb
} from "lucide-react"
import {
  DELIVERY_PLAN,
  getDeliveryStats,
  getSprintStories,
  getSprintProgress,
  getActiveSprint,
  getReleaseProgress,
  getStoryRelease,
  getTierStats,
} from "@/docs/delivery-plan"
import type { UserStory, Sprint } from "@/docs/delivery-plan"

// --- Status + Priority helpers ---

function statusIcon(status: UserStory["status"]) {
  switch (status) {
    case "done": return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case "in-progress": return <Clock className="h-4 w-4 text-amber-500" />
    case "blocked": return <XCircle className="h-4 w-4 text-red-500" />
    case "cut": return <Minus className="h-4 w-4 text-muted-foreground line-through" />
    default: return <Circle className="h-4 w-4 text-muted-foreground" />
  }
}

function statusLabel(status: UserStory["status"]) {
  const map: Record<string, string> = { "not-started": "To Do", "in-progress": "In Progress", done: "Done", blocked: "Blocked", cut: "Cut" }
  return map[status] || status
}

function statusBadgeVariant(status: UserStory["status"]): "default" | "secondary" | "destructive" | "outline" {
  if (status === "done") return "default"
  if (status === "in-progress") return "secondary"
  if (status === "blocked") return "destructive"
  return "outline"
}

function priorityColor(p?: string) {
  if (p === "critical") return "text-red-600 bg-red-50"
  if (p === "high") return "text-amber-700 bg-amber-50"
  if (p === "medium") return "text-blue-700 bg-blue-50"
  return "text-muted-foreground bg-muted"
}

function tierBadge(tier: 1 | 2) {
  if (tier === 1) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800">TIER 1</span>
  return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">TIER 2</span>
}

// --- Story card ---

function StoryCard({ story }: { story: UserStory }) {
  const [expanded, setExpanded] = useState(false)
  const metCount = story.acceptance.filter(a => a.met).length
  const totalCount = story.acceptance.length
  const pct = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0

  return (
    <div className={`border rounded-lg ${story.tier === 1 ? "border-green-200 bg-green-50/30" : "border-border bg-card"}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 text-left"
      >
        <div className="mt-0.5 shrink-0">{statusIcon(story.status)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">{story.id}</span>
            <span className="text-sm font-medium text-foreground">{story.title}</span>
            {tierBadge(story.tier)}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={statusBadgeVariant(story.status)} className="text-[10px] h-5">
              {statusLabel(story.status)}
            </Badge>
            {story.priority && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityColor(story.priority)}`}>
                {story.priority}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">{story.persona}</span>
            <span className="text-[10px] text-muted-foreground">{getStoryRelease(story.id)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium ${pct === 100 ? "text-green-600" : pct > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
            {metCount}/{totalCount}
          </span>
          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mt-2 mb-1.5">Acceptance Criteria</p>
          <div className="space-y-1">
            {story.acceptance.map((ac, i) => (
              <div key={i} className="flex items-start gap-2 py-0.5">
                {ac.met
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                  : <Circle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />}
                <span className={`text-xs leading-relaxed ${ac.met ? "text-foreground" : "text-muted-foreground"}`}>
                  {ac.text}
                </span>
              </div>
            ))}
          </div>
          {story.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-border pl-2">{story.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}

// --- Sprint section ---

function SprintSection({ sprint, defaultOpen }: { sprint: Sprint; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const stories = getSprintStories(sprint)
  const progress = getSprintProgress(sprint)

  const sprintStatusColor = {
    active: "text-green-700 bg-green-50 border-green-200",
    planning: "text-blue-700 bg-blue-50 border-blue-200",
    review: "text-amber-700 bg-amber-50 border-amber-200",
    done: "text-muted-foreground bg-muted border-border",
  }

  const columns: { label: string; stories: UserStory[] }[] = [
    { label: "To Do", stories: stories.filter(s => s.status === "not-started") },
    { label: "In Progress", stories: stories.filter(s => s.status === "in-progress") },
    { label: "Done", stories: stories.filter(s => s.status === "done") },
    { label: "Blocked", stories: stories.filter(s => s.status === "blocked") },
  ].filter(c => c.stories.length > 0)

  return (
    <Card className={sprint.status === "active" ? "border-primary/40" : ""}>
      <CardHeader className="pb-3">
        <button type="button" onClick={() => setOpen(!open)} className="w-full text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {open ? <ChevronDown className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{sprint.name}</CardTitle>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${sprintStatusColor[sprint.status]}`}>
                    {sprint.status}
                  </span>
                  {sprint.tier === 1
                    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">TIER 1: START CHARGING</span>
                    : <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">TIER 2: KEEP DELIVERING</span>
                  }
                </div>
                <CardDescription className="text-xs mt-0.5">
                  {sprint.startDate} to {sprint.endDate} -- {sprint.goal}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${progress.percent === 100 ? "bg-green-500" : progress.percent > 0 ? "bg-amber-500" : "bg-muted-foreground/20"}`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground w-8 text-right">{progress.percent}%</span>
            </div>
          </div>
        </button>
      </CardHeader>

      {open && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 mb-4 pb-3 border-b border-border flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Stories:</span>
              <span className="text-xs font-medium">{progress.totalStories}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="text-xs">{progress.storiesDone} done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-amber-500" />
              <span className="text-xs">{progress.storiesInProgress} in progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">{progress.storiesNotStarted} to do</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Criteria:</span>
              <span className="text-xs font-medium">{progress.criteriaMet}/{progress.totalCriteria} met</span>
            </div>
          </div>

          <div className="space-y-4">
            {columns.map(col => (
              <div key={col.label}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{col.label} ({col.stories.length})</p>
                <div className="space-y-2">
                  {col.stories.map(story => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// --- Markdown renderer ---

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-base font-bold text-foreground mt-6 mb-2 pb-1.5 border-b border-border">{trimmed.slice(3)}</h2>)
    } else if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-sm font-bold text-foreground mt-4 mb-1.5">{trimmed.slice(4)}</h3>)
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.slice(2)
      let cls = "text-muted-foreground"
      if (content.includes("DONE") || content.includes("MET") || content.includes("SHIPPED")) cls = "text-green-600"
      else if (content.includes("PARTIAL") || content.includes("AT RISK")) cls = "text-amber-600"
      else if (content.includes("NOT STARTED") || content.includes("BLOCKED") || content.includes("UNMET")) cls = "text-red-600"
      elements.push(
        <div key={i} className="flex gap-2 py-0.5 pl-2">
          <span className="text-muted-foreground mt-0.5 shrink-0 text-xs">--</span>
          <span className={`text-sm leading-relaxed ${cls}`}>{renderBold(content)}</span>
        </div>
      )
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.+)/)
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 py-0.5 pl-2">
            <span className="text-muted-foreground font-mono text-xs w-5">{match[1]}.</span>
            <span className="text-sm text-muted-foreground leading-relaxed">{renderBold(match[2])}</span>
          </div>
        )
      }
    } else if (trimmed === "") {
      elements.push(<div key={i} className="h-1.5" />)
    } else {
      elements.push(<p key={i} className="text-sm text-muted-foreground leading-relaxed">{renderBold(trimmed)}</p>)
    }
  }
  return <>{elements}</>
}

function renderBold(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2)
      let cls = "font-semibold text-foreground"
      if (["DONE", "SHIPPED", "MET"].some(s => inner.includes(s))) cls = "font-semibold text-green-600"
      else if (["PARTIAL", "AT RISK"].some(s => inner.includes(s))) cls = "font-semibold text-amber-600"
      else if (["NOT STARTED", "BLOCKED", "UNMET"].some(s => inner.includes(s))) cls = "font-semibold text-red-600"
      return <strong key={i} className={cls}>{inner}</strong>
    }
    return part.split(/(`[^`]+`)/g).map((cp, k) => {
      if (cp.startsWith("`") && cp.endsWith("`")) {
        return <code key={`${i}-${k}`} className="text-xs bg-muted px-1 py-0.5 rounded font-mono">{cp.slice(1, -1)}</code>
      }
      return <span key={`${i}-${k}`}>{cp}</span>
    })
  })
}

// --- Tab types ---
type Tab = "overview" | "sprints" | "backlog" | "releases" | "review"

// --- Main page ---

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [reviewContent, setReviewContent] = useState("")
  const [reviewStatus, setReviewStatus] = useState<"idle" | "streaming" | "complete" | "error">("idle")
  const abortRef = useRef<AbortController | null>(null)

  const stats = getDeliveryStats()
  const activeSprint = getActiveSprint()
  const tier1 = getTierStats(1)
  const tier2 = getTierStats(2)
  const overallPct = stats.totalCriteria > 0 ? Math.round((stats.criteriaMet / stats.totalCriteria) * 100) : 0

  const runReview = async () => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setReviewContent("")
    setReviewStatus("streaming")

    try {
      const response = await fetch("/api/test/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewType: "delivery" }),
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`Review failed: ${response.status}`)

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let full = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setReviewContent(full)
      }
      setReviewStatus("complete")
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return
      setReviewStatus("error")
      setReviewContent((prev) => `${prev}\n\nERROR: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof Target }[] = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "sprints", label: "Sprints", icon: Target },
    { id: "backlog", label: "Backlog", icon: BarChart3 },
    { id: "releases", label: "Releases", icon: Clock },
    { id: "review", label: "AI Review", icon: ClipboardCheck },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Delivery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {DELIVERY_PLAN.productName} -- North Star: {DELIVERY_PLAN.northStar}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Customer promise: {DELIVERY_PLAN.customerPromise} -- Last updated {DELIVERY_PLAN.lastUpdated}
        </p>
      </div>

      {/* Tier 1 vs Tier 2 summary */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="border-green-200 bg-green-50/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-green-700" />
            <p className="text-sm font-bold text-green-800">Tier 1: Start Charging</p>
            <span className="text-xs text-green-700 ml-auto">Sprints 1-2</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-green-800">{tier1.percent}%</span>
            <div className="flex-1">
              <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full transition-all" style={{ width: `${tier1.percent}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-green-700">
            <span>{tier1.stories} stories</span>
            <span>{tier1.done} done</span>
            <span>{tier1.inProgress} in progress</span>
            <span>{tier1.criteriaMet}/{tier1.criteria} criteria met</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-bold text-foreground">Tier 2: Keep Delivering</p>
            <span className="text-xs text-muted-foreground ml-auto">Sprints 3-6</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-foreground">{tier2.percent}%</span>
            <div className="flex-1">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${tier2.percent}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{tier2.stories} stories</span>
            <span>{tier2.done} done</span>
            <span>{tier2.inProgress} in progress</span>
            <span>{tier2.criteriaMet}/{tier2.criteria} criteria met</span>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* === OVERVIEW TAB === */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* User problems */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                User Problems to Solve
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {DELIVERY_PLAN.userProblems.map(p => (
                  <div key={p.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-bold text-foreground shrink-0 w-6">{p.id}.</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.problem}</p>
                      <p className="text-xs text-muted-foreground mt-1">Outcome: {p.outcome}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Overall</p>
              <p className="text-2xl font-bold text-foreground">{overallPct}%</p>
              <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${overallPct}%` }} />
              </div>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Stories</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalStories}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stats.storiesDone} done, {stats.storiesInProgress} active</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Criteria</p>
              <p className="text-2xl font-bold text-foreground">{stats.criteriaMet}/{stats.totalCriteria}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stats.criteriaUnmet} remaining</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Active Sprint</p>
              <p className="text-lg font-bold text-foreground truncate">{activeSprint ? `S${activeSprint.number}` : "None"}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{activeSprint?.goal.slice(0, 50)}...</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Modules</p>
              <p className="text-2xl font-bold text-foreground">{stats.componentsBuilt}/{stats.moduleComponents}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stats.componentsPartial} partial</p>
            </Card>
          </div>

          {/* Billable definition */}
          <Card className="border-green-200 bg-green-50/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-green-700" />
                Definition of "Billable" (Tier 1 Complete)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {[
                  { text: 'Manager can upload a CSV and see it processed within 2 minutes', done: true },
                  { text: 'System generates at least 3 signals from the upload', done: true },
                  { text: 'Each signal has AI-generated interpretation with 5-section analysis', done: true },
                  { text: 'Section 6: Implication on company KPIs from user/org context', done: false },
                  { text: 'Executive can browse signals and read the expanded view', done: true },
                  { text: 'Analysis is accurate and relevant to the customer\'s business context', done: false },
                  { text: 'Master admin can create users and assign to org', done: false },
                  { text: 'Deployed to production', done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {item.done
                      ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      : <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                    <span className={`text-sm ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Module health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Module Health</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {DELIVERY_PLAN.modules.map(mod => {
                  const built = mod.builtStatus.filter(s => s === "Built").length
                  const partial = mod.builtStatus.filter(s => s === "Partial").length
                  const total = mod.components.length
                  const pct = Math.round(((built + partial * 0.5) / total) * 100)
                  return (
                    <div key={mod.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{mod.name}</span>
                        <span className="text-xs text-muted-foreground">{built}/{total} built{partial > 0 ? `, ${partial} partial` : ""}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {mod.components.map((comp, i) => {
                          const st = mod.builtStatus[i]
                          const color = st === "Built" ? "bg-green-100 text-green-800" : st === "Partial" ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"
                          return <span key={comp} className={`text-[10px] px-1.5 py-0.5 rounded ${color}`}>{comp}</span>
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* === SPRINTS TAB === */}
      {activeTab === "sprints" && (
        <div className="space-y-4">
          {DELIVERY_PLAN.sprints.map(sprint => (
            <SprintSection key={sprint.number} sprint={sprint} defaultOpen={sprint.status === "active"} />
          ))}
        </div>
      )}

      {/* === BACKLOG TAB === */}
      {activeTab === "backlog" && (
        <div className="space-y-4">
          {/* Tier 1 backlog */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-700" />
                Tier 1: Start Charging ({tier1.stories} stories)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {DELIVERY_PLAN.releases
                  .flatMap(r => r.userStories)
                  .filter(s => s.tier === 1)
                  .sort((a, b) => {
                    const order = { critical: 0, high: 1, medium: 2, low: 3 }
                    return (order[a.priority] || 3) - (order[b.priority] || 3)
                  })
                  .map(story => <StoryCard key={story.id} story={story} />)}
              </div>
            </CardContent>
          </Card>

          {/* Tier 2 backlog */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Tier 2: Keep Delivering ({tier2.stories} stories)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {DELIVERY_PLAN.releases
                  .flatMap(r => r.userStories)
                  .filter(s => s.tier === 2)
                  .sort((a, b) => {
                    const order = { critical: 0, high: 1, medium: 2, low: 3 }
                    return (order[a.priority] || 3) - (order[b.priority] || 3)
                  })
                  .map(story => <StoryCard key={story.id} story={story} />)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* === RELEASES TAB === */}
      {activeTab === "releases" && (
        <div className="space-y-4">
          {DELIVERY_PLAN.releases.map(release => {
            const progress = getReleaseProgress(release)
            const statusColor = release.status === "Done" ? "text-green-600" : release.status === "In Progress" ? "text-amber-600" : "text-muted-foreground"
            return (
              <Card key={release.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">{release.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {release.targetDate ? `Target: ${release.targetDate}` : "No target date"} -- {release.userStories.length} stories
                      </CardDescription>
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800 border border-blue-100">
                        <span className="font-semibold">Hypothesis to test:</span> {release.hypothesisToTest}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm font-medium ${statusColor}`}>{release.status}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress.percent}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{progress.percent}%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {release.userStories.map(story => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* === AI REVIEW TAB === */}
      {activeTab === "review" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5" />
                    AI Delivery Manager Review
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Reviews delivery plan against codebase. Checks every story, acceptance criteria, and module. Gives sprint recommendations.
                  </CardDescription>
                </div>
                <Button
                  onClick={runReview}
                  disabled={reviewStatus === "streaming"}
                  size="sm"
                  variant={reviewStatus === "complete" ? "outline" : "default"}
                >
                  {reviewStatus === "streaming" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  {reviewStatus === "complete" ? "Re-run Review" : "Run Review"}
                </Button>
              </div>
            </CardHeader>
            {reviewContent && (
              <CardContent className="pt-0">
                <div className="border-t border-border pt-4">
                  {reviewStatus === "streaming" && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs text-primary font-medium">Reviewing delivery plan...</span>
                    </div>
                  )}
                  <MarkdownRenderer text={reviewContent} />
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
