import { Suspense } from 'react'
import { IntegrationsPageClient } from '@/components/admin/integrations-page-client'

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your Zoho Desk and CRM accounts to automatically sync signals and data
        </p>
      </div>

      <Suspense fallback={<div>Loading integrations...</div>}>
        <IntegrationsPageClient />
      </Suspense>
    </div>
  )
}
