"use client"

import type { SubIssue } from "@/lib/issue-tree-data"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StackedViewProps {
  issues: SubIssue[]
  onIssueClick: (issue: SubIssue) => void
}

export function StackedView({ issues, onIssueClick }: StackedViewProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-4 w-4" />
      case "down":
        return <ArrowDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
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

  return (
    <div className="space-y-2">
      {issues.slice(0, 10).map((issue) => (
        <button
          key={issue.id}
          onClick={() => onIssueClick(issue)}
          className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <span className="font-medium text-card-foreground">{issue.name}</span>
          <div className={cn("flex items-center gap-2", getTrendColor(issue.trend))}>
            {getTrendIcon(issue.trend)}
            <span className="text-lg font-bold">{issue.trendValue}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
