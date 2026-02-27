"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { getOrganizationDetails } from "@/lib/admin-org-service"
import { UploadProtoClient } from "@/components/upload-proto-client"

export default function OrgUploadClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrgData()
  }, [orgId])

  const loadOrgData = async () => {
    try {
      const orgData = await getOrganizationDetails(orgId)
      setOrg(orgData)
    } catch (error) {
      console.error("Error loading org data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading organization...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/organisations/${orgId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upload Data for {org?.name}</h1>
          <p className="text-muted-foreground">Upload CSV files from Zoho CRM, Zoho Desk, or other sources. Use a pre-built template or Custom / Other.</p>
        </div>
      </div>

      {/* 3-question upload flow with pre-built templates; signals are created for this org */}
      <UploadProtoClient organizationId={orgId} />
    </div>
  )
}
