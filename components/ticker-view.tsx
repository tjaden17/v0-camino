"use client"

import type { SubIssue } from "@/lib/issue-tree-data"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import { getAdjustedTrendValue, getTimeframeLabel } from "@/lib/date-range-utils"
import type { DateRange } from "@/lib/date-range-utils"

interface TickerViewProps {
  issues: SubIssue[]
  onIssueClick: (issue: SubIssue) => void
  onIssueDoubleClick?: (issue: SubIssue) => void
  dateRange?: DateRange
}

export function TickerView({ issues, onIssueClick, onIssueDoubleClick, dateRange = "7days" }: TickerViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [lastTappedIssueId, setLastTappedIssueId] = useState<string | null>(null)

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    // Auto-scroll effect
    let scrollPosition = 0
    const scrollSpeed = 0.5 // pixels per frame

    const animate = () => {
      if (scrollElement) {
        scrollPosition += scrollSpeed
        if (scrollPosition >= scrollElement.scrollWidth / 2) {
          scrollPosition = 0
        }
        scrollElement.scrollLeft = scrollPosition
      }
      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-6 w-6" />
      case "down":
        return <ArrowDown className="h-6 w-6" />
      default:
        return <Minus className="h-6 w-6" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-success"
      case "down":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  // Flatten all issues
  const flattenIssues = (issueList: SubIssue[]): SubIssue[] => {
    const result: SubIssue[] = []
    issueList.forEach((issue) => {
      result.push(issue)
      if (issue.subIssues) {
        result.push(...flattenIssues(issue.subIssues))
      }
    })
    return result
  }

  const allIssues = flattenIssues(issues)
  // Duplicate for seamless loop
  const displayIssues = [...allIssues, ...allIssues]

  const handleIssueClick = (issue: SubIssue) => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapTime

    // Check if it's a double-tap on the same issue within 300ms
    if (timeSinceLastTap < 300 && lastTappedIssueId === issue.id && onIssueDoubleClick) {
      onIssueDoubleClick(issue)
      setLastTapTime(0) // Reset to prevent triple-tap
      setLastTappedIssueId(null)
    } else {
      // Single tap - just select the issue
      onIssueClick(issue)
      setLastTapTime(now)
      setLastTappedIssueId(issue.id)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-4xl">
        <div className="bg-card border border-border rounded-lg p-6 overflow-hidden shadow-lg">
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-hidden whitespace-nowrap"
            style={{ scrollBehavior: "auto" }}
          >
            {displayIssues.map((issue, index) => {
              const adjustedTrendValue = getAdjustedTrendValue(issue.trendValue, dateRange)
              const timeframeLabel = getTimeframeLabel(dateRange)

              return (
                <button
                  key={`${issue.id}-${index}`}
                  onClick={() => handleIssueClick(issue)}
                  className="inline-flex items-center gap-3 px-6 py-4 rounded-lg bg-muted/50 hover:bg-accent/20 transition-colors flex-shrink-0 border border-border hover:border-accent"
                >
                  <span className="font-semibold text-lg">{issue.name}</span>
                  <div className={cn("flex items-center gap-2", getTrendColor(issue.trend))}>
                    {getTrendIcon(issue.trend)}
                    <span className="text-lg font-bold">{adjustedTrendValue}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">· {timeframeLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
