"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Building2, Search, Pencil, Trash2 } from "lucide-react"
import {
  getAllOrganizations,
  createOrganizationAsAdmin,
  deleteOrganization,
  updateOrganization,
} from "@/lib/admin-org-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
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

export default function OrganizationsClient() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [editOrgName, setEditOrgName] = useState("")
  const [editingOrg, setEditingOrg] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orgToDelete, setOrgToDelete] = useState<any>(null)

  useEffect(() => {
    console.log("[v0] OrganizationsClient mounting")
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      console.log("[v0] Loading organizations...")
      setLoading(true)
      setError(null)
      const data = await getAllOrganizations()
      console.log("[v0] Organizations loaded:", data)
      setOrganizations(data || [])
    } catch (error: any) {
      console.error("[v0] Error loading organizations:", error)
      setError(error.message || "Failed to load organizations")
    } finally {
      setLoading(false)
      console.log("[v0] Loading complete")
    }
  }

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return

    setCreating(true)
    try {
      console.log("[v0] Creating organization:", newOrgName)
      await createOrganizationAsAdmin(newOrgName)
      await loadOrganizations()
      setCreateDialogOpen(false)
      setNewOrgName("")
    } catch (error: any) {
      console.error("[v0] Error creating organization:", error)
      alert("Failed to create organization. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const handleEditOrg = async () => {
    if (!editOrgName.trim() || !editingOrg) return

    setUpdating(true)
    try {
      await updateOrganization(editingOrg.id, editOrgName)
      await loadOrganizations()
      setEditDialogOpen(false)
      setEditingOrg(null)
      setEditOrgName("")
    } catch (error: any) {
      console.error("Error updating organization:", error)
      alert("Failed to update organization. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteOrg = async () => {
    if (!orgToDelete) return

    try {
      await deleteOrganization(orgToDelete.id)
      await loadOrganizations()
      setDeleteDialogOpen(false)
      setOrgToDelete(null)
    } catch (error) {
      console.error("Error deleting organization:", error)
      alert("Failed to delete organization")
    }
  }

  const openEditDialog = (org: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingOrg(org)
    setEditOrgName(org.name)
    setEditDialogOpen(true)
  }

  const filteredOrgs = organizations.filter((org) => org.name.toLowerCase().includes(searchQuery.toLowerCase()))

  console.log("[v0] Render state:", { loading, error, organizationsCount: organizations.length })

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organisations</h1>
            <p className="text-muted-foreground">Manage customer organisations and workspaces</p>
          </div>
        </div>
        <div className="border border-destructive/50 rounded-lg p-6 bg-destructive/10">
          <h3 className="font-semibold text-destructive mb-2">Error Loading Organisations</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadOrganizations} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading organisations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organisations</h1>
          <p className="text-muted-foreground">Manage customer organisations and workspaces</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Organisation
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search organisations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Organizations List */}
      {filteredOrgs.length > 0 ? (
        <div className="space-y-3">
          {filteredOrgs.map((org) => (
            <div
              key={org.id}
              className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer bg-card"
              onClick={() => router.push(`/admin/organisations/${org.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{org.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(org.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={(e) => openEditDialog(org, e)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOrgToDelete(org)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "No organisations found" : "No organisations yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try a different search term" : "Create your first organisation to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Organisation
            </Button>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organisation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organisation Name</Label>
              <Input
                id="org-name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Enter organisation name"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newOrgName.trim()) {
                    handleCreateOrg()
                  }
                }}
              />
            </div>
            <Button onClick={handleCreateOrg} disabled={creating || !newOrgName.trim()} className="w-full">
              {creating ? "Creating..." : "Create Organisation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organisation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-org-name">Organisation Name</Label>
              <Input
                id="edit-org-name"
                value={editOrgName}
                onChange={(e) => setEditOrgName(e.target.value)}
                placeholder="Enter organisation name"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && editOrgName.trim()) {
                    handleEditOrg()
                  }
                }}
              />
            </div>
            <Button onClick={handleEditOrg} disabled={updating || !editOrgName.trim()} className="w-full">
              {updating ? "Updating..." : "Update Organisation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organisation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {orgToDelete?.name}? This will remove all members and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrg} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
