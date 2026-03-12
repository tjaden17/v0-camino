"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle, X, ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import type { SignalDiscoveryResult, DiscoveredSignal } from "@/lib/signal-discovery-service"
import { useState } from "react"

interface SignalDiscoveryPanelProps {
  discoveryResult: SignalDiscoveryResult
  onGenerateSignals?: (signals: DiscoveredSignal[]) => void
}

export function SignalDiscoveryPanel({ discoveryResult, onGenerateSignals }: SignalDiscoveryPanelProps) {
  const [showAvailable, setShowAvailable] = useState(true)
  const [showPartial, setShowPartial] = useState(true)
  const [showUnavailable, setShowUnavailable] = useState(false)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Signal Discovery Complete</h3>
            <p className="text-sm text-muted-foreground">
              Analyzed <strong>{discoveryResult.totalRowsAnalyzed} rows</strong> from{" "}
              <strong>{discoveryResult.dataSource}</strong> with{" "}
              <strong>{discoveryResult.detectedColumns.length} columns</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-600">{discoveryResult.availableSignals.length}</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
            <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-600">{discoveryResult.partialSignals.length}</div>
              <div className="text-xs text-muted-foreground">Partial</div>
            </div>
            <div className="text-center p-3 bg-gray-500/10 rounded-lg border border-gray-500/20">
              <div className="text-2xl font-bold text-gray-600">{discoveryResult.unavailableSignals.length}</div>
              <div className="text-xs text-muted-foreground">Unavailable</div>
            </div>
          </div>

          {discoveryResult.availableSignals.length > 0 && onGenerateSignals && (
            <Button onClick={() => onGenerateSignals(discoveryResult.availableSignals)} className="w-full">
              Generate {discoveryResult.availableSignals.length} Available Signals
            </Button>
          )}
        </div>
      </Card>

      {/* Recommendations */}
      {discoveryResult.recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h4 className="font-semibold">Recommendations</h4>
          </div>
          <ul className="space-y-2">
            {discoveryResult.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-xs mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Available Signals */}
      {discoveryResult.availableSignals.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowAvailable(!showAvailable)}
            className="w-full flex items-center justify-between font-semibold text-left p-3 rounded-lg hover:bg-green-500/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Available Signals ({discoveryResult.availableSignals.length})
            </span>
            {showAvailable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAvailable && (
            <div className="space-y-2">
              {discoveryResult.availableSignals.map((discovered, index) => (
                <SignalDiscoveryCard key={index} discovered={discovered} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Partial Signals */}
      {discoveryResult.partialSignals.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowPartial(!showPartial)}
            className="w-full flex items-center justify-between font-semibold text-left p-3 rounded-lg hover:bg-orange-500/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Partial Signals ({discoveryResult.partialSignals.length})
            </span>
            {showPartial ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showPartial && (
            <div className="space-y-2">
              {discoveryResult.partialSignals.map((discovered, index) => (
                <SignalDiscoveryCard key={index} discovered={discovered} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Unavailable Signals (collapsible) */}
      {discoveryResult.unavailableSignals.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowUnavailable(!showUnavailable)}
            className="w-full flex items-center justify-between font-semibold text-left p-3 rounded-lg hover:bg-gray-500/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <X className="h-4 w-4 text-gray-600" />
              Unavailable Signals ({discoveryResult.unavailableSignals.length})
            </span>
            {showUnavailable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showUnavailable && (
            <div className="space-y-2">
              {discoveryResult.unavailableSignals.slice(0, 10).map((discovered, index) => (
                <SignalDiscoveryCard key={index} discovered={discovered} />
              ))}
              {discoveryResult.unavailableSignals.length > 10 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  ... and {discoveryResult.unavailableSignals.length - 10} more
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SignalDiscoveryCard({ discovered }: { discovered: DiscoveredSignal }) {
  const { signal, availability, matchScore, matchedFields, missingFields, reason } = discovered

  const availabilityConfig = {
    available: { color: "bg-green-500/10 border-green-500/20", badge: "bg-green-500 text-white", icon: Check },
    partial: { color: "bg-orange-500/10 border-orange-500/20", badge: "bg-orange-500 text-white", icon: AlertCircle },
    unavailable: { color: "bg-gray-500/10 border-gray-500/20", badge: "bg-gray-500 text-white", icon: X },
  }

  const config = availabilityConfig[availability]
  const Icon = config.icon

  return (
    <Card className={`p-4 ${config.color}`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4" />
              <h5 className="font-medium">{signal.signalName}</h5>
            </div>
            <p className="text-xs text-muted-foreground">{signal.description}</p>
          </div>
          <Badge className={config.badge}>{matchScore.toFixed(0)}%</Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="font-medium">Category:</span> <Badge variant="outline">{signal.category}</Badge>
          </div>
          <div>
            <span className="font-medium">Valuable for:</span> {signal.valuableFor.join(", ")}
          </div>
          <div>
            <span className="font-medium">Status:</span> {reason}
          </div>

          {matchedFields.length > 0 && (
            <div>
              <span className="font-medium text-green-600">Matched fields:</span>{" "}
              <span className="text-green-700">{matchedFields.join(", ")}</span>
            </div>
          )}

          {missingFields.length > 0 && (
            <div>
              <span className="font-medium text-orange-600">Missing fields:</span>{" "}
              <span className="text-orange-700">{missingFields.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
