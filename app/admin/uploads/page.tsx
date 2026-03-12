"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllUploads, deleteUpload, deleteSignalsFromUpload } from "@/lib/admin-service"
import { Upload, Trash2, AlertTriangle } from "lucide-react"
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

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUpload, setSelectedUpload] = useState<any>(null)
  const [deleteSignalsToo, setDeleteSignalsToo] = useState(false)
  const { toast } = useToast()

  const loadUploads = async () => {
    try {
      const data = await getAllUploads()
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
      await deleteUpload(selectedUpload.id)

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
        description: "Failed to delete upload",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading uploads...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Management</h1>
          <p className="text-muted-foreground mt-1">{uploads.length} total uploads</p>
        </div>
        <Link href="/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            New Upload
          </Button>
        </Link>
      </div>

      {/* Uploads Table */}
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
              {uploads.map((upload) => (
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
                  <td className="p-4 text-sm">{upload.rows_imported || "-"}</td>
                  <td className="p-4 text-sm text-muted-foreground">{new Date(upload.created_at).toLocaleString()}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
