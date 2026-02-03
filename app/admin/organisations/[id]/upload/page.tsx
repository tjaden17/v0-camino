import { Suspense } from "react"
import OrgUploadClient from "@/components/admin/org-upload-client"

export default function OrgUploadPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading upload...</div>}>
      <OrgUploadClient orgId={params.id} />
    </Suspense>
  )
}
