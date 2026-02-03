"use client"

import { Database, BarChart3, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

interface LayerIndicatorProps {
  currentLayer: "data" | "analysis" | "synthesis"
}

export function LayerIndicator({ currentLayer }: LayerIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <div
        className={cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
          currentLayer === "data" ? "bg-primary/20 border-2 border-primary" : "bg-muted/50 border border-border",
        )}
      >
        <Database className={cn("h-4 w-4", currentLayer === "data" ? "text-primary" : "text-muted-foreground")} />
        <span className={cn("text-xs font-medium", currentLayer === "data" ? "text-primary" : "text-muted-foreground")}>
          Data
        </span>
      </div>
      <div className="h-px w-4 bg-border" />
      <div
        className={cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
          currentLayer === "analysis" ? "bg-accent/20 border-2 border-accent" : "bg-muted/50 border border-border",
        )}
      >
        <BarChart3 className={cn("h-4 w-4", currentLayer === "analysis" ? "text-accent" : "text-muted-foreground")} />
        <span
          className={cn("text-xs font-medium", currentLayer === "analysis" ? "text-accent" : "text-muted-foreground")}
        >
          Analysis
        </span>
      </div>
      <div className="h-px w-4 bg-border" />
      <div
        className={cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
          currentLayer === "synthesis" ? "bg-primary/20 border-2 border-primary" : "bg-muted/50 border border-border",
        )}
      >
        <Layers className={cn("h-4 w-4", currentLayer === "synthesis" ? "text-primary" : "text-muted-foreground")} />
        <span
          className={cn("text-xs font-medium", currentLayer === "synthesis" ? "text-primary" : "text-muted-foreground")}
        >
          Synthesis
        </span>
      </div>
    </div>
  )
}
