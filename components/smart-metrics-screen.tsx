"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { type MetricRecommendation, getMetricsByRole, getAllAvailableMetrics } from "@/lib/metrics-by-role"

interface SmartMetricsScreenProps {
  role: string
  onNext: (metrics: MetricRecommendation[]) => void
  onBack: () => void
}

export function SmartMetricsScreen({ role, onNext, onBack }: SmartMetricsScreenProps) {
  const allMetrics = getMetricsByRole(role)
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(allMetrics.map((m) => m.name)))
  const [showOtherMetrics, setShowOtherMetrics] = useState(false)

  const roleMetricNames = new Set(allMetrics.map((m) => m.name))
  const otherAvailableMetrics = getAllAvailableMetrics().filter((m) => !roleMetricNames.has(m.name))
  const otherLaggingMetrics = otherAvailableMetrics.filter((m) => m.category === "lagging")
  const otherLeadingMetrics = otherAvailableMetrics.filter((m) => m.category === "leading")

  const toggleMetric = (metricName: string) => {
    setSelectedMetrics((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(metricName)) {
        newSet.delete(metricName)
      } else {
        newSet.add(metricName)
      }
      return newSet
    })
  }

  const handleContinue = () => {
    const allAvailable = [...allMetrics, ...otherAvailableMetrics]
    const selected = allAvailable.filter((m) => selectedMetrics.has(m.name))

    const metricNames = selected.map((m) => m.name)
    localStorage.setItem("camino-selected-metrics", JSON.stringify(metricNames))

    onNext(selected)
  }

  const laggingMetrics = allMetrics.filter((m) => m.category === "lagging")
  const leadingMetrics = allMetrics.filter((m) => m.category === "leading")

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 py-8 max-w-full overflow-x-hidden">
      <header className="flex items-center justify-between mb-8 w-full">
        <h1 className="text-2xl font-bold text-primary">Camino</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-xs px-2">
            Sign In
          </Button>
          <Button variant="outline" size="sm" className="text-xs px-2 bg-transparent">
            Sign Up
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start max-w-md mx-auto w-full pb-24">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance px-2">Your Smart Metrics</h2>
          <p className="text-sm text-muted-foreground mb-1">Based on your role and goals</p>
          <p className="text-xs text-muted-foreground italic">You can customize this later</p>
        </div>

        <div className="w-full space-y-6 mb-6">
          {laggingMetrics.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Lagging Metrics
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Company-level goals and outcomes</p>
              <div className="space-y-2">
                {laggingMetrics.map((metric) => (
                  <Card
                    key={metric.name}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedMetrics.has(metric.name)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleMetric(metric.name)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{metric.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{metric.description}</p>
                      </div>
                      <div className="shrink-0">
                        {selectedMetrics.has(metric.name) && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {!selectedMetrics.has(metric.name) && (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {leadingMetrics.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                Leading Metrics
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Leading indicators of lagging metrics</p>
              <div className="space-y-2">
                {leadingMetrics.map((metric) => (
                  <Card
                    key={metric.name}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedMetrics.has(metric.name)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleMetric(metric.name)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{metric.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{metric.description}</p>
                      </div>
                      <div className="shrink-0">
                        {selectedMetrics.has(metric.name) && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {!selectedMetrics.has(metric.name) && (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                        )}
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
                <span className="text-xs text-muted-foreground">({otherAvailableMetrics.length} available)</span>
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
                          className={`p-3 cursor-pointer transition-all ${
                            selectedMetrics.has(metric.name)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => toggleMetric(metric.name)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-sm">{metric.name}</h5>
                              <p className="text-xs text-muted-foreground line-clamp-2">{metric.description}</p>
                            </div>
                            <div className="shrink-0">
                              {selectedMetrics.has(metric.name) ? (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                              )}
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
                          className={`p-3 cursor-pointer transition-all ${
                            selectedMetrics.has(metric.name)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => toggleMetric(metric.name)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-sm">{metric.name}</h5>
                              <p className="text-xs text-muted-foreground line-clamp-2">{metric.description}</p>
                            </div>
                            <div className="shrink-0">
                              {selectedMetrics.has(metric.name) ? (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                              )}
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
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 py-6 text-base font-semibold bg-transparent"
            size="lg"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 py-6 text-base font-semibold"
            size="lg"
            disabled={selectedMetrics.size === 0}
          >
            Continue
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
