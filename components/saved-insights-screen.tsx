"use client"

import { useState, useEffect } from "react"
import { InsightCard } from "@/components/insight-card"
import { ExpandedInsightCard } from "@/components/expanded-insight-card"
import { ShareModal } from "@/components/share-modal"
import { BottomNavigation } from "@/components/bottom-navigation"
import { FixedHeader } from "@/components/fixed-header"
import { NotificationsModal } from "@/components/notifications-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bookmark, LayoutGrid, List, Tag, Plus, X, Calendar, Download, ChevronDown, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { mockInsights } from "@/lib/mock-data"
import { getUserProfile } from "@/lib/user-utils"
import type { Insight } from "@/lib/types"

export function SavedInsightsScreen() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [shareCard, setShareCard] = useState<Insight | null>(null)
  const [savedInsights, setSavedInsights] = useState<Set<string>>(new Set())
  const [showNotifications, setShowNotifications] = useState(false)
  const [viewMode, setViewMode] = useState<"card" | "ticker">("card")

  const [insightTags, setInsightTags] = useState<Record<string, string[]>>({})
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [newTag, setNewTag] = useState("")
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
  const [taggingInsightId, setTaggingInsightId] = useState<string | null>(null)

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })
  const [showDateFilter, setShowDateFilter] = useState(false)

  const [showExportPreview, setShowExportPreview] = useState(false)
  const [exportTag, setExportTag] = useState<string>("")
  const [showExportConfirmation, setShowExportConfirmation] = useState(false)
  const [exportEmail, setExportEmail] = useState("your.email@company.com")

  const profile = getUserProfile()

  useEffect(() => {
    const saved = localStorage.getItem("camino-saved-insights")
    if (saved) {
      setSavedInsights(new Set(JSON.parse(saved)))
    }

    const savedTags = localStorage.getItem("camino-insight-tags")
    if (savedTags) {
      setInsightTags(JSON.parse(savedTags))
    }

    const savedAvailableTags = localStorage.getItem("camino-available-tags")
    if (savedAvailableTags) {
      setAvailableTags(JSON.parse(savedAvailableTags))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("camino-insight-tags", JSON.stringify(insightTags))
  }, [insightTags])

  useEffect(() => {
    localStorage.setItem("camino-available-tags", JSON.stringify(availableTags))
  }, [availableTags])

  const savedInsightsList = mockInsights.filter((insight) => savedInsights.has(insight.id))

  const filteredInsights = savedInsightsList.filter((insight) => {
    // Tag filter
    if (selectedTags.size > 0) {
      const insightTagsList = insightTags[insight.id] || []
      const hasMatchingTag = Array.from(selectedTags).some((tag) => insightTagsList.includes(tag))
      if (!hasMatchingTag) return false
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      // For demo purposes, we'll filter based on a mock date field
      // In production, you'd use actual insight.createdAt or similar
      return true // Placeholder for actual date filtering logic
    }

    return true
  })

  const handleSave = (insightId: string) => {
    setSavedInsights((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(insightId)) {
        newSet.delete(insightId)
      } else {
        newSet.add(insightId)
      }
      localStorage.setItem("camino-saved-insights", JSON.stringify(Array.from(newSet)))
      return newSet
    })
  }

  const handleShare = (insight: Insight) => {
    setShareCard(insight)
  }

  const handleExpand = (insightId: string) => {
    setExpandedCard(insightId)
  }

  const handleCloseExpanded = () => {
    setExpandedCard(null)
  }

  const handleCloseShare = () => {
    setShareCard(null)
  }

  const handleAddTag = (insightId: string, tag: string) => {
    if (!tag.trim()) return

    setInsightTags((prev) => {
      const currentTags = prev[insightId] || []
      if (currentTags.includes(tag)) return prev
      return {
        ...prev,
        [insightId]: [...currentTags, tag],
      }
    })

    if (!availableTags.includes(tag)) {
      setAvailableTags((prev) => [...prev, tag])
    }
  }

  const handleRemoveTag = (insightId: string, tag: string) => {
    setInsightTags((prev) => {
      const currentTags = prev[insightId] || []
      return {
        ...prev,
        [insightId]: currentTags.filter((t) => t !== tag),
      }
    })
  }

  const handleCreateNewTag = () => {
    if (!newTag.trim() || !taggingInsightId) return
    handleAddTag(taggingInsightId, newTag)
    setNewTag("")
  }

  const handleTagFilterToggle = (tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }

  const handleClearDateFilter = () => {
    setDateRange({ start: "", end: "" })
  }

  const handleExportByTag = (tag: string) => {
    setExportTag(tag)
    setShowExportPreview(true)
  }

  const handleConfirmExport = () => {
    setShowExportPreview(false)
    setShowExportConfirmation(true)
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-background pb-20 pt-16"
      style={{ paddingBottom: "max(5rem, calc(5rem + env(safe-area-inset-bottom)))" }}
    >
      <FixedHeader onNotifications={() => setShowNotifications(true)} />

      <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Saved</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredInsights.length} insight{filteredInsights.length !== 1 ? "s" : ""}
                {selectedTags.size > 0 && ` · Filtered by ${selectedTags.size} tag${selectedTags.size > 1 ? "s" : ""}`}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
              <Button
                variant={viewMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "ticker" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("ticker")}
                className="h-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Tag Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent shrink-0">
                  <Tag className="h-4 w-4" />
                  Tags {selectedTags.size > 0 && `(${selectedTags.size})`}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.has(tag)}
                      onCheckedChange={() => handleTagFilterToggle(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No tags yet. Add tags to insights to filter them.
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Range Filter */}
            <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent shrink-0">
                  <Calendar className="h-4 w-4" />
                  Date Range
                  {(dateRange.start || dateRange.end) && (
                    <Badge variant="secondary" className="ml-1">
                      Active
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Filter by Date Range</h4>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={handleClearDateFilter}
                    >
                      Clear
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => setShowDateFilter(false)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Export by Tag */}
            {availableTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent shrink-0">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Export by Tag</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableTags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      onSelect={() => handleExportByTag(tag)}
                      onCheckedChange={() => {}}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedTags.size > 0 || dateRange.start || dateRange.end) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {Array.from(selectedTags).map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => handleTagFilterToggle(tag)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(dateRange.start || dateRange.end) && (
                <Badge variant="secondary" className="gap-1">
                  {dateRange.start || "Start"} - {dateRange.end || "End"}
                  <button onClick={handleClearDateFilter} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredInsights.length > 0 ? (
          <div className={viewMode === "card" ? "space-y-4" : "space-y-2"}>
            {filteredInsights.map((insight) => (
              <div key={insight.id} className="relative group">
                {viewMode === "card" ? (
                  <InsightCard
                    insight={insight}
                    isSaved={savedInsights.has(insight.id)}
                    onSave={() => handleSave(insight.id)}
                    onShare={() => handleShare(insight)}
                    onExpand={() => handleExpand(insight.id)}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex-1 min-w-0" onClick={() => handleExpand(insight.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                        <span className="font-semibold text-sm truncate">{insight.metric}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">{insight.value}</span>
                        <span
                          className={`text-sm font-medium ${insight.trend === "up" ? "text-green-500" : "text-red-500"}`}
                        >
                          {insight.change}
                        </span>
                        <span className="text-xs text-muted-foreground">{insight.timeframe}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setTaggingInsightId(insight.id)
                        setTagDropdownOpen(true)
                      }}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {(insightTags[insight.id] || []).map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                      {tag}
                      <button onClick={() => handleRemoveTag(insight.id, tag)} className="hover:text-destructive ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}

                  <Popover
                    open={tagDropdownOpen && taggingInsightId === insight.id}
                    onOpenChange={(open) => {
                      setTagDropdownOpen(open)
                      if (!open) setTaggingInsightId(null)
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs bg-transparent"
                        onClick={() => setTaggingInsightId(insight.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Tag
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Add Tag</h4>
                        <div className="space-y-2">
                          {availableTags.map((tag) => (
                            <Button
                              key={tag}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start bg-transparent"
                              onClick={() => {
                                handleAddTag(insight.id, tag)
                                setTagDropdownOpen(false)
                              }}
                            >
                              {tag}
                            </Button>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-tag">Create New Tag</Label>
                          <div className="flex gap-2">
                            <Input
                              id="new-tag"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Tag name"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleCreateNewTag()
                                  setTagDropdownOpen(false)
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                handleCreateNewTag()
                                setTagDropdownOpen(false)
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {savedInsights.size === 0 ? "No saved insights yet" : "No insights match your filters"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {savedInsights.size === 0
                  ? "Save insights from the signals feed to access them here anytime."
                  : "Try adjusting your filters to see more insights."}
              </p>
            </div>
          </div>
        )}
      </div>

      {showExportPreview && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg max-w-2xl w-full flex flex-col" style={{ maxHeight: "85vh" }}>
            {/* Fixed Header */}
            <div className="p-6 border-b shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Export Preview</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowExportPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Exporting insights tagged with: <Badge variant="secondary">{exportTag}</Badge>
                </p>
                <p className="text-sm font-medium">
                  {
                    savedInsightsList.filter((insight) => {
                      const tags = insightTags[insight.id] || []
                      return tags.includes(exportTag)
                    }).length
                  }{" "}
                  insights will be exported
                </p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                <h3 className="font-semibold text-sm">PDF Preview</h3>
                <div className="space-y-2">
                  {savedInsightsList
                    .filter((insight) => {
                      const tags = insightTags[insight.id] || []
                      return tags.includes(exportTag)
                    })
                    .map((insight) => (
                      <div key={insight.id} className="p-3 bg-background rounded border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                          <span className="font-semibold text-sm">{insight.metric}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold">{insight.value}</span>
                          <span
                            className={`text-sm font-medium ${insight.trend === "up" ? "text-green-500" : "text-red-500"}`}
                          >
                            {insight.change}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{insight.summary}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-6 border-t shrink-0 bg-background">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowExportPreview(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleConfirmExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExportConfirmation && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Export Successful</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Signals have been exported to <span className="font-medium text-foreground">{exportEmail}</span>
            </p>
            <Button className="w-full" onClick={() => setShowExportConfirmation(false)}>
              Done
            </Button>
          </div>
        </div>
      )}

      {expandedCard && (
        <ExpandedInsightCard
          insight={filteredInsights.find((i) => i.id === expandedCard)!}
          onClose={handleCloseExpanded}
          isSaved={savedInsights.has(expandedCard)}
          onSave={() => handleSave(expandedCard)}
          onShare={() => handleShare(filteredInsights.find((i) => i.id === expandedCard)!)}
        />
      )}

      {shareCard && <ShareModal insight={shareCard} onClose={handleCloseShare} />}
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}

      <BottomNavigation />
    </div>
  )
}
