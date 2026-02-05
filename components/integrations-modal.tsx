"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, BarChart3, Database, Users, Zap } from "lucide-react"

interface Integration {
  id: string
  name: string
  status: "connected" | "disconnected"
  type: string
}

interface IntegrationsModalProps {
  integrations: Integration[]
  onUpdate: (integrations: Integration[]) => void
  onClose: () => void
}

const availableIntegrations = [
  { id: "amplitude", name: "Amplitude", type: "analytics", icon: BarChart3, description: "Product analytics platform" },
  { id: "mixpanel", name: "Mixpanel", type: "analytics", icon: BarChart3, description: "User behavior analytics" },
  { id: "dovetail", name: "Dovetail", type: "research", icon: Users, description: "User research platform" },
  { id: "segment", name: "Segment", type: "data", icon: Database, description: "Customer data platform" },
  { id: "hotjar", name: "Hotjar", type: "analytics", icon: Zap, description: "User behavior insights" },
]

export function IntegrationsModal({ integrations, onUpdate, onClose }: IntegrationsModalProps) {
  const [currentIntegrations, setCurrentIntegrations] = useState(integrations)

  const toggleIntegration = (integrationId: string) => {
    setCurrentIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? {
              ...integration,
              status: integration.status === "connected" ? "disconnected" : "connected",
            }
          : integration,
      ),
    )
  }

  const addIntegration = (newIntegration: (typeof availableIntegrations)[0]) => {
    const exists = currentIntegrations.find((i) => i.id === newIntegration.id)
    if (!exists) {
      setCurrentIntegrations((prev) => [
        ...prev,
        {
          id: newIntegration.id,
          name: newIntegration.name,
          status: "disconnected",
          type: newIntegration.type,
        },
      ])
    }
  }

  const handleSave = () => {
    onUpdate(currentIntegrations)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Manage Integrations</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Integrations */}
          <div className="space-y-3">
            <h3 className="font-medium">Your Integrations</h3>
            {currentIntegrations.map((integration) => {
              const config = availableIntegrations.find((a) => a.id === integration.id)
              const Icon = config?.icon || Database
              return (
                <div key={integration.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{config?.description}</p>
                  </div>
                  <Button
                    variant={integration.status === "connected" ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleIntegration(integration.id)}
                  >
                    {integration.status === "connected" ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Available Integrations */}
          <div className="space-y-3">
            <h3 className="font-medium">Available Integrations</h3>
            {availableIntegrations
              .filter((available) => !currentIntegrations.find((current) => current.id === available.id))
              .map((integration) => {
                const Icon = integration.icon
                return (
                  <div key={integration.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => addIntegration(integration)}>
                      Add
                    </Button>
                  </div>
                )
              })}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
