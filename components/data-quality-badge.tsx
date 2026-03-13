"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, AlertCircle, XCircle, HelpCircle } from "lucide-react"
import type { DataQualityScore } from "@/lib/user-context-service"

interface DataQualityBadgeProps {
  quality?: DataQualityScore
  showDetails?: boolean
}

export function DataQualityBadge({ quality, showDetails = true }: DataQualityBadgeProps) {
  if (!quality) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1">
              <HelpCircle className="h-3 w-3" />
              No Data
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>No data quality information available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const getQualityIcon = () => {
    switch (quality.qualityTier) {
      case "excellent":
      case "good":
        return <CheckCircle2 className="h-3 w-3" />
      case "fair":
        return <AlertCircle className="h-3 w-3" />
      case "poor":
      case "insufficient":
        return <XCircle className="h-3 w-3" />
    }
  }

  const getQualityVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (quality.qualityTier) {
      case "excellent":
      case "good":
        return "default"
      case "fair":
        return "secondary"
      case "poor":
      case "insufficient":
        return "destructive"
    }
  }

  const getQualityLabel = () => {
    switch (quality.qualityTier) {
      case "excellent":
        return "Excellent Data"
      case "good":
        return "Good Data"
      case "fair":
        return "Fair Data"
      case "poor":
        return "Poor Data"
      case "insufficient":
        return "Insufficient Data"
    }
  }

  if (!showDetails) {
    return (
      <Badge variant={getQualityVariant()} className="gap-1">
        {getQualityIcon()}
        {getQualityLabel()}
      </Badge>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getQualityVariant()} className="gap-1 cursor-help">
            {getQualityIcon()}
            {getQualityLabel()} ({Math.round(quality.overallQualityScore)}%)
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-64">
          <div className="space-y-2">
            <p className="font-semibold">Data Quality Breakdown</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Completeness:</span>
                <span className="font-medium">{Math.round(quality.completenessScore)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Freshness:</span>
                <span className="font-medium">{Math.round(quality.freshnessScore)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Consistency:</span>
                <span className="font-medium">{Math.round(quality.consistencyScore)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Reliability:</span>
                <span className="font-medium">{Math.round(quality.reliabilityScore)}%</span>
              </div>
            </div>
            <div className="pt-2 mt-2 border-t text-xs">
              <p className="font-medium mb-1">Data Points: {quality.dataPointCount}</p>
              {quality.lastUpdateDate && (
                <p className="text-muted-foreground">Last updated: {quality.lastUpdateDate}</p>
              )}
            </div>
            {quality.improvementSuggestions.length > 0 && (
              <div className="pt-2 mt-2 border-t text-xs">
                <p className="font-medium mb-1">Suggestions:</p>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  {quality.improvementSuggestions.slice(0, 2).map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
