"use client"

import { useState, useEffect } from "react"
import { FixedHeader } from "@/components/fixed-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { NotificationsModal } from "@/components/notifications-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Plus, Check } from "lucide-react"
import { ShareModal } from "@/components/share-modal"
import { InviteToActionModal } from "@/components/invite-to-action-modal"
import { type MetricRecommendation, getAllAvailableMetrics } from "@/lib/metrics-by-role"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export function SignalMapScreen() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const [showDatasetModal, setShowDatasetModal] = useState(false)
  const [pendingMetric, setPendingMetric] = useState<string | null>(null)
  const [showInviteFlow, setShowInviteFlow] = useState(false)

  const [showOtherMetrics, setShowOtherMetrics] = useState(false)

  const [userSelectedMetrics, setUserSelectedMetrics] = useState<Set<string>>(new Set())
  const [allAvailableMetrics, setAllAvailableMetrics] = useState<MetricRecommendation[]>([])

  useEffect(() => {
    const savedMetrics = localStorage.getItem("camino-selected-metrics")
    if (savedMetrics) {
      try {
        const metrics = JSON.parse(savedMetrics)
        setUserSelectedMetrics(new Set(metrics))
      } catch {
        // Ignore parse errors
      }
    }

    setAllAvailableMetrics(getAllAvailableMetrics())
  }, [])

  const userLaggingMetrics = allAvailableMetrics.filter(
    (m) => m.category === "lagging" && userSelectedMetrics.has(m.name),
  )
  const userLeadingMetrics = allAvailableMetrics.filter(
    (m) => m.category === "leading" && userSelectedMetrics.has(m.name),
  )

  const otherLaggingMetrics = allAvailableMetrics.filter(
    (m) => m.category === "lagging" && !userSelectedMetrics.has(m.name),
  )
  const otherLeadingMetrics = allAvailableMetrics.filter(
    (m) => m.category === "leading" && !userSelectedMetrics.has(m.name),
  )

  const toggleMetric = (metricName: string, requiresDataset = false) => {
    if (requiresDataset) {
      setPendingMetric(metricName)
      setShowDatasetModal(true)
    } else {
      setUserSelectedMetrics((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(metricName)) {
          newSet.delete(metricName)
        } else {
          newSet.add(metricName)
        }
        localStorage.setItem("camino-selected-metrics", JSON.stringify(Array.from(newSet)))
        return newSet
      })
    }
  }

  const handleConnectDataset = (connectSelf: boolean) => {
    if (pendingMetric) {
      if (connectSelf) {
        alert("Opening dataset connection...")
        setShowDatasetModal(false)
        setPendingMetric(null)
      } else {
        setShowDatasetModal(false)
        setShowInviteFlow(true)
      }
    }
  }

  const handleInviteFlowClose = () => {
    setShowInviteFlow(false)
    setPendingMetric(null)
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-background pb-20 pt-16"
      style={{ paddingBottom: "max(5rem, calc(5rem + env(safe-area-inset-bottom)))" }}
    >
      <FixedHeader onNotifications={() => setShowNotifications(true)} />

      <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-foreground">Impact</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The metrics you're focusing on to drive your desired impact
          </p>
          <p className="text-xs text-muted-foreground italic mt-1">You can customize this anytime</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-md mx-auto w-full">
        {userLaggingMetrics.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Lagging Metrics
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Company-level goals and outcomes</p>
            <div className="space-y-2">
              {userLaggingMetrics.map((metric) => (
                <Card
                  key={metric.name}
                  className="p-3 border-blue-500 bg-blue-500/10 cursor-pointer"
                  onClick={() => toggleMetric(metric.name)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{metric.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="shrink-0">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {userLeadingMetrics.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              Leading Metrics
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Leading indicators of lagging metrics</p>
            <div className="space-y-2">
              {userLeadingMetrics.map((metric) => (
                <Card
                  key={metric.name}
                  className="p-3 border-purple-500 bg-purple-500/10 cursor-pointer"
                  onClick={() => toggleMetric(metric.name)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{metric.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="shrink-0">
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border pt-6">
          <button
            onClick={() => setShowOtherMetrics(!showOtherMetrics)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Add Other Metrics</h3>
              <span className="text-xs text-muted-foreground">
                ({otherLaggingMetrics.length + otherLeadingMetrics.length} available)
              </span>
            </div>
            {showOtherMetrics ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {showOtherMetrics && (
            <div className="mt-4 space-y-6">
              {otherLaggingMetrics.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Other Lagging Metrics
                  </h4>
                  <div className="space-y-2">
                    {otherLaggingMetrics.map((metric) => (
                      <Card
                        key={metric.name}
                        className="p-3 cursor-pointer border-border hover:border-blue-500/50 transition-all"
                        onClick={() => toggleMetric(metric.name, true)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm text-muted-foreground">{metric.name}</h5>
                            <p className="text-xs text-muted-foreground">{metric.description}</p>
                          </div>
                          <div className="shrink-0">
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {otherLeadingMetrics.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    Other Leading Metrics
                  </h4>
                  <div className="space-y-2">
                    {otherLeadingMetrics.map((metric) => (
                      <Card
                        key={metric.name}
                        className="p-3 cursor-pointer border-border hover:border-purple-500/50 transition-all"
                        onClick={() => toggleMetric(metric.name, true)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm text-muted-foreground">{metric.name}</h5>
                            <p className="text-xs text-muted-foreground">{metric.description}</p>
                          </div>
                          <div className="shrink-0">
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDatasetModal} onOpenChange={setShowDatasetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Dataset</DialogTitle>
            <DialogDescription>We need to connect to a dataset to inform these signals</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2">Suggested datasets for {pendingMetric}:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HubSpot (CRM)</li>
                <li>• Salesforce (Sales data)</li>
                <li>• Stripe (Revenue data)</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Would you like to connect yourself, or invite someone else to?
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDatasetModal(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleConnectDataset(false)} className="w-full sm:w-auto">
              Invite Someone
            </Button>
            <Button onClick={() => handleConnectDataset(true)} className="w-full sm:w-auto">
              Connect Myself
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showInviteFlow && <InviteToActionModal onClose={handleInviteFlowClose} />}

      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}

      {showShareModal && (
        <ShareModal
          insight={{
            id: "signal-map",
            category: "company" as any,
            header: "Impact Map",
            metric: "Company Metrics Focus",
            value: "Aligned",
            change: "",
            trend: "neutral" as any,
            timeframe: "",
            description: "Share your company's impact focus and metrics",
            summary: "Company impact metrics",
            benchmark: "",
            analysis: "",
            implications: "",
            nextSteps: "",
            source: "Impact Map",
            isRAG: false,
            team: "company",
          }}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <BottomNavigation />
    </div>
  )
}
