"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, TrendingDown, CheckCircle2 } from "lucide-react"
import type { SignalTemplate } from "@/lib/signal-templates"

interface SignalPreviewModalProps {
  signal: SignalTemplate
  signalName: string
  onClose: () => void
  onAddToDashboard: () => void
}

export function SignalPreviewModal({ signal, signalName, onClose, onAddToDashboard }: SignalPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg mt-20 mb-8">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Preview Signal</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Signal Configured Successfully!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Here's how "{signalName}" will appear in your dashboard
            </p>
          </div>

          {/* Preview Card */}
          <Card className="p-4 border-2 border-primary/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="mb-2 text-xs capitalize">
                  {signal.team}
                </Badge>
                <h3 className="font-semibold text-sm mb-1">{signalName}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{signal.description}</p>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold">42%</span>
              <div className="flex items-center gap-1 text-red-500">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">-8%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Last 30 days</span>
              <Badge variant="outline" className="text-xs">
                {signal.dataSource}
              </Badge>
            </div>
          </Card>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is a preview with sample data. Once added to your dashboard, it will show real data from your{" "}
              {signal.dataSource} account.
            </p>
          </div>

          <Button onClick={onAddToDashboard} className="w-full" size="lg">
            Add to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
