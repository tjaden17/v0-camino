"use client"

import type React from "react"
import { useState, useRef, useMemo } from "react"
import { issueTreeData, type SubIssue, getParentIssue } from "@/lib/issue-tree-data"
import { getActiveProfile } from "@/lib/demo-mode"
import { saveIssue } from "@/lib/saved-issues"
import { getTopIssuesByVOI } from "@/lib/value-of-information"
import { IssueCard } from "@/components/issue-card"
import { IssueDetailCard } from "@/components/issue-detail-card"
import { ShareDialog } from "@/components/share-dialog"
import { TreeView } from "@/components/tree-view"
import { TickerView } from "@/components/ticker-view"
import { BottomNav } from "@/components/bottom-nav"
import { useToast } from "@/hooks/use-toast"
import { ChevronUp, ChevronDown, Target, LayoutGrid, GitBranch, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertsBell } from "@/components/alerts-bell"
// import { LockScreen } from "@/components/lock-screen"

export default function GuidancePage() {
  const activeProfile = getActiveProfile()

  const allIssuesList = useMemo(() => {
    const flatList: SubIssue[] = []
    const flattenIssues = (issues: SubIssue[]) => {
      issues.forEach((issue) => {
        flatList.push(issue)
        if (issue.subIssues && issue.subIssues.length > 0) {
          flattenIssues(issue.subIssues)
        }
      })
    }
    flattenIssues(issueTreeData.subIssues)
    console.log("[v0] Total flattened issues:", flatList.length)
    return flatList
  }, [])

  const defaultIssue =
    issueTreeData.subIssues.find((i) => i.id === activeProfile.defaultView) || issueTreeData.subIssues[0]
  const [currentIssueId, setCurrentIssueId] = useState<string>(defaultIssue.id)

  const [currentFlatIndex, setCurrentFlatIndex] = useState(allIssuesList.findIndex((i) => i.id === defaultIssue.id))

  const [currentLevel, setCurrentLevel] = useState<SubIssue[]>(issueTreeData.subIssues)
  const [currentIndex, setCurrentIndex] = useState(issueTreeData.subIssues.findIndex((i) => i.id === defaultIssue.id))
  const [showDetail, setShowDetail] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [viewMode, setViewMode] = useState<"issue" | "tree" | "ticker">("issue")
  const [dateRange, setDateRange] = useState<"7days" | "30days" | "quarter">("7days")
  const lastTapRef = useRef<number>(0)
  const { toast } = useToast()

  const currentIssue = allIssuesList[currentFlatIndex]

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX)

    if (isVerticalSwipe && Math.abs(distanceY) > 50) {
      if (distanceY > 0) {
        handleNextIssue()
      } else {
        handlePreviousIssue()
      }
    }
  }

  const handleTap = () => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      handleDoubleTap()
    }

    lastTapRef.current = now
  }

  const handleDoubleTap = () => {
    if (currentIssue.detail) {
      setShowDetail(true)
    } else if (currentIssue.subIssues && currentIssue.subIssues.length > 0) {
      handleGoDeeper()
    }
  }

  const handleGoDeeper = () => {
    if (currentIssue.subIssues && currentIssue.subIssues.length > 0) {
      setCurrentLevel(currentIssue.subIssues)
      setCurrentIndex(0)
      const firstChild = currentIssue.subIssues[0]
      setCurrentIssueId(firstChild.id)
      const flatIndex = allIssuesList.findIndex((i) => i.id === firstChild.id)
      if (flatIndex !== -1) {
        setCurrentFlatIndex(flatIndex)
      }
    }
  }

  const handleGoBack = () => {
    if (showDetail) {
      setShowDetail(false)
      return
    }
  }

  const handleNextIssue = () => {
    console.log("[v0] handleNextIssue called, currentFlatIndex:", currentFlatIndex)
    if (currentFlatIndex < allIssuesList.length - 1) {
      const nextIndex = currentFlatIndex + 1
      const nextIssue = allIssuesList[nextIndex]
      console.log("[v0] Moving to next issue:", nextIssue.name, "at index:", nextIndex)
      setCurrentFlatIndex(nextIndex)
      setCurrentIssueId(nextIssue.id)

      // Update hierarchical tracking for tree view sync
      const result = findIssueInLevel(nextIssue.id)
      if (result) {
        setCurrentLevel(result.level)
        setCurrentIndex(result.index)
      }
    } else {
      console.log("[v0] Already at last issue")
    }
  }

  const handlePreviousIssue = () => {
    console.log("[v0] handlePreviousIssue called, currentFlatIndex:", currentFlatIndex)
    if (currentFlatIndex > 0) {
      const prevIndex = currentFlatIndex - 1
      const prevIssue = allIssuesList[prevIndex]
      console.log("[v0] Moving to previous issue:", prevIssue.name, "at index:", prevIndex)
      setCurrentFlatIndex(prevIndex)
      setCurrentIssueId(prevIssue.id)

      // Update hierarchical tracking for tree view sync
      const result = findIssueInLevel(prevIssue.id)
      if (result) {
        setCurrentLevel(result.level)
        setCurrentIndex(result.index)
      }
    } else {
      console.log("[v0] Already at first issue")
    }
  }

  const findIssueInLevel = (targetId: string): { level: SubIssue[]; index: number } | null => {
    const findInTree = (node: { subIssues?: SubIssue[] }, id: string): { level: SubIssue[]; index: number } | null => {
      if (!node.subIssues) return null

      const index = node.subIssues.findIndex((i) => i.id === id)
      if (index !== -1) {
        return { level: node.subIssues, index }
      }

      for (const subIssue of node.subIssues) {
        const result = findInTree(subIssue, id)
        if (result) return result
      }

      return null
    }

    return findInTree(issueTreeData, targetId)
  }

  const handleSave = () => {
    saveIssue(currentIssue)
    toast({
      title: "Issue Saved",
      description: `"${currentIssue.name}" has been saved to your bookmarks.`,
    })
  }

  const handleShare = () => {
    setShareDialogOpen(true)
  }

  const handleIssueClick = (issue: SubIssue) => {
    const flatIndex = allIssuesList.findIndex((i) => i.id === issue.id)
    if (flatIndex !== -1) {
      setCurrentFlatIndex(flatIndex)
      setCurrentIssueId(issue.id)
    }
  }

  const handleIssueDoubleClick = (issue: SubIssue) => {
    navigateToIssue(issue)
    setViewMode("issue") // Switch to card view
    toast({
      title: "Viewing Issue",
      description: `Opened: ${issue.name}`,
    })
  }

  const handleFocusOnMostImportant = () => {
    const topIssues = getTopIssuesByVOI(issueTreeData.subIssues, 1)
    if (topIssues.length > 0) {
      navigateToIssue(topIssues[0])
      toast({
        title: "Most Important Issue",
        description: `Focused on: ${topIssues[0].name}`,
      })
    }
  }

  const handleAlertClick = (issueId: string) => {
    // Find issue by ID and navigate to it
    const findIssue = (issues: SubIssue[]): SubIssue | null => {
      for (const issue of issues) {
        if (issue.id === issueId) return issue
        if (issue.subIssues) {
          const found = findIssue(issue.subIssues)
          if (found) return found
        }
      }
      return null
    }

    const issue = findIssue(issueTreeData.subIssues)
    if (issue) {
      navigateToIssue(issue)
      toast({
        title: "Navigated to Alert",
        description: `Viewing: ${issue.name}`,
      })
    }
  }

  const navigateToIssue = (issue: SubIssue) => {
    const flatIndex = allIssuesList.findIndex((i) => i.id === issue.id)
    if (flatIndex !== -1) {
      setCurrentFlatIndex(flatIndex)
      setCurrentIssueId(issue.id)
    }

    const findIssueLevel = (
      node: { subIssues?: SubIssue[] },
      targetId: string,
    ): { level: SubIssue[]; index: number } | null => {
      if (!node.subIssues) return null

      const index = node.subIssues.findIndex((i) => i.id === targetId)
      if (index !== -1) {
        return { level: node.subIssues, index }
      }

      for (const subIssue of node.subIssues) {
        const result = findIssueLevel(subIssue, targetId)
        if (result) return result
      }

      return null
    }

    const result = findIssueLevel(issueTreeData, issue.id)
    if (result) {
      setCurrentLevel(result.level)
      setCurrentIndex(result.index)
    }
  }

  const parent = getParentIssue(currentIssue.id)
  const canGoBack = showDetail || parent !== null
  const canGoDeeper = currentIssue.subIssues && currentIssue.subIssues.length > 0

  const canGoUp = currentFlatIndex > 0
  const canGoDown = currentFlatIndex < allIssuesList.length - 1

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden max-w-full">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-foreground">Camino</h1>
          <AlertsBell onAlertClick={handleAlertClick} />
        </div>
      </header>

      <div className="sticky top-[57px] z-10 bg-card border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Focus button - left side */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFocusOnMostImportant}
              className="h-10 w-10 shrink-0 hover:bg-primary/10 text-primary"
              title="Focus on most important issue"
            >
              <Target className="h-5 w-5" />
              <span className="sr-only">Focus on most important issue</span>
            </Button>

            {/* View toggle - center */}
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as "issue" | "tree" | "ticker")}>
              <SelectTrigger className="w-[100px] h-9 border-border shrink-0">
                <div className="flex items-center gap-1.5">
                  {viewMode === "issue" && <LayoutGrid className="h-3.5 w-3.5 text-accent" />}
                  {viewMode === "tree" && <GitBranch className="h-3.5 w-3.5 text-accent" />}
                  {viewMode === "ticker" && <TrendingUp className="h-3.5 w-3.5 text-accent" />}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="tree">Tree</SelectItem>
                <SelectItem value="ticker">Ticker</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range - right side */}
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as "7days" | "30days" | "quarter")}>
              <SelectTrigger className="w-[95px] h-9 text-xs border-border shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 days</SelectItem>
                <SelectItem value="30days">30 days</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        {viewMode === "issue" && (
          <div
            className="relative touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={handleTap}
          >
            {showDetail ? (
              <div className="relative">
                <IssueDetailCard
                  issue={currentIssue}
                  onBack={() => setShowDetail(false)}
                  onSave={handleSave}
                  onShare={handleShare}
                />

                {canGoUp && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreviousIssue()
                    }}
                    className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 h-10 w-10 rounded-full bg-card border border-accent/30 hover:bg-accent/10 hover:border-accent/50 shadow-sm z-10 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <ChevronUp className="h-5 w-5 text-accent" />
                    <span className="sr-only">Previous issue</span>
                  </Button>
                )}

                {canGoDown && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextIssue()
                    }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 h-10 w-10 rounded-full bg-card border border-accent/30 hover:bg-accent/10 hover:border-accent/50 shadow-sm z-10 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown className="h-5 w-5 text-accent" />
                    <span className="sr-only">Next issue</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative">
                <IssueCard issue={currentIssue} onSave={handleSave} onShare={handleShare} dateRange={dateRange} />

                {canGoUp && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreviousIssue()
                    }}
                    className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 h-10 w-10 rounded-full bg-card border border-accent/30 hover:bg-accent/10 hover:border-accent/50 shadow-sm z-10 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <ChevronUp className="h-5 w-5 text-accent" />
                    <span className="sr-only">Previous issue</span>
                  </Button>
                )}

                {canGoDown && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextIssue()
                    }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 h-10 w-10 rounded-full bg-card border border-accent/30 hover:bg-accent/10 hover:border-accent/50 shadow-sm z-10 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown className="h-5 w-5 text-accent" />
                    <span className="sr-only">Next issue</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {viewMode === "tree" && (
          <TreeView
            currentIssueId={currentIssueId}
            onIssueClick={handleIssueClick}
            onIssueDoubleClick={handleIssueDoubleClick} // Pass double click handler
            onNextIssue={handleNextIssue}
            onPreviousIssue={handlePreviousIssue}
            canGoUp={canGoUp}
            canGoDown={canGoDown}
          />
        )}

        {viewMode === "ticker" && (
          <TickerView
            issues={issueTreeData.subIssues}
            onIssueClick={handleIssueClick}
            onIssueDoubleClick={handleIssueDoubleClick} // Added double-click handler to ticker view
          />
        )}
      </main>

      <BottomNav />

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} issueName={currentIssue.name} />
    </div>
  )
}
