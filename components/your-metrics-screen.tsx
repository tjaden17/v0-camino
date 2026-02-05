"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { getMetricsForRole } from "@/lib/metrics-by-role"
import type { UserRole } from "@/lib/types"
import type { MetricRecommendation } from "@/lib/metrics-by-role"

interface YourMetricsScreenProps {
  role: UserRole
  onNext: (selectedMetrics: MetricRecommendation[]) => void
  onSkip: () => void
  onBack: () => void
}

interface MetricNode {
  metric: MetricRecommendation
  children: MetricNode[]
}

function buildMetricTree(metrics: MetricRecommendation[]): MetricNode[] {
  const primary = metrics.filter((m) => m.category === "primary")
  const secondary = metrics.filter((m) => m.category === "secondary")
  const tertiary = metrics.filter((m) => m.category === "tertiary")

  // Build tree structure where primary has secondary children, secondary has tertiary children
  return primary.map((primaryMetric, pIndex) => {
    const secondaryChildren = secondary
      .slice(pIndex * 2, pIndex * 2 + 2) // Assign 2 secondary metrics per primary
      .map((secondaryMetric, sIndex) => {
        const tertiaryChildren = tertiary.slice(sIndex, sIndex + 1).map((tertiaryMetric) => ({
          metric: tertiaryMetric,
          children: [],
        }))

        return {
          metric: secondaryMetric,
          children: tertiaryChildren,
        }
      })

    return {
      metric: primaryMetric,
      children: secondaryChildren,
    }
  })
}

function MetricNodeCard({
  node,
  isSelected,
  onToggle,
  level,
}: {
  node: MetricNode
  isSelected: boolean
  onToggle: (id: string) => void
  level: "primary" | "secondary" | "tertiary"
}) {
  const levelColors = {
    primary: "bg-blue-500/10 border-blue-500/50",
    secondary: "bg-purple-500/10 border-purple-500/50",
    tertiary: "bg-amber-500/10 border-amber-500/50",
  }

  const levelLabels = {
    primary: "Primary",
    secondary: "Secondary",
    tertiary: "Tertiary",
  }

  return (
    <div
      className={`border-2 rounded-lg p-3 min-w-[240px] max-w-[260px] flex-shrink-0 cursor-pointer transition-all ${
        levelColors[level]
      } ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={() => onToggle(node.metric.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <Badge variant="outline" className="mb-2 text-xs">
            {levelLabels[level]}
          </Badge>
          <h4 className="font-semibold text-sm break-words">{node.metric.name}</h4>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
            isSelected ? "bg-primary border-primary" : "border-muted-foreground"
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{node.metric.description}</p>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Example datasets:</span>
          <br />
          {node.metric.requiredDatasets.join(", ")}
        </p>
      </div>
    </div>
  )
}

export function YourMetricsScreen({ role, onNext, onSkip, onBack }: YourMetricsScreenProps) {
  const recommendedMetrics = getMetricsForRole(role)
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(recommendedMetrics.map((m) => m.id)))

  const metricTree = buildMetricTree(recommendedMetrics)

  const handleToggleMetric = (metricId: string) => {
    const newSelected = new Set(selectedMetrics)
    if (newSelected.has(metricId)) {
      newSelected.delete(metricId)
    } else {
      newSelected.add(metricId)
    }
    setSelectedMetrics(newSelected)
  }

  const handleContinue = () => {
    const selected = recommendedMetrics.filter((m) => selectedMetrics.has(m.id))
    onNext(selected)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 py-6 max-w-full overflow-x-hidden pb-safe-offset-24">
      <header className="flex items-center justify-between mb-6 w-full">
        <h1 className="text-2xl font-bold text-primary">Camino</h1>
      </header>

      <div className="flex-1 flex flex-col max-w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-balance px-2">Your Metrics</h2>
          <p className="text-sm text-muted-foreground px-2">
            Based on your role, we've recommended these metrics in a hierarchy. Select the ones you want to track.
          </p>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto pb-4 mb-20">
          <div className="inline-flex gap-6 min-w-max px-2">
            {/* Primary Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-600 sticky top-0 bg-background pb-2">Primary Metrics</h3>
              <div className="flex flex-col gap-4">
                {metricTree.map((primaryNode) => (
                  <MetricNodeCard
                    key={primaryNode.metric.id}
                    node={primaryNode}
                    isSelected={selectedMetrics.has(primaryNode.metric.id)}
                    onToggle={handleToggleMetric}
                    level="primary"
                  />
                ))}
              </div>
            </div>

            {/* Secondary Column */}
            {metricTree.some((node) => node.children.length > 0) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-purple-600 sticky top-0 bg-background pb-2">
                  Secondary Metrics
                </h3>
                <div className="flex flex-col gap-4">
                  {metricTree.flatMap((primaryNode) =>
                    primaryNode.children.map((secondaryNode) => (
                      <MetricNodeCard
                        key={secondaryNode.metric.id}
                        node={secondaryNode}
                        isSelected={selectedMetrics.has(secondaryNode.metric.id)}
                        onToggle={handleToggleMetric}
                        level="secondary"
                      />
                    )),
                  )}
                </div>
              </div>
            )}

            {/* Tertiary Column */}
            {metricTree.some((node) => node.children.some((child) => child.children.length > 0)) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-amber-600 sticky top-0 bg-background pb-2">
                  Tertiary Metrics
                </h3>
                <div className="flex flex-col gap-4">
                  {metricTree.flatMap((primaryNode) =>
                    primaryNode.children.flatMap((secondaryNode) =>
                      secondaryNode.children.map((tertiaryNode) => (
                        <MetricNodeCard
                          key={tertiaryNode.metric.id}
                          node={tertiaryNode}
                          isSelected={selectedMetrics.has(tertiaryNode.metric.id)}
                          onToggle={handleToggleMetric}
                          level="tertiary"
                        />
                      )),
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex gap-2 fixed bottom-0 left-0 right-0 bg-background p-4 border-t pb-safe-or-4 z-10">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 py-5 text-base font-semibold bg-transparent"
            size="lg"
          >
            Back
          </Button>
          <Button onClick={onSkip} variant="ghost" className="flex-1 py-5 text-base font-semibold" size="lg">
            Skip
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedMetrics.size === 0}
            className="flex-1 py-5 text-base font-semibold"
            size="lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
