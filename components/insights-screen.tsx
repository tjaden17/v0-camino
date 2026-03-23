"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { InsightCard } from "@/components/insight-card"
import { InsufficientDataCard } from "@/components/insufficient-data-card"
import { TickerCard } from "@/components/ticker-card"
import { ExpandedInsightCard } from "@/components/expanded-insight-card"
import { ShareModal } from "@/components/share-modal"
import { BottomNavigation } from "@/components/bottom-navigation"
import { FixedHeader } from "@/components/fixed-header"
import { NotificationsModal } from "@/components/notifications-modal"
import { AddSignalModal } from "@/components/add-signal-modal"
import { AlertsModal } from "@/components/alerts-modal"
import { mockInsights } from "@/lib/mock-data"
import { isDemoSignal } from "@/lib/demo-signals"
import { getUserProfile } from "@/lib/user-utils"
import { createDemoNotificationsForManager } from "@/lib/notification-utils"
import type { Insight, InsightCategory } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LayoutGrid, BarChart3, Plus, ChevronDown, Check, ChevronRight } from "lucide-react"

const categoryMetrics: Record<InsightCategory, string[]> = {
  customer: [
    "CSAT",
    "NPS",
    "Churn Rate",
    "Customer Retention",
    "Support Tickets",
    "Customer Lifetime Value",
    "Health Score",
    "Usage Frequency",
  ],
  market: [
    "Win/Loss Rate",
    "Market Share",
    "Deal Velocity",
    "Pipeline Coverage",
    "Average Deal Size",
    "Market Growth Rate",
    "Competitive Position",
  ],
  product: [
    "Feature Adoption",
    "User Engagement",
    "Activation Rate",
    "Onboarding Completion",
    "Time to Value",
    "Product Usage",
    "Task Completion",
  ],
  sales: [
    "Sales Cycle Length",
    "Lead Conversion Rate",
    "Quota Attainment",
    "Average Contract Value",
    "Pipeline Health",
    "Win Rate",
  ],
  marketing: [
    "Lead Generation Rate",
    "Marketing Qualified Leads",
    "Campaign ROI",
    "Brand Awareness",
    "CAC",
    "ROAS",
    "Traffic",
  ],
  engineering: [
    "Deploy Frequency",
    "Change Failure Rate",
    "Mean Time to Recovery",
    "Code Quality Score",
    "System Reliability",
    "Incident Rate",
    "Velocity",
  ],
  delivery: ["On-Time Delivery Rate", "Customer Satisfaction", "Sprint Velocity", "Cycle Time", "WIP", "Burndown"],
}

export function InsightsScreen() {
  const [selectedCategories, setSelectedCategories] = useState<Set<InsightCategory>>(
    new Set(["customer", "market", "product", "sales", "engineering", "marketing", "delivery"]),
  )
  const [tempSelectedCategories, setTempSelectedCategories] = useState<Set<InsightCategory>>(
    new Set(["customer", "market", "product", "sales", "engineering", "marketing", "delivery"]),
  )

  const [expandedCategories, setExpandedCategories] = useState<Set<InsightCategory>>(new Set())
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set())
  const [tempSelectedMetrics, setTempSelectedMetrics] = useState<Set<string>>(new Set())

  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set())
  const [tempSelectedTeams, setTempSelectedTeams] = useState<Set<string>>(new Set())

  const [viewMode, setViewMode] = useState<"ticker" | "card">("card")
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [shareCard, setShareCard] = useState<Insight | null>(null)
  const [savedInsights, setSavedInsights] = useState<Set<string>>(new Set())
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAddSignal, setShowAddSignal] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBenchmark, setShowBenchmark] = useState(false)
  const [showRecommended, setShowRecommended] = useState(false)

  const [signalsDropdownOpen, setSignalsDropdownOpen] = useState(false)
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false)

  const profile = getUserProfile()

  useEffect(() => {
    setIsLoading(true)
    setInsights(mockInsights)
    setIsLoading(false)

    const saved = localStorage.getItem("camino-saved-insights")
    if (saved) {
      setSavedInsights(new Set(JSON.parse(saved)))
    }

    const currentProfile = getUserProfile()
    if (currentProfile?.userType === "manager") {
      const hasCreatedDemoNotifs = localStorage.getItem("camino-demo-notifs-created")
      if (!hasCreatedDemoNotifs) {
        createDemoNotificationsForManager()
        localStorage.setItem("camino-demo-notifs-created", "true")
        setTimeout(() => {
          window.dispatchEvent(new Event("notificationsUpdated"))
        }, 0)
      }
    }
  }, [])

  const filteredInsights = insights.filter((insight) => {
    const categoryMatch = selectedCategories.has(insight.category)
    const metricMatch = selectedMetrics.size === 0 || selectedMetrics.has(insight.metric)
    const teamMatch = selectedTeams.size === 0 || selectedTeams.has(insight.team as string)

    let benchmarkMatch = true
    if (showBenchmark) {
      // Only show insights that are benchmarks
      if (!insight.isBenchmark) {
        return false
      }
      // Show all benchmark insights regardless of profile context
      // (Previously this filtered benchmarks by user context, causing empty results)
      benchmarkMatch = true
    }

    let recommendedMatch = true
    if (showRecommended) {
      const selectedMetricsData = localStorage.getItem("camino-selected-metrics")
      if (selectedMetricsData) {
        const userMetrics = JSON.parse(selectedMetricsData)
        const allUserMetrics = [...(userMetrics.lagging || []), ...(userMetrics.leading || [])]
        recommendedMatch = allUserMetrics.some(
          (userMetric: string) =>
            insight.metric.toLowerCase().includes(userMetric.toLowerCase()) ||
            userMetric.toLowerCase().includes(insight.metric.toLowerCase()) ||
            insight.header.toLowerCase().includes(userMetric.toLowerCase()) ||
            userMetric.toLowerCase().includes(insight.header.toLowerCase()),
        )
      } else {
        recommendedMatch = false
      }
    }

    return categoryMatch && metricMatch && teamMatch && benchmarkMatch && recommendedMatch
  })

  const handleCategoryExpand = (category: InsightCategory) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const handleMetricToggle = (metric: string) => {
    setTempSelectedMetrics((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(metric)) {
        newSet.delete(metric)
      } else {
        newSet.add(metric)
      }
      return newSet
    })
  }

  const handleCategoryToggle = (category: InsightCategory) => {
    setTempSelectedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
        const metricsToRemove = categoryMetrics[category] || []
        metricsToRemove.forEach((metric) => {
          tempSelectedMetrics.delete(metric)
        })
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setTempSelectedCategories(
      new Set(["customer", "market", "product", "sales", "engineering", "marketing", "delivery"]),
    )
    setTempSelectedMetrics(new Set())
  }

  const handleDeselectAll = () => {
    setTempSelectedCategories(new Set())
    setTempSelectedMetrics(new Set())
  }

  const handleSignalsOk = () => {
    setSelectedCategories(new Set(tempSelectedCategories))
    setSelectedMetrics(new Set(tempSelectedMetrics))
    setSignalsDropdownOpen(false)
  }

  const handleSignalsCancel = () => {
    setTempSelectedCategories(new Set(selectedCategories))
    setTempSelectedMetrics(new Set(selectedMetrics))
    setSignalsDropdownOpen(false)
  }

  const handleTeamToggle = (team: string) => {
    setTempSelectedTeams((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(team)) {
        newSet.delete(team)
      } else {
        newSet.add(team)
      }
      return newSet
    })
  }

  const handleTeamSelectAll = () => {
    setTempSelectedTeams(
      new Set(["product", "design", "engineering", "finance", "marketing", "sales", "customer-success", "delivery"]),
    )
  }

  const handleTeamDeselectAll = () => {
    setTempSelectedTeams(new Set())
  }

  const handleTeamOk = () => {
    setSelectedTeams(tempSelectedTeams)
    setTeamDropdownOpen(false)
  }

  const handleTeamCancel = () => {
    setTempSelectedTeams(new Set(selectedTeams))
    setTeamDropdownOpen(false)
  }

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

  const handleDelete = (insightId: string) => {
    if (isDemoSignal(insightId)) {
      setInsights(insights.filter((i) => i.id !== insightId))
    }
  }

  const handleShare = (insight: Insight) => {
    console.log("[v0] Share button clicked for insight:", insight.id)
    setShareCard(insight)
    console.log("[v0] ShareCard state set to:", insight)
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

  return (
    <div
      className="flex flex-col min-h-screen bg-background overflow-x-hidden pt-0"
      style={{ paddingBottom: "max(5rem, calc(5rem + env(safe-area-inset-bottom)))" }}
    >
      <FixedHeader onNotifications={() => setShowNotifications(true)} />

      <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 p-4 pb-2 pt-4 min-w-max">
            <DropdownMenu open={signalsDropdownOpen} onOpenChange={setSignalsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent shrink-0">
                  Signals ({selectedCategories.size})
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Select Signals</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Select All option */}
                <div className="px-2 py-1.5 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-start text-sm font-normal"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-start text-sm font-normal"
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </Button>
                </div>

                <DropdownMenuSeparator />

                {/* Show Benchmarks Only */}
                <div className="px-2 py-1.5">
                  <DropdownMenuCheckboxItem
                    checked={showBenchmark}
                    onCheckedChange={setShowBenchmark}
                    onSelect={(e) => e.preventDefault()}
                  >
                    Show Benchmarks Only
                  </DropdownMenuCheckboxItem>
                </div>

                {/* Recommended */}
                <div className="px-2 py-1.5">
                  <DropdownMenuCheckboxItem
                    checked={showRecommended}
                    onCheckedChange={setShowRecommended}
                    onSelect={(e) => e.preventDefault()}
                  >
                    Recommended
                  </DropdownMenuCheckboxItem>
                </div>

                <DropdownMenuSeparator />

                {/* Customer Category */}
                <div className="px-2 py-1">
                  <div className="flex items-center justify-between">
                    <DropdownMenuCheckboxItem
                      checked={tempSelectedCategories.has("customer")}
                      onCheckedChange={() => handleCategoryToggle("customer")}
                      onSelect={(e) => e.preventDefault()}
                      className="flex-1"
                    >
                      Customer
                    </DropdownMenuCheckboxItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategoryExpand("customer")
                      }}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedCategories.has("customer") ? "rotate-90" : ""}`}
                      />
                    </Button>
                  </div>
                  {expandedCategories.has("customer") && (
                    <div className="ml-6 mt-1 space-y-1">
                      {categoryMetrics.customer.map((metric) => (
                        <DropdownMenuCheckboxItem
                          key={metric}
                          checked={tempSelectedMetrics.has(metric)}
                          onCheckedChange={() => handleMetricToggle(metric)}
                          onSelect={(e) => e.preventDefault()}
                          className="text-xs"
                        >
                          {metric}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  )}
                </div>

                {/* Market Category */}
                <div className="px-2 py-1">
                  <div className="flex items-center justify-between">
                    <DropdownMenuCheckboxItem
                      checked={tempSelectedCategories.has("market")}
                      onCheckedChange={() => handleCategoryToggle("market")}
                      onSelect={(e) => e.preventDefault()}
                      className="flex-1"
                    >
                      Market
                    </DropdownMenuCheckboxItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategoryExpand("market")
                      }}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedCategories.has("market") ? "rotate-90" : ""}`}
                      />
                    </Button>
                  </div>
                  {expandedCategories.has("market") && (
                    <div className="ml-6 mt-1 space-y-1">
                      {categoryMetrics.market.map((metric) => (
                        <DropdownMenuCheckboxItem
                          key={metric}
                          checked={tempSelectedMetrics.has(metric)}
                          onCheckedChange={() => handleMetricToggle(metric)}
                          onSelect={(e) => e.preventDefault()}
                          className="text-xs"
                        >
                          {metric}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Category */}
                <div className="px-2 py-1">
                  <div className="flex items-center justify-between">
                    <DropdownMenuCheckboxItem
                      checked={tempSelectedCategories.has("product")}
                      onCheckedChange={() => handleCategoryToggle("product")}
                      onSelect={(e) => e.preventDefault()}
                      className="flex-1"
                    >
                      Product
                    </DropdownMenuCheckboxItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategoryExpand("product")
                      }}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedCategories.has("product") ? "rotate-90" : ""}`}
                      />
                    </Button>
                  </div>
                  {expandedCategories.has("product") && (
                    <div className="ml-6 mt-1 space-y-1">
                      {categoryMetrics.product.map((metric) => (
                        <DropdownMenuCheckboxItem
                          key={metric}
                          checked={tempSelectedMetrics.has(metric)}
                          onCheckedChange={() => handleMetricToggle(metric)}
                          onSelect={(e) => e.preventDefault()}
                          className="text-xs"
                        >
                          {metric}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sales Category */}
                <div className="px-2 py-1">
                  <div className="flex items-center justify-between">
                    <DropdownMenuCheckboxItem
                      checked={tempSelectedCategories.has("sales")}
                      onCheckedChange={() => handleCategoryToggle("sales")}
                      onSelect={(e) => e.preventDefault()}
                      className="flex-1"
                    >
                      Sales
                    </DropdownMenuCheckboxItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategoryExpand("sales")
                      }}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedCategories.has("sales") ? "rotate-90" : ""}`}
                      />
                    </Button>
                  </div>
                  {expandedCategories.has("sales") && (
                    <div className="ml-6 mt-1 space-y-1">
                      {categoryMetrics.sales.map((metric) => (
                        <DropdownMenuCheckboxItem
                          key={metric}
                          checked={tempSelectedMetrics.has(metric)}
                          onCheckedChange={() => handleMetricToggle(metric)}
                          onSelect={(e) => e.preventDefault()}
                          className="text-xs"
                        >
                          {metric}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  )}
                </div>

                {/* Engineering Category */}
                <div className="px-2 py-1">
                  <div className="flex items-center justify-between">
                    <DropdownMenuCheckboxItem
                      checked={tempSelectedCategories.has("engineering")}
                      onCheckedChange={() => handleCategoryToggle("engineering")}
                      onSelect={(e) => e.preventDefault()}
                      className="flex-1"
                    >
                      Engineering
                    </DropdownMenuCheckboxItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategoryExpand("engineering")
                      }}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedCategories.has("engineering") ? "rotate-90" : ""}`}
                      />
                    </Button>
                  </div>
                  {expandedCategories.has("engineering") && (
                    <div className="ml-6 mt-1 space-y-1">
                      {categoryMetrics.engineering.map((metric) => (
                        <DropdownMenuCheckboxItem
                          key={metric}
                          checked={tempSelectedMetrics.has(metric)}
                          onCheckedChange={() => handleMetricToggle(metric)}
                          onSelect={(e) => e.preventDefault()}
                          className="text-xs"
                        >
                          {metric}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  )}
                </div>

                {/* Marketing Category */}
                <div className="px-2 py-1">
                  <div className="flex items-center justify-between">
                    <DropdownMenuCheckboxItem
                      checked={tempSelectedCategories.has("marketing")}
                      onCheckedChange={() => handleCategoryToggle("marketing")}
                      onSelect={(e) => e.preventDefault()}
                      className="flex-1"
                    >
                      Marketing
                    </DropdownMenuCheckboxItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategoryExpand("marketing")
                      }}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedCategories.has("marketing") ? "rotate-90" : ""}`}
                      />
                    </Button>
                  </div>
                  {expandedCategories.has("marketing") && (
                    <div className="ml-6 mt-1 space-y-1">
                      {categoryMetrics.marketing.map((metric) => (
                        <DropdownMenuCheckboxItem
                          key={metric}
                          checked={tempSelectedMetrics.has(metric)}
                          onCheckedChange={() => handleMetricToggle(metric)}
                          onSelect={(e) => e.preventDefault()}
                          className="text-xs"
                        >
                          {metric}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delivery Category */}
                <div className="px-2 py-1">
                  <div className="flex items-center justify-between">
                    <DropdownMenuCheckboxItem
                      checked={tempSelectedCategories.has("delivery")}
                      onCheckedChange={() => handleCategoryToggle("delivery")}
                      onSelect={(e) => e.preventDefault()}
                      className="flex-1"
                    >
                      Delivery
                    </DropdownMenuCheckboxItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategoryExpand("delivery")
                      }}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedCategories.has("delivery") ? "rotate-90" : ""}`}
                      />
                    </Button>
                  </div>
                  {expandedCategories.has("delivery") && (
                    <div className="ml-6 mt-1 space-y-1">
                      {categoryMetrics.delivery.map((metric) => (
                        <DropdownMenuCheckboxItem
                          key={metric}
                          checked={tempSelectedMetrics.has(metric)}
                          onCheckedChange={() => handleMetricToggle(metric)}
                          onSelect={(e) => e.preventDefault()}
                          className="text-xs"
                        >
                          {metric}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  )}
                </div>

                <DropdownMenuSeparator />
                <div className="flex gap-2 p-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={handleSignalsCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleSignalsOk}>
                    <Check className="h-4 w-4 mr-1" />
                    OK
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={teamDropdownOpen} onOpenChange={setTeamDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent shrink-0">
                  Assigned ({selectedTeams.size || "All"})
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Assigned</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Select All and Deselect All buttons */}
                <div className="flex gap-2 p-2">
                  <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={handleTeamSelectAll}>
                    Select All
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={handleTeamDeselectAll}>
                    Deselect All
                  </Button>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={tempSelectedTeams.has("product")}
                  onCheckedChange={() => handleTeamToggle("product")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Product
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={tempSelectedTeams.has("design")}
                  onCheckedChange={() => handleTeamToggle("design")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Design
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={tempSelectedTeams.has("engineering")}
                  onCheckedChange={() => handleTeamToggle("engineering")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Engineering
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={tempSelectedTeams.has("finance")}
                  onCheckedChange={() => handleTeamToggle("finance")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Finance
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={tempSelectedTeams.has("marketing")}
                  onCheckedChange={() => handleTeamToggle("marketing")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Marketing
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={tempSelectedTeams.has("sales")}
                  onCheckedChange={() => handleTeamToggle("sales")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Sales
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={tempSelectedTeams.has("customer-success")}
                  onCheckedChange={() => handleTeamToggle("customer-success")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Customer Support
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={tempSelectedTeams.has("delivery")}
                  onCheckedChange={() => handleTeamToggle("delivery")}
                  onSelect={(e) => e.preventDefault()}
                >
                  Delivery
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <div className="flex gap-2 p-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={handleTeamCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleTeamOk}>
                    <Check className="h-4 w-4 mr-1" />
                    OK
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent shrink-0"
              onClick={() => setViewMode(viewMode === "card" ? "ticker" : "card")}
            >
              {viewMode === "card" ? (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  Card
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4" />
                  Ticker
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading your signals...</p>
            </div>
          </div>
        ) : viewMode === "ticker" ? (
          <div className="flex flex-col gap-3 p-4 w-full">
            {filteredInsights.map((insight) => (
              <TickerCard key={insight.id} insight={insight} onClick={() => handleExpand(insight.id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4 w-full">
            {filteredInsights.map((insight) =>
              insight.insufficientData ? (
                <InsufficientDataCard key={insight.id} insight={insight} />
              ) : (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  isSaved={savedInsights.has(insight.id)}
                  onSave={() => handleSave(insight.id)}
                  onShare={() => handleShare(insight)}
                  onExpand={() => handleExpand(insight.id)}
                  onDelete={isDemoSignal(insight.id) ? () => handleDelete(insight.id) : undefined}
                  fullScreen={false}
                />
              )
            )}
          </div>
        )}
      </div>

      {profile && profile.permissions.includes("edit") && (
        <Button
          onClick={() => setShowAddSignal(true)}
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
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
      {showAddSignal && <AddSignalModal onClose={() => setShowAddSignal(false)} />}
      {showAlerts && <AlertsModal onClose={() => setShowAlerts(false)} />}

      <BottomNavigation />
    </div>
  )
}
