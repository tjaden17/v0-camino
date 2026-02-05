"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, Users, User, ChevronDown, ChevronRight, Settings, X, UserPlus } from "lucide-react"
import { AssignMetricModal } from "@/components/assign-metric-modal"
import type { SignalNode } from "@/lib/signal-system"
import { mockSignalSystem } from "@/lib/signal-system"

interface SelectedSignals {
  primary: string[]
  secondary: string[]
  tertiary: string[]
}

function SignalNodeCard({
  node,
  isEditMode,
  onAssignOwner,
}: { node: SignalNode; isEditMode?: boolean; onAssignOwner?: (nodeId: string) => void }) {
  const levelColors = {
    primary: "bg-blue-500/10 border-blue-500/50",
    secondary: "bg-purple-500/10 border-purple-500/50",
    tertiary: "bg-amber-500/10 border-amber-500/50",
  }

  const levelLabels = {
    primary: "Primary Signal",
    secondary: "Secondary Signal",
    tertiary: "Tertiary Signal",
  }

  return (
    <div className={`border-2 rounded-lg p-3 min-w-[240px] flex-shrink-0 ${levelColors[node.level]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <Badge variant="outline" className="mb-2 text-xs">
            {levelLabels[node.level]}
          </Badge>
          <h4 className="font-semibold text-sm break-words">{node.name}</h4>
        </div>
        {node.trend === "up" ? (
          <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
        )}
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{node.value}</span>
          <span className={`text-sm font-medium ${node.trend === "up" ? "text-green-500" : "text-red-500"}`}>
            {node.change}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t">
        {node.owner ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
              {node.ownerType === "team" ? (
                <Users className="w-3 h-3 shrink-0" />
              ) : (
                <User className="w-3 h-3 shrink-0" />
              )}
              <span className="truncate">{node.owner}</span>
            </div>
            {isEditMode && onAssignOwner && (
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => onAssignOwner(node.id)}>
                <UserPlus className="w-3 h-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground italic">Not assigned</span>
            {isEditMode && onAssignOwner && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs bg-transparent"
                onClick={() => onAssignOwner(node.id)}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Assign
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function getAllSignals(node: SignalNode): { primary: SignalNode[]; secondary: SignalNode[]; tertiary: SignalNode[] } {
  const primary = [node]
  const secondary = node.children || []
  const tertiary = secondary.flatMap((s) => s.children || [])

  return { primary, secondary, tertiary }
}

function filterSignalTree(node: SignalNode, selected: SelectedSignals): SignalNode | null {
  if (!selected.primary.includes(node.id)) {
    return null
  }

  const filteredChildren = node.children
    ?.filter((child) => selected.secondary.includes(child.id))
    .map((child) => {
      const filteredTertiary = child.children?.filter((tertiary) => selected.tertiary.includes(tertiary.id))

      return {
        ...child,
        children: filteredTertiary,
      }
    })

  return {
    ...node,
    children: filteredChildren,
  }
}

export function SignalSystemTree() {
  const [isExpanded, setIsExpanded] = useState(true) // Set isExpanded to true by default
  const [isEditMode, setIsEditMode] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<SignalNode | null>(null)

  const [selectedSignals, setSelectedSignals] = useState<SelectedSignals>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedSignals")
      if (saved) {
        return JSON.parse(saved)
      }
    }

    const allSignals = getAllSignals(mockSignalSystem)
    return {
      primary: allSignals.primary.map((s) => s.id),
      secondary: allSignals.secondary.map((s) => s.id),
      tertiary: allSignals.tertiary.map((s) => s.id),
    }
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSignals", JSON.stringify(selectedSignals))
    }
  }, [selectedSignals])

  const toggleSignal = (level: keyof SelectedSignals, id: string) => {
    setSelectedSignals((prev) => {
      const levelSignals = prev[level]
      const isSelected = levelSignals.includes(id)

      return {
        ...prev,
        [level]: isSelected ? levelSignals.filter((s) => s !== id) : [...levelSignals, id],
      }
    })
  }

  const selectAllAtLevel = (level: keyof SelectedSignals) => {
    const allSignals = getAllSignals(mockSignalSystem)
    setSelectedSignals((prev) => ({
      ...prev,
      [level]: allSignals[level].map((s) => s.id),
    }))
  }

  const findMetricById = (node: SignalNode, id: string): SignalNode | null => {
    if (node.id === id) return node
    if (node.children) {
      for (const child of node.children) {
        const found = findMetricById(child, id)
        if (found) return found
      }
    }
    return null
  }

  const handleAssignOwner = (nodeId: string) => {
    const metric = findMetricById(mockSignalSystem, nodeId)
    if (metric) {
      setSelectedMetric(metric)
      setAssignModalOpen(true)
    }
  }

  const handleOwnerAssigned = (owner: string, email: string) => {
    // In production, this would update the signal in the database
    console.log(`Assigned ${owner} (${email}) to metric ${selectedMetric?.name}`)
    setAssignModalOpen(false)
    setSelectedMetric(null)
  }

  const filteredSystem = filterSignalTree(mockSignalSystem, selectedSignals)
  const allSignals = getAllSignals(mockSignalSystem)

  return (
    <>
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <div>
                <CardTitle>Signal System</CardTitle>
                <CardDescription>How signals connect to your primary goals</CardDescription>
              </div>
            </div>
            {isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditMode(!isEditMode)
                }}
              >
                {isEditMode ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                <span className="ml-2">{isEditMode ? "Close" : "Edit"}</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            {isEditMode && (
              <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Select Metrics to Display</h4>
                  <p className="text-xs text-muted-foreground">Choose which signals to show in your system</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {/* Primary Signals */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-blue-600">Primary Signals</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => selectAllAtLevel("primary")}
                      >
                        Select All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {allSignals.primary.map((signal) => (
                        <div key={signal.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`primary-${signal.id}`}
                            checked={selectedSignals.primary.includes(signal.id)}
                            onCheckedChange={() => toggleSignal("primary", signal.id)}
                          />
                          <Label htmlFor={`primary-${signal.id}`} className="text-sm font-normal cursor-pointer flex-1">
                            {signal.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Signals */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-purple-600">Secondary Signals</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => selectAllAtLevel("secondary")}
                      >
                        Select All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {allSignals.secondary.map((signal) => (
                        <div key={signal.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`secondary-${signal.id}`}
                            checked={selectedSignals.secondary.includes(signal.id)}
                            onCheckedChange={() => toggleSignal("secondary", signal.id)}
                          />
                          <Label
                            htmlFor={`secondary-${signal.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {signal.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tertiary Signals */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-amber-600">Tertiary Signals</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => selectAllAtLevel("tertiary")}
                      >
                        Select All
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {allSignals.tertiary.map((signal) => (
                        <div key={signal.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tertiary-${signal.id}`}
                            checked={selectedSignals.tertiary.includes(signal.id)}
                            onCheckedChange={() => toggleSignal("tertiary", signal.id)}
                          />
                          <Label
                            htmlFor={`tertiary-${signal.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {signal.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedSignals.primary.length} primary, {selectedSignals.secondary.length} secondary,{" "}
                    {selectedSignals.tertiary.length} tertiary
                  </p>
                </div>
              </div>
            )}

            {filteredSystem ? (
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max">
                  {/* Primary Signal Column */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Primary</h3>
                    <SignalNodeCard node={filteredSystem} isEditMode={isEditMode} onAssignOwner={handleAssignOwner} />
                  </div>

                  {/* Secondary Signals Column */}
                  {filteredSystem.children && filteredSystem.children.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground">Secondary</h3>
                      <div className="flex flex-col gap-4">
                        {filteredSystem.children.map((secondary) => (
                          <SignalNodeCard
                            key={secondary.id}
                            node={secondary}
                            isEditMode={isEditMode}
                            onAssignOwner={handleAssignOwner}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tertiary Signals Column */}
                  {filteredSystem.children &&
                    filteredSystem.children.some((s) => s.children && s.children.length > 0) && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">Tertiary</h3>
                        <div className="flex flex-col gap-4">
                          {filteredSystem.children
                            .flatMap((secondary) => secondary.children || [])
                            .map((tertiary) => (
                              <SignalNodeCard
                                key={tertiary.id}
                                node={tertiary}
                                isEditMode={isEditMode}
                                onAssignOwner={handleAssignOwner}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No signals selected. Please select at least one primary signal.</p>
              </div>
            )}

            {/* Legend */}
            <div className="pt-6 border-t space-y-3">
              <h4 className="text-sm font-medium">Signal Levels</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500/20 border-2 border-blue-500/50 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Primary</p>
                    <p className="text-xs text-muted-foreground">Main company goal (CEO/ELT)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-purple-500/20 border-2 border-purple-500/50 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Secondary</p>
                    <p className="text-xs text-muted-foreground">Department metrics</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500/20 border-2 border-amber-500/50 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Tertiary</p>
                    <p className="text-xs text-muted-foreground">Individual metrics</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {assignModalOpen && selectedMetric && (
        <AssignMetricModal
          metricName={selectedMetric.name}
          metricId={selectedMetric.id}
          currentOwner={selectedMetric.owner}
          onClose={() => {
            setAssignModalOpen(false)
            setSelectedMetric(null)
          }}
          onAssign={handleOwnerAssigned}
        />
      )}
    </>
  )
}
