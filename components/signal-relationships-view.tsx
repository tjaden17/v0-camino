"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, TrendingDown, AlertCircle, GitBranch, ChevronRight } from "lucide-react"
import type { SignalRelationship, RelationshipChain } from "@/lib/signal-relationships-service"
import Link from "next/link"

interface SignalRelationshipsViewProps {
  relationships: SignalRelationship[]
  chains?: RelationshipChain[]
}

export function SignalRelationshipsView({ relationships, chains = [] }: SignalRelationshipsViewProps) {
  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case "causes":
      case "leads_to":
        return <ArrowRight className="h-4 w-4 text-blue-600" />
      case "impacts":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "affected_by":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <GitBranch className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return (
        <Badge variant="default" className="bg-green-600">
          High Confidence
        </Badge>
      )
    }
    if (confidence >= 0.6) {
      return <Badge variant="secondary">Medium Confidence</Badge>
    }
    return <Badge variant="outline">Low Confidence</Badge>
  }

  if (relationships.length === 0 && chains.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Relationships Detected</h3>
          <p className="text-muted-foreground mb-4">
            Add more data points to enable relationship detection between signals
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {chains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Signal Chains</CardTitle>
            <CardDescription>Sequences of connected signals showing cascading effects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chains.slice(0, 5).map((chain, i) => (
                <div key={i} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">Chain {i + 1}</Badge>
                    {getConfidenceBadge(chain.totalConfidence)}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {chain.signals.map((signal, j) => (
                      <div key={signal.id} className="flex items-center gap-2">
                        <Link
                          href={`/signals/${signal.id}`}
                          className="flex-shrink-0 px-3 py-2 bg-background border rounded-lg hover:shadow-md transition-all"
                        >
                          <p className="font-medium text-sm">{signal.name}</p>
                          {signal.value && (
                            <p className="text-xs text-muted-foreground">
                              {signal.value.toLocaleString()}
                              {signal.change && (
                                <span className={signal.change > 0 ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                                  {signal.change > 0 && "+"}
                                  {signal.change}%
                                </span>
                              )}
                            </p>
                          )}
                        </Link>
                        {j < chain.signals.length - 1 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getRelationshipIcon(chain.relationships[j].type)}
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Direct Relationships</CardTitle>
          <CardDescription>Detected correlations and causal relationships between signals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relationships.map((rel) => (
              <div key={rel.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/signals/${rel.signalAId}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {rel.signalAName}
                    </Link>
                    <div className="flex items-center gap-1">
                      {getRelationshipIcon(rel.relationshipType)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {rel.relationshipType.replace("_", " ")}
                      </span>
                    </div>
                    <Link
                      href={`/signals/${rel.signalBId}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {rel.signalBName}
                    </Link>
                  </div>
                  {rel.timeLagDays && rel.timeLagDays > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {rel.timeLagDays}d lag
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getConfidenceBadge(rel.confidenceScore)}
                  <Badge variant="outline" className="text-xs capitalize">
                    {rel.evidenceType}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
