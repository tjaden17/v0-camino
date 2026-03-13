import { Suspense } from "react"
import OrganizationsClient from "@/components/admin/organizations-client"

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<div>Loading organizations...</div>}>
      <OrganizationsClient />
    </Suspense>
  )
}
