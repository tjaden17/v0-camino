"use client"

import { useState, useEffect } from "react"
import { getSavedIssues, unsaveIssue } from "@/lib/saved-issues"
import type { SubIssue } from "@/lib/issue-tree-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Minus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { BottomNav } from "@/components/bottom-nav"

export default function SavedPage() {
  const [savedIssues, setSavedIssues] = useState<SubIssue[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setSavedIssues(getSavedIssues())
  }, [])

  const handleUnsave = (issueId: string) => {
    unsaveIssue(issueId)
    setSavedIssues(getSavedIssues())
    toast({
      title: "Issue Removed",
      description: "The issue has been removed from your saved list.",
    })
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-5 w-5" />
      case "down":
        return <ArrowDown className="h-5 w-5" />
      default:
        return <Minus className="h-5 w-5" />
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
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-card-foreground">Saved Issues</h1>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        {savedIssues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No saved issues yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Issues you save will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedIssues.map((issue) => (
              <Card key={issue.id} className="p-6 bg-card border-border">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-card-foreground">{issue.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnsave(issue.id)}
                      className="h-9 w-9 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Remove from saved</span>
                    </Button>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{issue.summary}</p>

                  <div className="flex items-center gap-3 pt-2">
                    <div className={cn("flex items-center gap-2", getTrendColor(issue.trend))}>
                      {getTrendIcon(issue.trend)}
                      <span className="text-2xl font-bold">{issue.trendValue}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">in {issue.timeframe}</span>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Data sources:</span>
                      {issue.dataSource.map((source, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Owner:</span>
                    <Badge variant="outline" className="text-xs">
                      {issue.owner}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
