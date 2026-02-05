"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Database } from "lucide-react"
import { DatasetConnectionFlowModal } from "@/components/dataset-connection-flow-modal"
import { SelectDatasetModal } from "@/components/select-dataset-modal"
import { topDatasets } from "@/lib/all-datasets"

interface Integration {
  id: string
  name: string
  description: string
  connected: boolean
}

export function DataIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>(
    topDatasets.map((ds) => ({
      id: ds.id,
      name: ds.name,
      description: ds.description,
      connected: false,
    })),
  )

  const [showConnectionFlow, setShowConnectionFlow] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState<{ id: string; name: string } | null>(null)
  const [showSelectDataset, setShowSelectDataset] = useState(false)

  const handleConnect = (dataset: { id: string; name: string }) => {
    setSelectedDataset(dataset)
    setShowConnectionFlow(true)
    setShowSelectDataset(false)
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(integrations.map((int) => (int.id === integrationId ? { ...int, connected: false } : int)))
  }

  const handleConnectionComplete = () => {
    if (selectedDataset) {
      setIntegrations(integrations.map((int) => (int.id === selectedDataset.id ? { ...int, connected: true } : int)))
    }
  }

  const handleCloseFlow = () => {
    setShowConnectionFlow(false)
    setSelectedDataset(null)
  }

  return (
    <div className="space-y-3">
      {integrations.map((integration) => (
        <Card key={integration.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-medium">{integration.name}</p>
                  {integration.connected && (
                    <Badge variant="default" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            </div>
            <Button
              variant={integration.connected ? "outline" : "default"}
              size="sm"
              onClick={() =>
                integration.connected
                  ? handleDisconnect(integration.id)
                  : handleConnect({ id: integration.id, name: integration.name })
              }
            >
              {integration.connected ? "Disconnect" : "Connect"}
            </Button>
          </div>
        </Card>
      ))}

      <Button onClick={() => setShowSelectDataset(true)} variant="outline" className="w-full">
        <Database className="h-4 w-4 mr-2" />
        Connect Other
      </Button>

      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Connect your data sources to automatically pull signals into Camino. Once connected, you can choose which
          signals to display on your dashboard.
        </p>
      </div>

      {showConnectionFlow && selectedDataset && (
        <DatasetConnectionFlowModal
          dataset={selectedDataset}
          onClose={handleCloseFlow}
          onComplete={handleConnectionComplete}
        />
      )}

      {showSelectDataset && <SelectDatasetModal onClose={() => setShowSelectDataset(false)} onSelect={handleConnect} />}
    </div>
  )
}
