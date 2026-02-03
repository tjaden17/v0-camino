"use client"

import { useState, useEffect } from "react"
import { issueTreeData } from "@/lib/issue-tree-data"
import { getActiveProfile } from "@/lib/demo-mode"
import type { SubIssue } from "@/lib/issue-tree-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Minus, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { BottomNav } from "@/components/bottom-nav"

function findIssuesByIds(issueIds: string[]): SubIssue[] {
  const issues: SubIssue[] = []

  function searchIssues(subIssues: SubIssue[]) {
    for (const issue of subIssues) {
      if (issueIds.includes(issue.id)) {
        issues.push(issue)
      }
      if (issue.subIssues) {
        searchIssues(issue.subIssues)
      }
    }
  }

  searchIssues(issueTreeData.subIssues)
  return issues
}

export default function MissionPage() {
  const [activeProfile, setActiveProfile] = useState(() => getActiveProfile())
  const [savedIssues, setSavedIssues] = useState<SubIssue[]>([])
  const [recommendedIssues, setRecommendedIssues] = useState<SubIssue[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const saved = findIssuesByIds(activeProfile.savedIssueIds).slice(0, 3)
    setSavedIssues(saved)

    const allIssues: SubIssue[] = []
    function collectIssues(subIssues: SubIssue[]) {
      for (const issue of subIssues) {
        allIssues.push(issue)
        if (issue.subIssues) {
          collectIssues(issue.subIssues)
        }
      }
    }
    collectIssues(issueTreeData.subIssues)

    const savedIds = new Set(activeProfile.savedIssueIds)
    const recommended = allIssues.filter((issue) => !savedIds.has(issue.id) && issue.dataSource.length > 0).slice(0, 2)
    setRecommendedIssues(recommended)
  }, []) // Empty dependency array - run only on mount

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
      <header className="sticky top-0 z-10 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-primary-foreground">Camino</h1>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-4">Mission</h2>

          {/* Company Mission - Top level (0) */}
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-8 text-center">
              <span className="inline-block px-2 py-0.5 text-xs font-mono font-semibold text-primary bg-primary/10 rounded">
                0
              </span>
            </div>
            <Card className="flex-1 p-4 bg-primary/5 border-primary/30">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1">Company Mission</h3>
                  <p className="text-sm font-medium text-foreground">{activeProfile.companyMission}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Role Mission - Nested level (0.1) */}
          <div className="flex items-start gap-2 ml-4">
            <div className="flex-shrink-0 w-8 text-center">
              <span className="inline-block px-2 py-0.5 text-xs font-mono font-semibold text-accent bg-accent/10 rounded">
                0.1
              </span>
            </div>
            <Card className="flex-1 p-4 bg-accent/5 border-accent/30">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1">Your Role Mission</h3>
                  <p className="text-sm font-medium text-foreground">{activeProfile.roleMission}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Connecting line */}
          <div className="ml-12 border-l-2 border-dashed border-muted-foreground/20 h-4" />
        </div>
        {/* End of Tree-style mission hierarchy display */}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Saved Issues</h2>

          {savedIssues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No saved issues yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Issues you save will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedIssues.map((issue) => (
                <Card key={issue.id} className="p-6 bg-card border-border flex flex-col min-h-[300px]">
                  {/* Top section - Header with issue info */}
                  <div className="flex-[2] flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <h3 className="text-3xl font-bold text-card-foreground">{issue.name}</h3>
                      <div className={cn("flex items-center gap-2", getTrendColor(issue.trend))}>
                        {getTrendIcon(issue.trend)}
                        <span className="text-2xl font-bold">{issue.trendValue}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{issue.timeframe}</span>
                    </div>
                  </div>

                  {/* Middle section - Metadata */}
                  <div className="flex-1 flex flex-col items-center justify-center space-y-3 border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Source:</span>
                      {issue.dataSource.length > 0 ? (
                        issue.dataSource.map((source, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {source}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          No data source connected
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Owner:</span>
                      <Badge variant="outline" className="text-xs">
                        {issue.owner}
                      </Badge>
                    </div>
                  </div>

                  {/* Bottom section - Actions */}
                  <div className="flex-1 flex items-center justify-center gap-2 border-t border-border pt-4">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Bookmark className="h-4 w-4 fill-current" />
                      Saved
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {recommendedIssues.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">To Consider</h2>
              <Badge variant="outline" className="text-xs">
                Based on your role
              </Badge>
            </div>

            <div className="space-y-4">
              {recommendedIssues.map((issue) => (
                <Card key={issue.id} className="p-6 bg-accent/5 border-accent/20 flex flex-col min-h-[280px]">
                  {/* Top section - Header with issue info */}
                  <div className="flex-[2] flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <h3 className="text-3xl font-bold text-card-foreground">{issue.name}</h3>
                      <div className={cn("flex items-center gap-2", getTrendColor(issue.trend))}>
                        {getTrendIcon(issue.trend)}
                        <span className="text-2xl font-bold">{issue.trendValue}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{issue.timeframe}</span>
                    </div>
                  </div>

                  {/* Middle section - Metadata */}
                  <div className="flex-1 flex flex-col items-center justify-center space-y-3 border-t border-accent/20 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Source:</span>
                      {issue.dataSource.map((source, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-accent/10">
                          {source}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Owner:</span>
                      <Badge variant="outline" className="text-xs">
                        {issue.owner}
                      </Badge>
                    </div>
                  </div>

                  {/* Bottom section - Actions */}
                  <div className="flex-1 flex items-center justify-center gap-2 border-t border-accent/20 pt-4">
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        toast({
                          title: "Issue Saved",
                          description: `${issue.name} has been added to your mission.`,
                        })
                      }}
                    >
                      <Bookmark className="h-4 w-4" />
                      Save to Mission
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
