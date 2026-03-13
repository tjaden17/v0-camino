"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, GitBranch, RefreshCw, TrendingUp, TrendingDown, Minus, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Relationship {
  signalAId: string
  signalBId: string
  signalAName: string
  signalBName: string
  relationshipType: string
  direction: string
  correlationCoefficient: number
  confidenceScore: number
  timeLagDays: number
  sampleSize: number
}

interface CausalChain {
  chainName: string
  chainDescription: string
  signalSequence: string[]
  totalConfidence: number
  totalLagDays: number
  chainStrength: string
  businessImpact: string
}

export function RelationshipGraph() {
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [causalChains, setCausalChains] = useState<CausalChain[]>([])
  const [loading, setLoading] = useState(true)
  const [detecting, setDetecting] = useState(false)
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null)

  useEffect(() => {
    fetchRelationships()
  }, [])

  const fetchRelationships = async () => {
    try {
      const res = await fetch("/api/relationships")
      if (res.ok) {
        const data = await res.json()
        setRelationships(data.relationships || [])
        setCausalChains(data.causalChains || [])
      }
    } catch (error) {
      console.error("Error fetching relationships:", error)
    } finally {
      setLoading(false)
    }
  }

  const detectRelationships = async () => {
    setDetecting(true)
    try {
      const res = await fetch("/api/relationships", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setRelationships(data.relationships || [])
        setCausalChains(data.causalChains || [])
      }
    } catch (error) {
      console.error("Error detecting relationships:", error)
    } finally {
      setDetecting(false)
    }
  }

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case "causes":
      case "leads_to":
        return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
      case "inversely_correlates":
      case "dampens":
        return "bg-red-500/20 text-red-700 border-red-500/30"
      case "correlates":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      case "impacts":
      case "amplifies":
        return "bg-amber-500/20 text-amber-700 border-amber-500/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getCorrelationIcon = (correlation: number) => {
    if (correlation > 0.3) return <TrendingUp className="h-4 w-4 text-emerald-600" />
    if (correlation < -0.3) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getStrengthBadge = (confidence: number) => {
    if (confidence > 0.7) return <Badge variant="default" className="bg-emerald-600">Strong</Badge>
    if (confidence > 0.5) return <Badge variant="secondary">Moderate</Badge>
    return <Badge variant="outline">Weak</Badge>
  }

  const formatRelationshipType = (type: string) => {
    return type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Relationships Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Signal Relationships
              </CardTitle>
              <CardDescription>
                Detected correlations and causal relationships between your signals
              </CardDescription>
            </div>
            <Button
              onClick={detectRelationships}
              disabled={detecting}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${detecting ? "animate-spin" : ""}`} />
              {detecting ? "Analyzing..." : "Detect Relationships"}
            </Button>
          </CardHeader>
          <CardContent>
            {relationships.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-base font-medium">No relationships detected yet</p>
                <p className="text-sm mt-1">
                  Upload data with time series to detect correlations between signals
                </p>
                <Button onClick={detectRelationships} className="mt-4" disabled={detecting}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${detecting ? "animate-spin" : ""}`} />
                  Run Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {relationships.slice(0, 10).map((rel, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRelationship(selectedRelationship?.signalAId === rel.signalAId && selectedRelationship?.signalBId === rel.signalBId ? null : rel)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate max-w-[150px]" title={rel.signalAName}>
                          {rel.signalAName}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate max-w-[150px]" title={rel.signalBName}>
                          {rel.signalBName}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getRelationshipColor(rel.relationshipType)}>
                        {formatRelationshipType(rel.relationshipType)}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        {getCorrelationIcon(rel.correlationCoefficient)}
                        <span className="text-sm font-mono">
                          {(rel.correlationCoefficient * 100).toFixed(0)}%
                        </span>
                      </div>

                      {rel.timeLagDays > 0 && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="secondary" className="text-xs">
                              {rel.timeLagDays}d lag
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{rel.signalAName} leads {rel.signalBName} by {rel.timeLagDays} days</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {getStrengthBadge(rel.confidenceScore)}
                    </div>
                  </div>
                ))}

                {relationships.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    +{relationships.length - 10} more relationships
                  </p>
                )}
              </div>
            )}

            {/* Selected Relationship Details */}
            {selectedRelationship && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">
                      {selectedRelationship.signalAName} → {selectedRelationship.signalBName}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatRelationshipType(selectedRelationship.relationshipType)} relationship
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRelationship(null)}>
                    Close
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Correlation</p>
                    <p className="text-lg font-semibold">
                      {(selectedRelationship.correlationCoefficient * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-lg font-semibold">
                      {(selectedRelationship.confidenceScore * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time Lag</p>
                    <p className="text-lg font-semibold">
                      {selectedRelationship.timeLagDays} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sample Size</p>
                    <p className="text-lg font-semibold">
                      {selectedRelationship.sampleSize} points
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Causal Chains Card */}
        {causalChains.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Causal Chains
              </CardTitle>
              <CardDescription>
                Multi-step cause-and-effect relationships detected in your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {causalChains.map((chain, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{chain.chainName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {chain.chainDescription}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          chain.chainStrength === "very_strong" ? "default" :
                          chain.chainStrength === "strong" ? "secondary" : "outline"
                        }
                      >
                        {chain.chainStrength.replace("_", " ")}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Confidence: {(chain.totalConfidence * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>Total Lag: {chain.totalLagDays} days</span>
                      </div>
                    </div>

                    {chain.businessImpact && (
                      <div className="mt-3 p-3 rounded bg-muted/50 text-sm flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>{chain.businessImpact}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
