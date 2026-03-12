import { Suspense } from "react"
import OrganizationDetailsClient from "@/components/admin/organization-details-client"

export default function OrganizationDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading organization...</div>}>
      <OrganizationDetailsClient orgId={params.id} />
    </Suspense>
  )
}
