"use client"

import type { SubIssue } from "@/lib/issue-tree-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, Users } from "lucide-react"

interface AnalysisViewProps {
  issue: SubIssue
  onClose: () => void
}

export function AnalysisView({ issue, onClose }: AnalysisViewProps) {
  if (!issue.analysis) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-card-foreground">Analysis</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-muted-foreground">Analysis data not available for this issue.</p>
      </Card>
    )
  }

  const { quantTheme1, quantTheme2, qualTheme } = issue.analysis

  return (
    <Card className="p-6 bg-card border-2 border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-card-foreground">Analysis: {issue.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="border-l-4 border-accent pl-4">
          <div className="flex items-start gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-accent mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground mb-1">{quantTheme1.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{quantTheme1.description}</p>
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-1">Key Insight</p>
                <p className="text-sm text-card-foreground">{quantTheme1.insight}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-primary pl-4">
          <div className="flex items-start gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground mb-1">{quantTheme2.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{quantTheme2.description}</p>
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-1">Key Insight</p>
                <p className="text-sm text-card-foreground">{quantTheme2.insight}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-secondary pl-4">
          <div className="flex items-start gap-2 mb-2">
            <Users className="h-5 w-5 text-secondary mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground mb-1">{qualTheme.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{qualTheme.description}</p>
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-1">Customer Feedback</p>
                <p className="text-sm text-card-foreground">{qualTheme.feedback}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
