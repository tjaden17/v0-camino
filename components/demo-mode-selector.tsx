"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"
import { enableDemoMode, type MockIntegration } from "@/lib/demo-mode-service"
import { mockIntegrationData } from "@/lib/mock-data"

interface DemoModeSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export function DemoModeSelector({ open, onOpenChange, onComplete }: DemoModeSelectorProps) {
  const [selectedIntegrations, setSelectedIntegrations] = useState<MockIntegration[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const integrationOptions: { id: MockIntegration; name: string; description: string }[] = [
    {
      id: "zoho-crm",
      name: "Zoho CRM",
      description: "Sales pipeline, deals, revenue metrics, and lead conversion data",
    },
    {
      id: "zoho-desk",
      name: "Zoho Desk",
      description: "Support tickets, response times, customer satisfaction, and resolution rates",
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Marketing metrics, website visitors, leads, and email campaign performance",
    },
  ]

  const handleToggleIntegration = (integrationId: MockIntegration) => {
    setSelectedIntegrations((prev) =>
      prev.includes(integrationId) ? prev.filter((id) => id !== integrationId) : [...prev, integrationId],
    )
  }

  const handleEnableDemoMode = async () => {
    if (selectedIntegrations.length === 0) return

    setIsLoading(true)
    try {
      const result = await enableDemoMode(selectedIntegrations)
      if (result.success) {
        onComplete()
        onOpenChange(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalMetrics = () => {
    return selectedIntegrations.reduce((total, integration) => {
      return total + mockIntegrationData[integration].metrics.length
    }, 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <DialogTitle>Enable Demo Mode</DialogTitle>
          </div>
          <DialogDescription>
            Select which integrations you'd like to explore with realistic mock data. This will populate your signals
            dashboard with sample metrics so you can see how Camino works.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 py-4">
            {integrationOptions.map((integration) => (
              <div
                key={integration.id}
                className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleToggleIntegration(integration.id)}
              >
                <Checkbox
                  id={integration.id}
                  checked={selectedIntegrations.includes(integration.id)}
                  onCheckedChange={() => handleToggleIntegration(integration.id)}
                />
                <div className="flex-1 space-y-1">
                  <Label htmlFor={integration.id} className="text-sm font-medium leading-none cursor-pointer">
                    {integration.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {mockIntegrationData[integration.id].metrics.length} metrics included
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedIntegrations.length > 0 && (
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 mb-4">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                You'll get <strong>{getTotalMetrics()} signals</strong> with 5 weeks of historical data each
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleEnableDemoMode} disabled={selectedIntegrations.length === 0 || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Demo Data...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Enable Demo Mode
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
