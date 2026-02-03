"use client"

import type { SubIssue } from "@/lib/issue-tree-data"
import { issueTreeData } from "@/lib/issue-tree-data"
import { ArrowDown, ArrowUp, Minus, Share2, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ShareDialog } from "@/components/share-dialog"

interface TreeViewProps {
  currentIssueId: string
  onIssueClick: (issue: SubIssue) => void
  onIssueDoubleClick: (issue: SubIssue) => void // Added handler for double tap to navigate to card view
  onNextIssue: () => void
  onPreviousIssue: () => void
  canGoUp: boolean
  canGoDown: boolean
}

export function TreeView({
  currentIssueId,
  onIssueClick,
  onIssueDoubleClick, // Added double click handler prop
  onNextIssue,
  onPreviousIssue,
  canGoUp,
  canGoDown,
}: TreeViewProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const lastClickRef = useRef<{ issueId: string; time: number } | null>(null)

  const findIssueById = (issues: SubIssue[], id: string): SubIssue | null => {
    for (const issue of issues) {
      if (issue.id === id) return issue
      if (issue.subIssues) {
        const found = findIssueById(issue.subIssues, id)
        if (found) return found
      }
    }
    return null
  }

  const selectedIssue = currentIssueId
    ? findIssueById([issueTreeData as unknown as SubIssue, ...issueTreeData.subIssues], currentIssueId)
    : null

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-3 w-3" />
      case "down":
        return <ArrowDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
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

  const getValidationStatus = (issue: SubIssue): "validated" | "proposed" => {
    // Mock logic - in real app, this would come from issue data
    // For now, top-level issues are validated, deeper ones are proposed
    return Math.random() > 0.3 ? "validated" : "proposed"
  }

  const getValidationDot = (status: "validated" | "proposed") => {
    return (
      <div
        className={cn("w-2 h-2 rounded-full", status === "validated" ? "bg-success" : "bg-yellow-400")}
        title={status === "validated" ? "Validated by company" : "Proposed by system"}
      />
    )
  }

  const handleIssueClick = (issue: SubIssue) => {
    const now = Date.now()
    const lastClick = lastClickRef.current

    if (lastClick && lastClick.issueId === issue.id && now - lastClick.time < 300) {
      // Double tap detected - navigate to card view
      onIssueDoubleClick(issue)
      lastClickRef.current = null
    } else {
      // Single tap - just update selection
      onIssueClick(issue)
      lastClickRef.current = { issueId: issue.id, time: now }
    }
  }

  const renderIssue = (issue: SubIssue, depth = 0, indexPath: number[] = []) => {
    const isCurrent = issue.id === currentIssueId
    const isSelected = selectedIssue?.id === issue.id
    const hasSubIssues = issue.subIssues && issue.subIssues.length > 0
    const validationStatus = getValidationStatus(issue)

    const numberLabel = indexPath.join(".")

    const getInitials = (name?: string) => {
      if (!name) return null
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }

    const ownerInitials = getInitials(issue.owner)

    return (
      <div key={issue.id} className="space-y-1">
        <button
          onClick={() => handleIssueClick(issue)}
          className={cn(
            "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left gap-2",
            isSelected && "bg-primary/20 border border-primary",
            isCurrent && !isSelected && "bg-primary/10 border border-primary/50",
            !isSelected && !isCurrent && "bg-card border border-border hover:bg-muted/50",
          )}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          <div className="flex-1 min-w-0 pr-2 flex items-center gap-2">
            {getValidationDot(validationStatus)}
            <span className="text-xs font-mono text-muted-foreground shrink-0">{numberLabel}</span>
            <div className="font-medium text-xs sm:text-sm break-words">{issue.name}</div>
            {ownerInitials && (
              <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                {ownerInitials}
              </span>
            )}
          </div>
          <div className={cn("flex items-center gap-1 shrink-0", getTrendColor(issue.trend))}>
            {getTrendIcon(issue.trend)}
            <span className="text-xs font-bold">{issue.trendValue}</span>
          </div>
        </button>
        {hasSubIssues && (
          <div className="space-y-1">
            {issue.subIssues!.map((subIssue, index) => renderIssue(subIssue, depth + 1, [...indexPath, index + 1]))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 relative h-full flex flex-col">
      {canGoUp && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onPreviousIssue()
          }}
          className="fixed top-20 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-card border-2 border-accent/40 hover:bg-accent/10 hover:border-accent shadow-lg z-50 opacity-80 hover:opacity-100 transition-opacity"
        >
          <ChevronUp className="h-6 w-6 text-accent" />
          <span className="sr-only">Previous issue</span>
        </Button>
      )}

      <div className="space-y-1 flex-1 overflow-y-auto pr-2">
        <button
          onClick={() => handleIssueClick(issueTreeData as unknown as SubIssue)}
          className={cn(
            "w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left gap-2",
            selectedIssue?.id === issueTreeData.id && "bg-primary/20 border border-primary",
            currentIssueId === issueTreeData.id &&
              selectedIssue?.id !== issueTreeData.id &&
              "bg-primary/10 border border-primary/50",
            selectedIssue?.id !== issueTreeData.id &&
              currentIssueId !== issueTreeData.id &&
              "bg-card border border-border hover:bg-muted/50",
          )}
        >
          <div className="flex-1 min-w-0 pr-2 flex items-center gap-2">
            {getValidationDot("validated")}
            <span className="text-xs font-mono text-muted-foreground shrink-0">0</span>
            <div className="font-medium text-xs sm:text-sm break-words">{issueTreeData.name}</div>
            {issueTreeData.owner && (
              <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                {issueTreeData.owner
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div className={cn("flex items-center gap-1 shrink-0", getTrendColor(issueTreeData.trend))}>
            {getTrendIcon(issueTreeData.trend)}
            <span className="text-xs font-bold">{issueTreeData.trendValue}</span>
          </div>
        </button>

        {issueTreeData.subIssues.map((issue, index) => renderIssue(issue, 0, [index + 1]))}
      </div>

      {canGoDown && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onNextIssue()
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-card border-2 border-accent/40 hover:bg-accent/10 hover:border-accent shadow-lg z-50 opacity-80 hover:opacity-100 transition-opacity"
        >
          <ChevronDown className="h-6 w-6 text-accent" />
          <span className="sr-only">Next issue</span>
        </Button>
      )}

      <div className="flex justify-center pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShareDialogOpen(true)}
          className="gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-3 w-3" />
          Share Tree
        </Button>
      </div>

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} issueName="Issue Tree View" />
    </div>
  )
}
