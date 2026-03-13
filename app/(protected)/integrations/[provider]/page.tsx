"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, Unplug, CheckCircle2, XCircle, Clock } from "lucide-react"
import {
  INTEGRATION_PROVIDERS,
  getIntegration,
  getSyncHistory,
  disconnectIntegration,
  triggerSync,
  type Integration,
  type SyncHistory,
} from "@/lib/integrations-service"
import Link from "next/link"

export default function IntegrationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const provider = params.provider as string

  const [integration, setIntegration] = useState<Integration | null>(null)
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const providerInfo = INTEGRATION_PROVIDERS.find((p) => p.id === provider)

  useEffect(() => {
    loadIntegration()
  }, [provider])

  async function loadIntegration() {
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const data = await getIntegration(user.id, provider)
      setIntegration(data)

      if (data) {
        const history = await getSyncHistory(data.id)
        setSyncHistory(history)
      }
    } catch (error) {
      console.error("[v0] Failed to load integration:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    if (!integration) return

    setSyncing(true)
    try {
      await triggerSync(integration.id)
      await loadIntegration() // Reload to get updated sync history
    } catch (error) {
      console.error("[v0] Sync failed:", error)
      alert("Failed to sync data. Please try again.")
    } finally {
      setSyncing(false)
    }
  }

  async function handleDisconnect() {
    if (!integration || !confirm("Are you sure you want to disconnect this integration?")) return

    try {
      await disconnectIntegration(integration.id)
      router.push("/integrations")
    } catch (error) {
      console.error("[v0] Failed to disconnect:", error)
      alert("Failed to disconnect integration")
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!providerInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Integration not found</p>
        <Link href="/integrations">
          <Button variant="outline" className="mt-4 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Integrations
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Link href="/integrations">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Integrations
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Integration Info */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{providerInfo.icon}</div>
              <div>
                <h1 className="text-2xl font-bold">{providerInfo.name}</h1>
                <p className="text-muted-foreground">{providerInfo.description}</p>
              </div>
            </div>
            <Badge variant={integration?.status === "active" ? "default" : "secondary"}>
              {integration?.status || "Not Connected"}
            </Badge>
          </div>

          {integration && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Metrics</h3>
                <div className="flex flex-wrap gap-2">
                  {providerInfo.metrics.map((metric) => (
                    <Badge key={metric} variant="outline">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSync} disabled={syncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync Now"}
                </Button>
                <Button variant="destructive" onClick={handleDisconnect}>
                  <Unplug className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}

          {!integration && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">This integration is not connected</p>
              <Button onClick={() => router.push("/integrations")}>Go to Integrations</Button>
            </div>
          )}
        </Card>

        {/* Sync History */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Recent Syncs</h2>
          <div className="space-y-3">
            {syncHistory.length > 0 ? (
              syncHistory.map((sync) => (
                <div key={sync.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="mt-1">
                    {sync.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {sync.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                    {sync.status === "in_progress" && <Clock className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {sync.status === "success" && "Sync completed"}
                      {sync.status === "failed" && "Sync failed"}
                      {sync.status === "in_progress" && "Syncing..."}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(sync.started_at).toLocaleString()}</div>
                    {sync.status === "success" && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {sync.records_synced} records • {sync.signals_created} signals created
                      </div>
                    )}
                    {sync.error_message && <div className="text-xs text-red-500 mt-1">{sync.error_message}</div>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No sync history yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
