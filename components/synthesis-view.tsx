"use client"

import type { SubIssue } from "@/lib/issue-tree-data"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp } from "lucide-react"

interface SynthesisViewProps {
  issue: SubIssue
  onClose: () => void
}

export function SynthesisView({ issue }: SynthesisViewProps) {
  if (!issue.synthesis) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Synthesis data not available for this issue.</p>
      </div>
    )
  }

  const { executiveSummary, keyDrivers, strategicImplications } = issue.synthesis

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
        <h3 className="text-lg font-semibold text-primary mb-2">Executive Summary</h3>
        <p className="text-sm text-card-foreground leading-relaxed">{executiveSummary}</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold text-card-foreground">Key Drivers</h3>
        </div>
        <div className="space-y-2">
          {keyDrivers.map((driver, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
              <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                {index + 1}
              </Badge>
              <p className="text-sm text-card-foreground">{driver}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-l-4 border-destructive pl-4">
        <div className="flex items-start gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Strategic Implications</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{strategicImplications}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
