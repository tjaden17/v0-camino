"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { redirect } from "next/navigation"
import { issueTreeData, type SubIssue, getParentIssue } from "@/lib/issue-tree-data"
import { userProfile } from "@/lib/user-data"
import { saveIssue } from "@/lib/saved-issues"
import { IssueCard } from "@/components/issue-card"
import { IssueDetailCard } from "@/components/issue-detail-card"
import { ShareDialog } from "@/components/share-dialog"
import { TreeView } from "@/components/tree-view"
import { BottomNav } from "@/components/bottom-nav"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Target, LayoutGrid, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const calculateImportanceScore = (issue: SubIssue): number => {
  // This is a placeholder algorithm - you'll replace this with your actual calculation
  // Higher trend values and more sub-issues = more important
  const trendScore = Math.abs(Number.parseFloat(issue.trendValue.replace(/[^0-9.-]/g, ""))) || 0
  const subIssueScore = (issue.subIssues?.length || 0) * 2
  return trendScore + subIssueScore
}

const findMostImportantIssue = (): { issue: SubIssue; level: SubIssue[]; index: number } => {
  let maxScore = -1
  let mostImportantIssue: SubIssue = issueTreeData.subIssues[0]
  let parentLevel: SubIssue[] = issueTreeData.subIssues
  let issueIndex = 0

  const traverseTree = (issues: SubIssue[], level: SubIssue[]) => {
    issues.forEach((issue, index) => {
      const score = calculateImportanceScore(issue)
      if (score > maxScore) {
        maxScore = score
        mostImportantIssue = issue
        parentLevel = level
        issueIndex = index
      }
      if (issue.subIssues) {
        traverseTree(issue.subIssues, issue.subIssues)
      }
    })
  }

  traverseTree(issueTreeData.subIssues, issueTreeData.subIssues)
  return { issue: mostImportantIssue, level: parentLevel, index: issueIndex }
}

export default function RootPage() {
  redirect("/mission")

  const router = useRouter()
  const defaultIssue =
    issueTreeData.subIssues.find((i) => i.id === userProfile.defaultView) || issueTreeData.subIssues[0]
  const [currentIssueId, setCurrentIssueId] = useState<string>(defaultIssue.id)
  const [currentLevel, setCurrentLevel] = useState<SubIssue[]>(issueTreeData.subIssues)
  const [currentIndex, setCurrentIndex] = useState(issueTreeData.subIssues.findIndex((i) => i.id === defaultIssue.id))
  const [showDetail, setShowDetail] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"issue" | "tree">("issue")
  const lastTapRef = useRef<number>(0)
  const { toast } = useToast()

  useEffect(() => {
    router.push("/guidance")
  }, [router])

  const currentIssue = currentLevel[currentIndex]

  const buildBreadcrumbPath = () => {
    const path: string[] = []
    const current: SubIssue | { subIssues: SubIssue[] } | undefined = issueTreeData

    const findPath = (node: { subIssues?: SubIssue[] }, targetId: string, currentPath: string[]): boolean => {
      if (!node.subIssues) return false

      for (const issue of node.subIssues) {
        if (issue.id === targetId) {
          return true
        }
        if (issue.subIssues) {
          const newPath = [...currentPath, issue.name]
          if (findPath(issue, targetId, newPath)) {
            path.push(...newPath)
            return true
          }
        }
      }
      return false
    }

    findPath(issueTreeData, currentIssue.id, [])
    return path
  }

  const minSwipeDistance = 50

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

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        handleGoDeeper()
      } else {
        handleGoBack()
      }
    }

    if (isVerticalSwipe && Math.abs(distanceY) > minSwipeDistance) {
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
      setCurrentIssueId(currentIssue.subIssues[0].id)
      setBreadcrumbPath(buildBreadcrumbPath())
    }
  }

  const handleGoBack = () => {
    if (showDetail) {
      setShowDetail(false)
      return
    }

    const parent = getParentIssue(currentIssue.id)
    if (parent) {
      if ("subIssues" in parent && parent.subIssues) {
        setCurrentLevel(parent.subIssues)
        const parentIndex = parent.subIssues.findIndex((issue) => issue.id === currentIssue.id)
        setCurrentIndex(parentIndex >= 0 ? parentIndex : 0)
      } else {
        setCurrentLevel(issueTreeData.subIssues)
        setCurrentIndex(0)
        setCurrentIssueId(issueTreeData.subIssues[0].id)
      }
      setBreadcrumbPath(buildBreadcrumbPath())
    }
  }

  const handleNextIssue = () => {
    if (currentIndex < currentLevel.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setCurrentIssueId(currentLevel[currentIndex + 1].id)
      setBreadcrumbPath(buildBreadcrumbPath())
    }
  }

  const handlePreviousIssue = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setCurrentIssueId(currentLevel[currentIndex - 1].id)
      setBreadcrumbPath(buildBreadcrumbPath())
    }
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
    // Find the issue in the tree and navigate to it
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
      setCurrentIssueId(issue.id)
      setBreadcrumbPath(buildBreadcrumbPath())
      setViewMode("issue")
    }
  }

  const handleFocusOnMostImportant = () => {
    const { issue, level, index } = findMostImportantIssue()
    setCurrentLevel(level)
    setCurrentIndex(index)
    setCurrentIssueId(issue.id)
    setBreadcrumbPath(buildBreadcrumbPath())
    setViewMode("issue")
    toast({
      title: "Most Important Issue",
      description: `Focused on: ${issue.name}`,
    })
  }

  const parent = getParentIssue(currentIssue.id)
  const canGoBack = showDetail || parent !== null
  const canGoDeeper = currentIssue.subIssues && currentIssue.subIssues.length > 0
  const canGoUp = currentIndex > 0
  const canGoDown = currentIndex < currentLevel.length - 1

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Camino branding header at the top */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary-foreground">Camino</h1>
        </div>
      </header>

      <div className="sticky top-[57px] z-10 bg-card border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Focus Button on Left - fixed width */}
            <div className="w-10 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFocusOnMostImportant}
                className="h-10 w-10 hover:bg-primary/10 text-primary"
                title="Focus on most important issue"
              >
                <Target className="h-5 w-5" />
                <span className="sr-only">Focus on most important issue</span>
              </Button>
            </div>

            {/* Current Issue Name in Middle - grows to fill space */}
            <div className="flex-1 min-w-0 px-4">
              <h2 className="text-sm font-semibold text-foreground truncate text-center">{currentIssue.name}</h2>
            </div>

            {/* View Toggle on Right - fixed width */}
            <div className="w-[100px] flex-shrink-0">
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as "issue" | "tree")}>
                <SelectTrigger className="w-full h-10 border-border">
                  <div className="flex items-center gap-2">
                    {viewMode === "issue" ? (
                      <LayoutGrid className="h-4 w-4 text-accent" />
                    ) : (
                      <GitBranch className="h-4 w-4 text-accent" />
                    )}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issue">Issue</SelectItem>
                  <SelectItem value="tree">Tree</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6">
        {/* Render based on view mode */}
        {viewMode === "issue" && (
          <div
            className="relative touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={handleTap}
          >
            {showDetail ? (
              <IssueDetailCard
                issue={currentIssue}
                onBack={() => setShowDetail(false)}
                onSave={handleSave}
                onShare={handleShare}
              />
            ) : (
              <div className="relative">
                <IssueCard issue={currentIssue} onSave={handleSave} onShare={handleShare} />

                {/* Up arrow - at top edge of card */}
                {canGoUp && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreviousIssue()
                    }}
                    className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 h-10 w-10 rounded-full bg-card border-2 border-accent hover:bg-accent/10 shadow-sm z-10"
                  >
                    <ChevronUp className="h-5 w-5 text-accent" />
                    <span className="sr-only">Previous issue</span>
                  </Button>
                )}

                {/* Down arrow - at bottom edge of card */}
                {canGoDown && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextIssue()
                    }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 h-10 w-10 rounded-full bg-card border-2 border-accent hover:bg-accent/10 shadow-sm z-10"
                  >
                    <ChevronDown className="h-5 w-5 text-accent" />
                    <span className="sr-only">Next issue</span>
                  </Button>
                )}

                {/* Left arrow - on left middle edge of card */}
                {canGoBack && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGoBack()
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-card border-2 border-primary hover:bg-primary/10 shadow-sm z-10"
                  >
                    <ChevronLeft className="h-5 w-5 text-primary" />
                    <span className="sr-only">Go back</span>
                  </Button>
                )}

                {/* Right arrow - on right middle edge of card */}
                {canGoDeeper && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGoDeeper()
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-10 w-10 rounded-full bg-card border-2 border-primary hover:bg-primary/10 shadow-sm z-10"
                  >
                    <ChevronRight className="h-5 w-5 text-primary" />
                    <span className="sr-only">Go deeper</span>
                  </Button>
                )}
              </div>
            )}

            <div className="mt-20 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                <strong className="text-accent">Navigate:</strong> Use arrow buttons or swipe • Double tap for details
              </p>
            </div>
          </div>
        )}

        {viewMode === "tree" && <TreeView currentIssueId={currentIssueId} onIssueClick={handleIssueClick} />}
      </main>

      <BottomNav />

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} issueName={currentIssue.name} />
    </div>
  )
}
