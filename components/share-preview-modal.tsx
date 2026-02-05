"use client"

import { Button } from "@/components/ui/button"
import { X, Mail } from "lucide-react"
import { InsightCard } from "@/components/insight-card"
import type { Insight } from "@/lib/types"

interface SharePreviewModalProps {
  insights: Insight[]
  recipients: string[]
  shareType: "individual" | "team" | "organization"
  onClose: () => void
  onConfirm: () => void
}

export function SharePreviewModal({ insights, recipients, shareType, onClose, onConfirm }: SharePreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-background border border-border rounded-lg shadow-lg my-8">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Email Preview</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          {/* Email Header */}
          <div className="bg-muted/30 p-4 rounded-md mb-4 border border-border">
            <div className="flex items-start gap-3 mb-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">
                  To: {shareType === "organization" ? "All members" : recipients.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Subject: Shared Insights from Camino - {insights.length} signal
                  {insights.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="pl-8">
              <p className="text-sm mb-2">Hi,</p>
              <p className="text-sm mb-2">
                I wanted to share {insights.length} signal{insights.length !== 1 ? "s" : ""} with you from Camino:
              </p>
            </div>
          </div>

          {/* Signal Cards Preview */}
          <div className="space-y-3 mb-4 max-h-[50vh] overflow-y-auto">
            {insights.map((insight) => (
              <div key={insight.id} className="border border-border rounded-lg overflow-hidden">
                <InsightCard
                  insight={insight}
                  isSaved={false}
                  onSave={() => {}}
                  onShare={() => {}}
                  onExpand={() => {}}
                />
              </div>
            ))}
          </div>

          {/* Email Footer */}
          <div className="bg-muted/30 p-4 rounded-md border border-border">
            <p className="text-sm text-muted-foreground">View all signals in Camino: [Link to Dashboard]</p>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onConfirm}>
            Send Email
          </Button>
        </div>
      </div>
    </div>
  )
}
