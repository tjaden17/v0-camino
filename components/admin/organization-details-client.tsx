"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, UserPlus, Upload, Save, Plus, Trash2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  getOrganizationDetails,
  getOrganizationMembersAdmin,
  updateOrganization,
  addMemberToOrgAdmin,
  removeMemberAdmin,
  updateMemberRoleAdmin,
  updateUserProfileAdmin,
  getAllUsersNotInOrg,
  getOrganizationUploads,
  getOrganizationSignals,
  deleteOrgUpload,
  deleteOrgSignal,
} from "@/lib/admin-org-service"
import { createUserAndAddToOrgAction } from "@/app/admin/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

export default function OrganizationDetailsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const [org, setOrg] = useState<any>(null)
  const [orgName, setOrgName] = useState("")
  const [members, setMembers] = useState<any[]>([])
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [uploads, setUploads] = useState<any[]>([])
  const [signals, setSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [createMemberDialogOpen, setCreateMemberDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState<"admin" | "read-only">("read-only")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberOrgRole, setNewMemberOrgRole] = useState<"admin" | "read-only">("read-only")
  const [newMemberProfileRole, setNewMemberProfileRole] = useState<"executive" | "manager">("manager")
  const [newMemberKpi1, setNewMemberKpi1] = useState("")
  const [newMemberKpi2, setNewMemberKpi2] = useState("")
  const [newMemberKpi3, setNewMemberKpi3] = useState("")
  const [creatingMember, setCreatingMember] = useState(false)
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ email: string; password: string } | null>(null)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [profileUpdates, setProfileUpdates] = useState<any>({})
  const [selectedSignals, setSelectedSignals] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    loadOrgData()
  }, [orgId])

  // Set default KPIs based on profile role
  useEffect(() => {
    if (newMemberProfileRole === "executive") {
      setNewMemberKpi1("win rate")
      setNewMemberKpi2("revenue")
      setNewMemberKpi3("pipeline value")
    } else if (newMemberProfileRole === "manager") {
      setNewMemberKpi1("team performance")
      setNewMemberKpi2("leads per month")
      setNewMemberKpi3("")
    }
  }, [newMemberProfileRole])

  const loadOrgData = async () => {
    try {
      // Try combined Neon API first (org, members, uploads, signals, availableUsers)
      const res = await fetch(`/api/admin/organizations/${orgId}/details`)
      if (res.ok) {
        const data = await res.json()
        setOrg(data.org ?? null)
        setOrgName(data.org?.name ?? "")
        setMembers(Array.isArray(data.members) ? data.members : [])
        setAvailableUsers(Array.isArray(data.availableUsers) ? data.availableUsers : [])
        setUploads(Array.isArray(data.uploads) ? data.uploads : [])
        setSignals(Array.isArray(data.signals) ? data.signals : [])
        setLoading(false)
        return
      }
    } catch (_) {
      // Fall through to legacy Supabase-based loading
    }

    // Fallback: load each piece separately so one failure doesn't break the page
    try {
      const orgData = await getOrganizationDetails(orgId)
      setOrg(orgData)
      setOrgName(orgData?.name ?? "")
    } catch (e) {
      console.error("Error loading org details:", e)
      setOrg(null)
      setOrgName("")
    }

    const loadOptional = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await fn()
      } catch (e) {
        console.error("Error loading org section:", e)
        return fallback
      }
    }

    const [membersData, usersData, uploadsData, signalsData] = await Promise.all([
      loadOptional(() => getOrganizationMembersAdmin(orgId), []),
      loadOptional(() => getAllUsersNotInOrg(orgId), []),
      loadOptional(() => getOrganizationUploads(orgId), []),
      loadOptional(() => getOrganizationSignals(orgId), []),
    ])
    setMembers(membersData || [])
    setAvailableUsers(usersData || [])
    setUploads(uploadsData || [])
    setSignals(signalsData || [])
    setLoading(false)
  }

  const handleUpdateOrgName = async () => {
    try {
      await updateOrganization(orgId, orgName)
      alert("Organization name updated")
    } catch (error) {
      console.error("Error updating org:", error)
      alert("Failed to update organization")
    }
  }

  const handleCreateMember = async () => {
    if (!newMemberEmail.trim() || !newMemberName.trim()) {
      alert("Please enter both name and email")
      return
    }

    setCreatingMember(true)
    try {
      const result = await createUserAndAddToOrgAction(
        orgId,
        newMemberEmail,
        newMemberName,
        newMemberOrgRole,
        newMemberProfileRole,
        newMemberKpi1,
        newMemberKpi2,
        newMemberKpi3,
      )

      // Show the temporary password
      setTempPasswordInfo({
        email: newMemberEmail,
        password: result.tempPassword,
      })

      await loadOrgData()

      // Reset form but keep dialog open to show password
      setNewMemberEmail("")
      setNewMemberName("")
      setNewMemberOrgRole("read-only")
      setNewMemberProfileRole("manager")
      setNewMemberKpi1("")
      setNewMemberKpi2("")
      setNewMemberKpi3("")
    } catch (error: any) {
      console.error("Error creating member:", error)
      alert(`Failed to create member: ${error.message || "Unknown error"}`)
    } finally {
      setCreatingMember(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedUserId) return

    try {
      await addMemberToOrgAdmin(orgId, selectedUserId, selectedRole)
      await loadOrgData()
      setAddMemberDialogOpen(false)
      setSelectedUserId("")
      setSelectedRole("read-only")
    } catch (error) {
      console.error("Error adding member:", error)
      alert("Failed to add member")
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: "admin" | "read-only") => {
    try {
      await updateMemberRoleAdmin(memberId, newRole)
      await loadOrgData()
    } catch (error) {
      console.error("Error updating role:", error)
      alert("Failed to update role")
    }
  }

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!confirm("Remove this member from the organization?")) return

    try {
      await removeMemberAdmin(memberId, userId)
      await loadOrgData()
    } catch (error) {
      console.error("Error removing member:", error)
      alert("Failed to remove member")
    }
  }

  const handleUpdateUserProfile = async (userId: string) => {
    try {
      await updateUserProfileAdmin(userId, profileUpdates[userId] || {})
      await loadOrgData()
      setEditingMember(null)
      setProfileUpdates({})
      alert("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    }
  }

  const handleDeleteUpload = async (uploadId: string) => {
    const deleteSignals = confirm(
      "Delete this upload?\n\nClick OK to also delete all signals created during this upload.\nClick Cancel to keep the signals.",
    )

    try {
      await deleteOrgUpload(uploadId, deleteSignals)
      await loadOrgData()
      alert("Upload deleted successfully")
    } catch (error) {
      console.error("Error deleting upload:", error)
      alert("Failed to delete upload")
    }
  }

  const handleDeleteSignal = async (signalId: string, signalName: string) => {
    if (
      !confirm(
        `Delete signal "${signalName}"?\n\nThis will also delete all associated data points. This action cannot be undone.`,
      )
    )
      return

    try {
      await deleteOrgSignal(signalId)
      await loadOrgData()
      alert("Signal deleted successfully")
    } catch (error) {
      console.error("Error deleting signal:", error)
      alert("Failed to delete signal")
    }
  }

  const handleBulkDeleteSignals = async () => {
    if (selectedSignals.size === 0) return

    if (
      !confirm(
        `Delete ${selectedSignals.size} signal(s)?\n\nThis will also delete all associated data points. This action cannot be undone.`,
      )
    )
      return

    setBulkDeleting(true)
    try {
      await Promise.all(Array.from(selectedSignals).map((signalId) => deleteOrgSignal(signalId)))
      await loadOrgData()
      setSelectedSignals(new Set())
      alert(`Successfully deleted ${selectedSignals.size} signal(s)`)
    } catch (error) {
      console.error("Error bulk deleting signals:", error)
      alert("Failed to delete some signals")
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSignalSelection = (signalId: string) => {
    const newSelected = new Set(selectedSignals)
    if (newSelected.has(signalId)) {
      newSelected.delete(signalId)
    } else {
      newSelected.add(signalId)
    }
    setSelectedSignals(newSelected)
  }

  const toggleAllSignals = () => {
    if (selectedSignals.size === signals.length) {
      setSelectedSignals(new Set())
    } else {
      setSelectedSignals(new Set(signals.map((s) => s.signal_id)))
    }
  }

  if (loading) {
    return <div>Loading organization...</div>
  }

  if (!org) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/organisations")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-muted-foreground">Organization not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/organisations")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{org.name}</h1>
          <p className="text-muted-foreground">Manage organization details and members</p>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="uploads">Uploads ({uploads.length})</TabsTrigger>
          <TabsTrigger value="signals">Signals ({signals.length})</TabsTrigger>
          <TabsTrigger value="data">Upload Data</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <div className="flex gap-2">
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                <Button onClick={handleUpdateOrgName}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(org.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="font-medium">{members.length}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Dialog
              open={createMemberDialogOpen}
              onOpenChange={(open) => {
                setCreateMemberDialogOpen(open)
                if (!open) setTempPasswordInfo(null)
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Member</DialogTitle>
                </DialogHeader>
                {tempPasswordInfo ? (
                  <div className="space-y-4 py-4">
                    <Alert>
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-semibold">Member created successfully!</p>
                          <p className="text-sm">Send these credentials to the user:</p>
                          <div className="bg-muted p-3 rounded-md space-y-1 font-mono text-sm">
                            <p>
                              <strong>Email:</strong> {tempPasswordInfo.email}
                            </p>
                            <p>
                              <strong>Temporary Password:</strong> {tempPasswordInfo.password}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            The user will be required to change their password on first login.
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => {
                        setCreateMemberDialogOpen(false)
                        setTempPasswordInfo(null)
                      }}
                      className="w-full"
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>User Role (Job Function)</Label>
                      <Select value={newMemberProfileRole} onValueChange={(v) => setNewMemberProfileRole(v as "executive" | "manager")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Manager: Can upload data, create signals. Executive: Views signals, saves favorites.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Organization Access</Label>
                      <Select value={newMemberOrgRole} onValueChange={(v) => setNewMemberOrgRole(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin (Full access)</SelectItem>
                          <SelectItem value="read-only">Read-only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3 pt-2 border-t">
                      <div className="space-y-1">
                        <Label>KPIs (Key Performance Indicators)</Label>
                        <p className="text-xs text-muted-foreground">
                          These metrics will appear first on the user's signals page
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={newMemberKpi1}
                          onChange={(e) => setNewMemberKpi1(e.target.value)}
                          placeholder="e.g., win rate, revenue, ticket volume"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={newMemberKpi2}
                          onChange={(e) => setNewMemberKpi2(e.target.value)}
                          placeholder="e.g., sales, customer satisfaction"
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={newMemberKpi3}
                          onChange={(e) => setNewMemberKpi3(e.target.value)}
                          placeholder="Optional third KPI"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateMember}
                      className="w-full"
                      disabled={creatingMember || !newMemberEmail.trim() || !newMemberName.trim()}
                    >
                      {creatingMember ? "Creating..." : "Create Member"}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Existing User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Member to Organization</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select User</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email} {user.full_name && `(${user.full_name})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="read-only">Read-only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddMember} className="w-full" disabled={!selectedUserId}>
                    Add Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="border rounded-lg p-4">
                {editingMember?.id === member.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={member.user_profile?.email} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={profileUpdates[member.user_id]?.full_name ?? member.user_profile?.full_name ?? ""}
                          onChange={(e) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], full_name: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                          value={profileUpdates[member.user_id]?.role ?? member.user_profile?.role ?? ""}
                          onChange={(e) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], role: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Industry</Label>
                        <Input
                          value={profileUpdates[member.user_id]?.industry ?? member.user_profile?.industry ?? ""}
                          onChange={(e) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], industry: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Business Context</Label>
                        <Textarea
                          value={
                            profileUpdates[member.user_id]?.business_context ??
                            member.user_profile?.business_context ??
                            ""
                          }
                          onChange={(e) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], business_context: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdateUserProfile(member.user_id)}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setEditingMember(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{member.user_profile?.email}</div>
                      {member.user_profile?.full_name && (
                        <div className="text-sm text-muted-foreground">{member.user_profile.full_name}</div>
                      )}
                      {member.user_profile?.role && (
                        <div className="text-sm text-muted-foreground mt-1">Role: {member.user_profile.role}</div>
                      )}
                      {(member.user_profile?.kpi_1 || member.user_profile?.kpi_2 || member.user_profile?.kpi_3) && (
                        <div className="flex gap-1 mt-2">
                          {member.user_profile?.kpi_1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                              {member.user_profile.kpi_1}
                            </span>
                          )}
                          {member.user_profile?.kpi_2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                              {member.user_profile.kpi_2}
                            </span>
                          )}
                          {member.user_profile?.kpi_3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                              {member.user_profile.kpi_3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={member.role} onValueChange={(v) => handleUpdateMemberRole(member.id, v as any)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="read-only">Read-only</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => setEditingMember(member)}>
                        Edit Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {members.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No members yet. Add members to get started.</div>
          )}
        </TabsContent>

        <TabsContent value="uploads" className="space-y-4">
          <div className="space-y-2">
            {uploads.map((upload) => (
              <div key={upload.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{upload.filename}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Uploaded by {upload.user_email} on {new Date(upload.created_at).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Status: <span className="font-medium">{upload.status}</span> • Rows: {upload.rows_imported || 0}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeleteUpload(upload.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {uploads.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No uploads yet. Upload data files to get started.
            </div>
          )}
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          {signals.length > 0 && (
            <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedSignals.size === signals.length && signals.length > 0}
                  onCheckedChange={toggleAllSignals}
                />
                <span className="text-sm font-medium">
                  {selectedSignals.size > 0 ? `${selectedSignals.size} selected` : "Select all"}
                </span>
              </div>
              {selectedSignals.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDeleteSignals} disabled={bulkDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {bulkDeleting ? "Deleting..." : `Delete ${selectedSignals.size} Signal(s)`}
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2">
            {signals.map((signal) => (
              <div key={signal.signal_id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedSignals.has(signal.signal_id)}
                    onCheckedChange={() => toggleSignalSelection(signal.signal_id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{signal.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Category: {signal.category} • Owner: {signal.owner_email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Data Points: {signal.data_points_count}
                      {signal.latest_value !== null && (
                        <>
                          {" "}
                          • Latest Value: {signal.latest_value} ({new Date(signal.latest_date).toLocaleDateString()})
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeleteSignal(signal.signal_id, signal.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {signals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No signals yet. Upload data to generate signals.
            </div>
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="space-y-6">
            {/* Upload button */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Upload Data for Organization</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload CSV files from Zoho CRM, Zoho Desk, or other sources for this organization
                  </p>
                </div>
              </div>
              <Button onClick={() => router.push(`/admin/organisations/${orgId}/upload`)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Data Files
              </Button>
            </div>

            {/* Data Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Total Uploads</div>
                <div className="text-2xl font-bold mt-1">{uploads.length}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Total Signals</div>
                <div className="text-2xl font-bold mt-1">{signals.length}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Total Data Points</div>
                <div className="text-2xl font-bold mt-1">
                  {signals.reduce((sum, s) => sum + (s.data_points_count || 0), 0)}
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Uploads</h3>
                {uploads.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete all ${uploads.length} uploads and their associated data?`)) {
                        Promise.all(uploads.map((u) => handleDeleteUpload(u.id)))
                          .then(() => loadOrgData())
                          .then(() => alert("All uploads deleted"))
                          .catch((err) => {
                            console.error(err)
                            alert("Failed to delete some uploads")
                          })
                      }
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Uploads
                  </Button>
                )}
              </div>

              {uploads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No uploads yet</div>
              ) : (
                <div className="space-y-2">
                  {uploads.slice(0, 5).map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{upload.filename}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(upload.created_at).toLocaleString()} • {upload.rows_imported || 0} rows •{" "}
                          {upload.status}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteUpload(upload.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {uploads.length > 5 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          document.querySelector('[data-value="uploads"]')?.dispatchEvent(new MouseEvent("click"))
                        }
                      >
                        View all {uploads.length} uploads →
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Active Signals */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Active Signals</h3>
                {signals.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(`Delete all ${signals.length} signals and their data points? This cannot be undone.`)
                      ) {
                        Promise.all(signals.map((s) => deleteOrgSignal(s.signal_id)))
                          .then(() => loadOrgData())
                          .then(() => alert("All signals deleted"))
                          .catch((err) => {
                            console.error(err)
                            alert("Failed to delete some signals")
                          })
                      }
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Signals
                  </Button>
                )}
              </div>

              {signals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No signals yet</div>
              ) : (
                <div className="space-y-2">
                  {signals.slice(0, 5).map((signal) => (
                    <div key={signal.signal_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{signal.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {signal.category} • {signal.data_points_count} data points
                          {signal.latest_value !== null && <> • Latest: {signal.latest_value}</>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteSignal(signal.signal_id, signal.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {signals.length > 5 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() =>
                          document.querySelector('[data-value="signals"]')?.dispatchEvent(new MouseEvent("click"))
                        }
                      >
                        View all {signals.length} signals →
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="border-2 border-destructive rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">Irreversible actions</p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  if (
                    confirm(
                      `Delete ALL data for ${org?.name}?\n\nThis will delete:\n- ${uploads.length} uploads\n- ${signals.length} signals\n- ${signals.reduce((sum, s) => sum + (s.data_points_count || 0), 0)} data points\n\nThis action CANNOT be undone!`,
                    )
                  ) {
                    Promise.all([
                      ...uploads.map((u) => deleteOrgUpload(u.id, true)),
                      ...signals.map((s) => deleteOrgSignal(s.signal_id)),
                    ])
                      .then(() => loadOrgData())
                      .then(() => alert("All organization data deleted"))
                      .catch((err) => {
                        console.error(err)
                        alert("Failed to delete all data")
                      })
                  }
                }}
                disabled={uploads.length === 0 && signals.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Organization Data
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
