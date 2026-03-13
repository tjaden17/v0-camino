"use client"

import type React from "react"
import { useState, useRef, useMemo } from "react"
import { issueTreeData, type SubIssue, getParentIssue } from "@/lib/issue-tree-data"
import { getActiveProfile } from "@/lib/demo-mode"
import { IssueCard } from "@/components/issue-card"
import { IssueDetailCard } from "@/components/issue-detail-card"
import { ShareDialog } from "@/components/share-dialog"
import { TagDialog } from "@/components/tag-dialog"
import { TreeView } from "@/components/tree-view"
import { TickerView } from "@/components/ticker-view"
import { BottomNav } from "@/components/bottom-nav"
import { useToast } from "@/hooks/use-toast"
import { ChevronUp, ChevronDown, Target, LayoutGrid, GitBranch, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertsBell } from "@/components/alerts-bell"

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
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [viewMode, setViewMode] = useState<"issue" | "tree" | "ticker">("issue")
  const [dateRange, setDateRange] = useState<"7days" | "30days" | "quarter">("7days")
  const [currentLayer, setCurrentLayer] = useState<"data" | "analysis" | "synthesis">("analysis")
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

    if (isHorizontalSwipe && Math.abs(distanceX) > 50) {
      if (distanceX > 0) {
        handleNavigateLeft()
      } else {
        handleNavigateRight()
      }
    } else if (isVerticalSwipe && Math.abs(distanceY) > 50) {
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
    if (currentFlatIndex < allIssuesList.length - 1) {
      const nextIndex = currentFlatIndex + 1
      const nextIssue = allIssuesList[nextIndex]
      setCurrentFlatIndex(nextIndex)
      setCurrentIssueId(nextIssue.id)

      const result = findIssueInLevel(nextIssue.id)
      if (result) {
        setCurrentLevel(result.level)
        setCurrentIndex(result.index)
      }
    }
  }

  const handlePreviousIssue = () => {
    if (currentFlatIndex > 0) {
      const prevIndex = currentFlatIndex - 1
      const prevIssue = allIssuesList[prevIndex]
      setCurrentFlatIndex(prevIndex)
      setCurrentIssueId(prevIssue.id)

      const result = findIssueInLevel(prevIssue.id)
      if (result) {
        setCurrentLevel(result.level)
        setCurrentIndex(result.index)
      }
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

  const handleTag = () => {
    setTagDialogOpen(true)
  }

  const handleShare = () => {
    setShareDialogOpen(true)
  }

  const handleViewAnalysis = () => {
    setCurrentLayer("analysis")
  }

  const handleViewSynthesis = () => {
    setCurrentLayer("synthesis")
  }

  const handleNavigateLeft = () => {
    if (currentLayer === "analysis") {
      setCurrentLayer("data")
      toast({
        title: "Data Layer",
        description: "Viewing raw data sources and extracts",
      })
    } else if (currentLayer === "synthesis") {
      setCurrentLayer("analysis")
    }
  }

  const handleNavigateRight = () => {
    if (currentLayer === "data") {
      setCurrentLayer("analysis")
    } else if (currentLayer === "analysis") {
      setCurrentLayer("synthesis")
      toast({
        title: "Synthesis Layer",
        description: "Viewing strategic synthesis",
      })
    }
  }

  const handleAlertClick = () => {
    // Placeholder for handleAlertClick logic
  }

  const handleFocusOnMostImportant = () => {
    // Placeholder for handleFocusOnMostImportant logic
  }

  const handleIssueClick = (id: string) => {
    // Placeholder for handleIssueClick logic
  }

  const handleIssueDoubleClick = (id: string) => {
    // Placeholder for handleIssueDoubleClick logic
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
                  onSave={handleTag}
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
                <IssueCard issue={currentIssue} onTag={handleTag} onShare={handleShare} dateRange={dateRange} />

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
            onIssueDoubleClick={handleIssueDoubleClick}
            onNextIssue={handleNextIssue}
            onPreviousIssue={handlePreviousIssue}
            canGoUp={canGoUp}
            canGoDown={canGoDown}
            dateRange={dateRange}
          />
        )}

        {viewMode === "ticker" && (
          <TickerView
            issues={issueTreeData.subIssues}
            onIssueClick={handleIssueClick}
            onIssueDoubleClick={handleIssueDoubleClick}
            dateRange={dateRange}
          />
        )}
      </main>

      <BottomNav />

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} issueName={currentIssue.name} />
      <TagDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        issueName={currentIssue.name}
        existingTags={currentIssue.tags || []}
      />
    </div>
  )
}
