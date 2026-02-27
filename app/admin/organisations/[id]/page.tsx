import { Suspense } from "react"
import OrganizationDetailsClient from "@/components/admin/organization-details-client"

export default async function OrganizationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={<div>Loading organization...</div>}>
      <OrganizationDetailsClient orgId={id} />
    </Suspense>
  )
}
