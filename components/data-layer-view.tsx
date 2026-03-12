"use client"

import type { SubIssue } from "@/lib/issue-tree-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, RefreshCw, ExternalLink } from "lucide-react"

interface DataLayerViewProps {
  issue: SubIssue
  onClose: () => void
}

export function DataLayerView({ issue }: DataLayerViewProps) {
  return (
    <div className="space-y-6">
      {/* Data Sources */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Data Sources
        </h3>
        <div className="space-y-2">
          {issue.dataSource.length > 0 ? (
            issue.dataSource.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Badge variant="secondary" className="text-sm">
                  {source}
                </Badge>
                <Button variant="ghost" size="sm" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            ))
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">No data source connected</p>
            </div>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Last Updated
        </h3>
        <p className="text-sm text-foreground">{issue.dataSource.length > 0 ? "2 hours ago" : "Never"}</p>
      </div>

      {/* Key Data Extracts */}
      {issue.dataSource.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Key Data Extracts</h3>
          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Current Value</div>
              <div className="text-lg font-bold text-foreground">{issue.absoluteValue || issue.trendValue}</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Sample Period</div>
              <div className="text-sm text-foreground">{issue.timeframe}</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Owner</div>
              <div className="text-sm text-foreground">{issue.owner || "Unassigned"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Raw Data Link */}
      {issue.dataSource.length > 0 && (
        <div>
          <Button variant="outline" className="w-full bg-transparent">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Raw Data
          </Button>
        </div>
      )}
    </div>
  )
}
