"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CheckCircle2,
  CircleDashed,
  Combine,
  FileSpreadsheet,
  Lightbulb,
  Lock,
  Sparkles,
  TrendingUp,
  Unlock,
} from "lucide-react"

interface CalculableSignal {
  name: string
  category: string
  type: "single_source" | "cross_source" | "derived"
  sources: { id: string; name: string }[]
  confidence: number
}

interface PartialSignal {
  name: string
  category: string
  percentComplete: number
  missingFields: string[]
}

interface UnlockableSignal {
  signal: string
  missingFields: string[]
  percentComplete: number
}

interface SignalOpportunitiesPanelProps {
  calculable: CalculableSignal[]
  partial: PartialSignal[]
  unlockable: UnlockableSignal[]
  onSelectSignals?: (signals: string[]) => void
  onDismissSignal?: (signal: string) => void
}

export function SignalOpportunitiesPanel({
  calculable,
  partial,
  unlockable,
  onSelectSignals,
  onDismissSignal,
}: SignalOpportunitiesPanelProps) {
  const [selectedSignals, setSelectedSignals] = useState<Set<string>>(new Set())

  const crossSourceSignals = calculable.filter(s => s.type === "cross_source")
  const singleSourceSignals = calculable.filter(s => s.type !== "cross_source")

  const toggleSignal = (name: string) => {
    const newSelected = new Set(selectedSignals)
    if (newSelected.has(name)) {
      newSelected.delete(name)
    } else {
      newSelected.add(name)
    }
    setSelectedSignals(newSelected)
  }

  const selectAll = () => {
    setSelectedSignals(new Set(calculable.map(s => s.name)))
  }

  const handleCalculate = () => {
    if (onSelectSignals) {
      onSelectSignals(Array.from(selectedSignals))
    }
  }

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Revenue: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      Sales: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      Marketing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "Customer Success": "bg-amber-500/10 text-amber-600 border-amber-500/20",
      Support: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      Product: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      Finance: "bg-green-500/10 text-green-600 border-green-500/20",
      HR: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    }
    return colors[category] || "bg-muted text-muted-foreground"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Signal Opportunities
            </CardTitle>
            <CardDescription>
              Signals discovered from your data sources
            </CardDescription>
          </div>
          {calculable.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All ({calculable.length})
              </Button>
              <Button 
                size="sm" 
                onClick={handleCalculate}
                disabled={selectedSignals.size === 0}
              >
                Calculate Selected ({selectedSignals.size})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ready" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ready" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Ready ({calculable.length})
            </TabsTrigger>
            <TabsTrigger value="combined" className="flex items-center gap-2">
              <Combine className="h-4 w-4" />
              Cross-Source ({crossSourceSignals.length})
            </TabsTrigger>
            <TabsTrigger value="unlock" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Unlockable ({unlockable.length})
            </TabsTrigger>
          </TabsList>

          {/* Ready to Calculate */}
          <TabsContent value="ready" className="mt-4">
            {calculable.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CircleDashed className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No signals ready to calculate yet.</p>
                <p className="text-sm">Upload more data to discover signals.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {calculable.map((signal) => (
                  <div
                    key={signal.name}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSignals.has(signal.name)
                        ? "bg-primary/5 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleSignal(signal.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        selectedSignals.has(signal.name) ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        {selectedSignals.has(signal.name) ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{signal.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getCategoryColor(signal.category)}>
                            {signal.category}
                          </Badge>
                          {signal.type === "cross_source" && (
                            <Badge variant="secondary" className="text-xs">
                              <Combine className="h-3 w-3 mr-1" />
                              Cross-source
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <FileSpreadsheet className="h-4 w-4" />
                              {signal.sources.length}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium mb-1">Data Sources:</p>
                            {signal.sources.map(s => (
                              <p key={s.id} className="text-xs">{s.name}</p>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cross-Source Signals */}
          <TabsContent value="combined" className="mt-4">
            {crossSourceSignals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Combine className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No cross-source signals discovered yet.</p>
                <p className="text-sm">Upload data from different sources to unlock combined insights.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    These signals combine data from multiple uploads for deeper insights.
                  </p>
                </div>
                <div className="grid gap-3">
                  {crossSourceSignals.map((signal) => (
                    <div
                      key={signal.name}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSignals.has(signal.name)
                          ? "bg-primary/5 border-primary"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleSignal(signal.name)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          selectedSignals.has(signal.name) ? "bg-primary text-primary-foreground" : "bg-blue-500/10"
                        }`}>
                          <Combine className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{signal.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={getCategoryColor(signal.category)}>
                              {signal.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              from {signal.sources.length} sources
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {signal.sources.map(s => (
                          <Badge key={s.id} variant="secondary" className="text-xs">
                            {s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Unlockable Signals */}
          <TabsContent value="unlock" className="mt-4">
            {unlockable.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Unlock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>All available signals have been discovered!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Upload additional data to unlock these signals.
                  </p>
                </div>
                <div className="grid gap-3">
                  {unlockable.map((signal) => (
                    <div
                      key={signal.signal}
                      className="p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{signal.signal}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {signal.percentComplete}% ready
                        </span>
                      </div>
                      <Progress value={signal.percentComplete} className="h-2 mb-2" />
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Missing:</span>
                        {signal.missingFields.map(field => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
