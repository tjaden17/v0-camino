"use client"

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbNavProps {
  path: string[]
  currentIssue: string
  onNavigate?: (index: number) => void
}

export function BreadcrumbNav({ path, currentIssue, onNavigate }: BreadcrumbNavProps) {
  const reversedPath = [...path].reverse()

  return (
    <nav className="flex items-center gap-1 overflow-x-auto py-2 px-1">
      {reversedPath.map((item, index) => (
        <div key={index} className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onNavigate?.(path.length - 1 - index)}
            className={cn(
              "text-sm px-2 py-1 rounded hover:bg-muted transition-colors",
              index === reversedPath.length - 1 ? "text-foreground font-medium" : "text-muted-foreground",
            )}
          >
            {item}
          </button>
          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
        </div>
      ))}
      <span className="text-sm px-2 py-1 text-primary font-semibold">{currentIssue}</span>
    </nav>
  )
}
