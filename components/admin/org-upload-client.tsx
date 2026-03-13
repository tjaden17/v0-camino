"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { getOrganizationDetails } from "@/lib/admin-org-service"
import { UploadModal } from "@/components/upload-modal"

export default function OrgUploadClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

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

  const handleUploadComplete = () => {
    setUploadModalOpen(false)
    // Optionally show success message
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
          <p className="text-muted-foreground">Upload CSV files from Zoho CRM, Zoho Desk, or other sources</p>
        </div>
      </div>

      {/* Upload Info Card */}
      <div className="border rounded-lg p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Upload Organization Data</h2>
            <p className="text-muted-foreground mb-4">
              Upload CSV files containing metrics and KPIs for {org?.name}. The system will automatically:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Parse and validate your data</li>
              <li>Generate signals based on patterns and trends</li>
              <li>Link signals to user KPIs</li>
              <li>Make data available to organization members</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button size="lg" onClick={() => setUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Choose Files to Upload
          </Button>
        </div>
      </div>

      {/* Upload History - Optional future enhancement */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold mb-2">Recent Uploads</h3>
        <p className="text-sm text-muted-foreground">Upload history will appear here</p>
      </div>

      {/* Upload Modal */}
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={handleUploadComplete}
        isMasterAdmin={true}
        preselectedOrgId={orgId}
        availableOrgs={[{ id: orgId, name: org?.name || "" }]}
      />
    </div>
  )
}
