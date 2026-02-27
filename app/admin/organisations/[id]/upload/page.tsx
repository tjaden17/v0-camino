import { Suspense } from "react"
import OrgUploadClient from "@/components/admin/org-upload-client"

export default async function OrgUploadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={<div>Loading upload...</div>}>
      <OrgUploadClient orgId={id} />
    </Suspense>
  )
}
