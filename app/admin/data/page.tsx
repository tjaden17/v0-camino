"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllUploads, deleteUpload, deleteSignalsFromUpload } from "@/lib/admin-service"
import { Upload, Trash2, AlertTriangle, Database, LinkIcon, Calendar } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"

export default function AdminDataPage() {
  const [uploads, setUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUpload, setSelectedUpload] = useState<any>(null)
  const [deleteSignalsToo, setDeleteSignalsToo] = useState(false)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [isMasterAdmin, setIsMasterAdmin] = useState(false)
  const { toast } = useToast()

  const loadUploads = async () => {
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const masterAdmin = user.email === "admin@admin.com"
      setIsMasterAdmin(masterAdmin)

      let orgId = null
      if (!masterAdmin) {
        const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

        orgId = profile?.organization_id || null
        setOrganizationId(orgId)
      }

      const data = await getAllUploads(orgId, masterAdmin)
      setUploads(data)
    } catch (error) {
      console.error("Error loading uploads:", error)
      toast({
        title: "Error",
        description: "Failed to load uploads",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUploads()
  }, [])

  async function handleDeleteUpload() {
    if (!selectedUpload) return

    try {
      if (deleteSignalsToo) {
        await deleteSignalsFromUpload(selectedUpload.id)
      }
      await deleteUpload(selectedUpload.id, organizationId, isMasterAdmin)

      toast({
        title: "Success",
        description: deleteSignalsToo
          ? "Upload and associated signals deleted successfully"
          : "Upload record deleted successfully",
      })

      setDeleteDialogOpen(false)
      setSelectedUpload(null)
      setDeleteSignalsToo(false)
      loadUploads()
    } catch (error) {
      console.error("Error deleting upload:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete upload",
        variant: "destructive",
      })
    }
  }

  const totalRows = uploads.reduce((sum, upload) => sum + (upload.rows_imported || 0), 0)
  const completedUploads = uploads.filter((u) => u.status === "completed").length
  const failedUploads = uploads.filter((u) => u.status === "failed").length

  if (loading) {
    return <div className="text-center py-12">Loading data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Management</h1>
          <p className="text-muted-foreground mt-1">Manage data uploads, integrations, and history</p>
        </div>
        <Link href="/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Data
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Uploads</p>
              <p className="text-2xl font-bold">{uploads.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Upload className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedUploads}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Rows</p>
              <p className="text-2xl font-bold">{totalRows.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for Uploads, Integrations, History */}
      <Tabs defaultValue="uploads" className="w-full">
        <TabsList>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads" className="space-y-4">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-sm">Filename</th>
                    <th className="text-left p-4 font-medium text-sm">User</th>
                    <th className="text-left p-4 font-medium text-sm">Status</th>
                    <th className="text-left p-4 font-medium text-sm">Rows Imported</th>
                    <th className="text-left p-4 font-medium text-sm">Date</th>
                    <th className="text-left p-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No uploads yet. Upload your first data file to get started.
                      </td>
                    </tr>
                  ) : (
                    uploads.map((upload) => (
                      <tr key={upload.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-4 text-sm font-medium">{upload.filename}</td>
                        <td className="p-4 text-sm">{upload.user_email}</td>
                        <td className="p-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              upload.status === "completed"
                                ? "bg-green-500/10 text-green-500"
                                : upload.status === "failed"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                            }`}
                          >
                            {upload.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{upload.rows_imported?.toLocaleString() || "-"}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(upload.created_at).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedUpload(upload)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card className="p-8">
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg inline-block">
                <LinkIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Integrations Coming Soon</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect to Zoho Desk, HubSpot, and other platforms to automatically sync data.
                </p>
              </div>
              <Button variant="outline" disabled>
                View Available Integrations
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Upload History</h3>
              <div className="space-y-3">
                {uploads
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 10)
                  .map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            upload.status === "completed"
                              ? "bg-green-500"
                              : upload.status === "failed"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium">{upload.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(upload.created_at).toLocaleString()} by {upload.user_email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{upload.rows_imported?.toLocaleString() || 0} rows</p>
                        <p className="text-xs text-muted-foreground">{upload.status}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Upload
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Are you sure you want to delete this upload?</p>
              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium">File: {selectedUpload?.filename}</p>
                <p className="text-muted-foreground">
                  Uploaded: {new Date(selectedUpload?.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md">
                <input
                  type="checkbox"
                  id="delete-signals"
                  checked={deleteSignalsToo}
                  onChange={(e) => setDeleteSignalsToo(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="delete-signals" className="text-sm cursor-pointer">
                  <span className="font-medium">Also delete signals created from this upload</span>
                  <p className="text-muted-foreground text-xs mt-1">
                    This will remove all signals and data points created during this upload (cannot be undone)
                  </p>
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSignalsToo(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUpload} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
