import { Suspense } from "react"
import IntegrationsClient from "@/components/integrations-client"

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrations</h1>
        <p className="text-muted-foreground">Connect your business tools to automatically sync data into Camino</p>
      </div>

      <Suspense fallback={<div>Loading integrations...</div>}>
        <IntegrationsClient />
      </Suspense>
    </div>
  )
}
