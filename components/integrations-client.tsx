"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ExternalLink } from "lucide-react"
import { INTEGRATION_PROVIDERS, getUserIntegrations, type Integration } from "@/lib/integrations-service"
import Link from "next/link"
import { ConnectionWizardDialog } from "@/components/connection-wizard-dialog"

export default function IntegrationsClient() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")
  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<(typeof INTEGRATION_PROVIDERS)[0] | null>(null)

  useEffect(() => {
    loadIntegrations()
  }, [])

  async function loadIntegrations() {
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setUserId(user.id)
      const data = await getUserIntegrations(user.id)
      setIntegrations(data)
    } catch (error) {
      console.error("Failed to load integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  function getIntegrationStatus(providerId: string) {
    const integration = integrations.find((i) => i.provider === providerId)
    return integration?.status || "disconnected"
  }

  function isConnected(providerId: string) {
    return getIntegrationStatus(providerId) === "active"
  }

  function handleConnect(providerId: string) {
    const provider = INTEGRATION_PROVIDERS.find((p) => p.id === providerId)
    if (provider) {
      setSelectedProvider(provider)
      setWizardOpen(true)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading integrations...</div>
  }

  return (
    <div className="space-y-8">
      {/* Connected Integrations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Connected Integrations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.filter((i) => i.status === "active").length > 0 ? (
            integrations
              .filter((i) => i.status === "active")
              .map((integration) => {
                const provider = INTEGRATION_PROVIDERS.find((p) => p.id === integration.provider)
                if (!provider) return null

                return (
                  <Card key={integration.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{provider.icon}</div>
                        <div>
                          <h3 className="font-semibold">{provider.name}</h3>
                          <Badge variant="default" className="mt-1">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{provider.description}</p>

                    <Link href={`/integrations/${provider.id}`}>
                      <Button variant="outline" className="w-full bg-transparent">
                        Manage Integration
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </Card>
                )
              })
          ) : (
            <Card className="p-6 col-span-full">
              <p className="text-muted-foreground text-center">
                No integrations connected yet. Connect your first integration below.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INTEGRATION_PROVIDERS.map((provider) => {
            const connected = isConnected(provider.id)
            const status = getIntegrationStatus(provider.id)

            if (connected) return null

            return (
              <Card key={provider.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{provider.icon}</div>
                    <div>
                      <h3 className="font-semibold">{provider.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {provider.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{provider.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-medium mb-2">Syncs these metrics:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.metrics.map((metric) => (
                      <Badge key={metric} variant="outline" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={() => handleConnect(provider.id)} disabled={status === "expired"}>
                  {status === "expired" ? "Reconnect" : "Connect"}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Connection Wizard Dialog */}
      <ConnectionWizardDialog
        provider={selectedProvider}
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false)
          setSelectedProvider(null)
        }}
      />
    </div>
  )
}
