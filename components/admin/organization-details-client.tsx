"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, UserPlus, Upload, Save, Plus, Trash2, AlertTriangle, Filter, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  getOrganizationDetails,
  getOrganizationMembersAdmin,
  updateOrganization,
  addMemberToOrgAdmin,
  removeMemberFromOrgApi,
  updateMemberRoleAdmin,
  updateUserProfileAdminApi,
  getAllUsersNotInOrg,
  getOrganizationUploads,
  getOrganizationSignals,
  deleteOrgUpload,
} from "@/lib/admin-org-service"
import { getKPIsForRole } from "@/lib/kpi-templates"
import { createUserAndAddToOrgAction } from "@/app/admin/actions"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  CatalogSignalsView,
  filterOtherSignals,
  orgSignalToSignalWithData,
  type CatalogSignalItem,
  type OrgSignalLike,
} from "@/components/catalog-signals-view"
import type { TrendPeriod, TrendDisplay } from "@/components/signal-accordion-card"

// Onboarding-style options (same as auth/onboarding) for full profile when creating a member
const CREATE_MEMBER_INDUSTRIES = [
  { value: "b2b_saas", label: "B2B SaaS" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "fintech", label: "Financial Services / Fintech" },
  { value: "healthcare", label: "Healthcare" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "professional_services", label: "Professional Services" },
  { value: "retail", label: "Retail" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
]
const CREATE_MEMBER_COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
]
const CREATE_MEMBER_BUSINESS_STAGES = [
  { value: "pre_revenue", label: "Pre-revenue / Building" },
  { value: "early_stage", label: "Early Stage (Finding PMF)" },
  { value: "growth", label: "Growth Stage (Scaling)" },
  { value: "expansion", label: "Expansion (Multi-product/market)" },
  { value: "mature", label: "Mature / Optimizing" },
]
const CREATE_MEMBER_ROLES = [
  { value: "ceo_founder", label: "CEO / Founder" },
  { value: "cfo", label: "CFO" },
  { value: "coo", label: "COO" },
  { value: "cro", label: "CRO / Chief Revenue Officer" },
  { value: "vp_sales", label: "VP Sales" },
  { value: "vp_marketing", label: "VP Marketing" },
  { value: "vp_product", label: "VP Product" },
  { value: "vp_engineering", label: "VP Engineering" },
  { value: "vp_cs", label: "VP Customer Success" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "analyst", label: "Analyst" },
  { value: "other", label: "Other" },
]
const CREATE_MEMBER_DEPARTMENTS = [
  { value: "executive", label: "Executive / Leadership" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "product", label: "Product" },
  { value: "engineering", label: "Engineering" },
  { value: "customer_success", label: "Customer Success" },
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "hr", label: "HR / People" },
  { value: "other", label: "Other" },
]
const CREATE_MEMBER_SENIORITY = [
  { value: "c_level", label: "C-Level" },
  { value: "vp", label: "VP / SVP" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "individual_contributor", label: "Individual Contributor" },
]
const CREATE_MEMBER_GOAL_CATEGORIES = [
  { category: "Revenue & Growth", goals: [{ value: "increase_revenue", label: "Increase revenue" }, { value: "improve_margins", label: "Improve margins" }, { value: "accelerate_growth", label: "Accelerate growth rate" }, { value: "expand_arr", label: "Grow ARR / MRR" }] },
  { category: "Sales & Pipeline", goals: [{ value: "increase_pipeline", label: "Increase pipeline" }, { value: "improve_win_rate", label: "Improve win rate" }, { value: "shorten_sales_cycle", label: "Shorten sales cycle" }, { value: "increase_deal_size", label: "Increase average deal size" }] },
  { category: "Customer Success", goals: [{ value: "reduce_churn", label: "Reduce churn" }, { value: "improve_nrr", label: "Improve Net Revenue Retention" }, { value: "increase_nps", label: "Increase NPS / CSAT" }, { value: "improve_onboarding", label: "Improve customer onboarding" }] },
  { category: "Efficiency & Operations", goals: [{ value: "reduce_cac", label: "Reduce Customer Acquisition Cost" }, { value: "improve_ltv_cac", label: "Improve LTV:CAC ratio" }, { value: "increase_efficiency", label: "Increase operational efficiency" }, { value: "reduce_costs", label: "Reduce costs" }] },
]

export default function OrganizationDetailsClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { toast } = useToast()
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
  const [newMemberIndustry, setNewMemberIndustry] = useState("")
  const [newMemberCompanySize, setNewMemberCompanySize] = useState("")
  const [newMemberBusinessStage, setNewMemberBusinessStage] = useState("")
  const [newMemberOnboardingRole, setNewMemberOnboardingRole] = useState("")
  const [newMemberDepartment, setNewMemberDepartment] = useState("")
  const [newMemberSeniorityLevel, setNewMemberSeniorityLevel] = useState("")
  const [newMemberSelectedGoals, setNewMemberSelectedGoals] = useState<string[]>([])
  const [creatingMember, setCreatingMember] = useState(false)
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ email: string; password: string } | null>(null)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [profileUpdates, setProfileUpdates] = useState<any>({})
  const [selectedSignals, setSelectedSignals] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [recalculatingSignals, setRecalculatingSignals] = useState(false)
  const [catalogSignals, setCatalogSignals] = useState<CatalogSignalItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [userViewTrendPeriod, setUserViewTrendPeriod] = useState<TrendPeriod>("30d")
  const [userViewTrendDisplay, setUserViewTrendDisplay] = useState<TrendDisplay>("percent")
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null)
  const [removingMember, setRemovingMember] = useState(false)

  useEffect(() => {
    loadOrgData()
  }, [orgId])

  useEffect(() => {
    if (!orgId) return
    let cancelled = false
    setCatalogLoading(true)
    fetch(`/api/admin/organizations/${orgId}/catalog`)
      .then((res) => (res.ok ? res.json() : { signals: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.signals)) setCatalogSignals(data.signals)
      })
      .catch(() => {
        if (!cancelled) setCatalogSignals([])
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false)
      })
    return () => {
      cancelled = true
    }
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
        org?.name ?? orgName ?? undefined,
        {
          industry: newMemberIndustry || undefined,
          companySize: newMemberCompanySize || undefined,
          businessStage: newMemberBusinessStage || undefined,
          role: newMemberOnboardingRole || undefined,
          department: newMemberDepartment || undefined,
          seniorityLevel: newMemberSeniorityLevel || undefined,
          selectedGoals: newMemberSelectedGoals.length > 0 ? newMemberSelectedGoals : undefined,
        },
      )

      await loadOrgData()

      // Reset form and close dialog so user is back on org page
      setNewMemberEmail("")
      setNewMemberName("")
      setNewMemberOrgRole("read-only")
      setNewMemberProfileRole("manager")
      setNewMemberKpi1("")
      setNewMemberKpi2("")
      setNewMemberKpi3("")
      setNewMemberIndustry("")
      setNewMemberCompanySize("")
      setNewMemberBusinessStage("")
      setNewMemberOnboardingRole("")
      setNewMemberDepartment("")
      setNewMemberSeniorityLevel("")
      setNewMemberSelectedGoals([])
      setCreateMemberDialogOpen(false)
      setTempPasswordInfo(null)
      alert(
        `Member created successfully.\n\nSend these credentials to ${newMemberEmail}:\nTemporary password: ${result.tempPassword}\n\nThe user will be required to change their password on first login.`
      )

      router.push(`/admin/organisations/${orgId}`)
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

  const handleRemoveMemberClick = (userId: string, member: { user_profile?: { full_name?: string; email?: string } }) => {
    const name = member.user_profile?.full_name || member.user_profile?.email || "This member"
    setMemberToRemove({ userId, name })
  }

  const handleRemoveMemberConfirm = async () => {
    if (!memberToRemove) return
    setRemovingMember(true)
    try {
      await removeMemberFromOrgApi(orgId, memberToRemove.userId)
      await loadOrgData()
      setMemberToRemove(null)
      toast({
        title: "Member removed",
        description: `${memberToRemove.name} has been removed from the organization.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Failed to remove member",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setRemovingMember(false)
    }
  }

  const handleUpdateUserProfile = async (userId: string) => {
    const payload = profileUpdates[userId] || {}
    try {
      await updateUserProfileAdminApi(userId, {
        full_name: payload.full_name,
        role: payload.role,
        industry: payload.industry,
        business_context: payload.business_context,
        company_stage: payload.company_stage,
        team_size: payload.team_size,
        market: payload.market,
        competitors: payload.competitors,
        business_model: payload.business_model,
        kpi_1: payload.kpi_1,
        kpi_2: payload.kpi_2,
        kpi_3: payload.kpi_3,
      })
      await loadOrgData()
      setEditingMember(null)
      setProfileUpdates({})
      toast({ title: "Profile updated", description: "User profile and KPIs have been saved.", variant: "default" })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditProfile = (member: { id: string; user_id: string; user_profile?: Record<string, unknown> }) => {
    setEditingMember(member)
    const p = member.user_profile ?? {}
    setProfileUpdates((prev) => ({
      ...prev,
      [member.user_id]: {
        full_name: p.full_name ?? "",
        role: p.role ?? "",
        industry: p.industry ?? "",
        business_context: p.business_context ?? "",
        company_stage: p.company_stage ?? "",
        team_size: p.team_size ?? "",
        market: p.market ?? "",
        competitors: p.competitors ?? "",
        business_model: p.business_model ?? "",
        kpi_1: p.kpi_1 ?? "",
        kpi_2: p.kpi_2 ?? "",
        kpi_3: p.kpi_3 ?? "",
      },
    }))
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

  // Delete signals from Neon (org details page loads signals from Neon)
  const deleteSignalsNeon = async (signalIds: string[]) => {
    const ids = signalIds.filter(Boolean)
    if (ids.length === 0) return
    const res = await fetch(`/api/admin/organizations/${orgId}/signals/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signalIds: ids }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || "Failed to delete signals")
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
      await deleteSignalsNeon([signalId])
      await loadOrgData()
      toast({ title: "Signal deleted", description: `"${signalName}" and its data points have been removed.`, variant: "default" })
    } catch (error) {
      console.error("Error deleting signal:", error)
      toast({ title: "Failed to delete signal", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" })
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
      const count = selectedSignals.size
      await deleteSignalsNeon(Array.from(selectedSignals))
      await loadOrgData()
      setSelectedSignals(new Set())
      toast({ title: "Signals deleted", description: `${count} signal(s) and their data points have been removed.`, variant: "default" })
    } catch (error) {
      console.error("Error bulk deleting signals:", error)
      toast({ title: "Failed to delete signals", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" })
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleRecalculateSignals = async () => {
    setRecalculatingSignals(true)
    try {
      const res = await fetch("/api/upload/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({ title: "Recalculate failed", description: data?.error ?? "Could not recalculate", variant: "destructive" })
        return
      }
      toast({
        title: "Signals recalculated",
        description: data.signalsUpdated != null ? `${data.signalsUpdated} signal(s) updated` : data.message ?? "Recalculated from latest uploads.",
      })
      await loadOrgData()
      if (orgId) {
        let cancelled = false
        fetch(`/api/admin/organizations/${orgId}/catalog`)
          .then((r) => (r.ok ? r.json() : { signals: [] }))
          .then((d) => { if (!cancelled && Array.isArray(d.signals)) setCatalogSignals(d.signals) })
          .catch(() => { if (!cancelled) setCatalogSignals([]) })
      }
    } catch (e) {
      toast({ title: "Recalculate failed", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" })
    } finally {
      setRecalculatingSignals(false)
    }
  }

  const toggleNewMemberGoal = (goalValue: string) => {
    setNewMemberSelectedGoals((prev) =>
      prev.includes(goalValue) ? prev.filter((g) => g !== goalValue) : [...prev, goalValue]
    )
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

  const signalCategories = Array.from(new Set(signals.map((s) => s.category).filter(Boolean))).sort() as string[]
  const filteredSignals = categoryFilter === "all" ? signals : signals.filter((s) => s.category === categoryFilter)

  const toggleAllSignals = () => {
    if (selectedSignals.size === filteredSignals.length && filteredSignals.length > 0) {
      setSelectedSignals(new Set())
    } else {
      setSelectedSignals(
        new Set(filteredSignals.map((s) => (s as { id?: string; signal_id?: string }).id ?? (s as { signal_id?: string }).signal_id))
      )
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
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member from organization?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove
                ? `${memberToRemove.name} will lose access to this organization. They can be re-added later if needed.`
                : "This member will lose access to this organization."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingMember}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removingMember}
              onClick={(e) => {
                e.preventDefault()
                handleRemoveMemberConfirm()
              }}
            >
              {removingMember ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
              <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                  <form
                    className="space-y-4 py-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleCreateMember()
                    }}
                  >
                    {creatingMember && (
                      <p className="text-sm text-primary font-medium">Creating member...</p>
                    )}
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

                    <div className="space-y-3 pt-2 border-t">
                      <p className="text-sm font-medium">Profile context (optional, same as onboarding)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Industry</Label>
                          <Select value={newMemberIndustry} onValueChange={setNewMemberIndustry}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {CREATE_MEMBER_INDUSTRIES.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Company size</Label>
                          <Select value={newMemberCompanySize} onValueChange={setNewMemberCompanySize}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {CREATE_MEMBER_COMPANY_SIZES.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Business stage</Label>
                          <Select value={newMemberBusinessStage} onValueChange={setNewMemberBusinessStage}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business stage" />
                            </SelectTrigger>
                            <SelectContent>
                              {CREATE_MEMBER_BUSINESS_STAGES.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Role (job title)</Label>
                          <Select value={newMemberOnboardingRole} onValueChange={setNewMemberOnboardingRole}>
                            <SelectTrigger>
                              <SelectValue placeholder="e.g. CEO, Manager" />
                            </SelectTrigger>
                            <SelectContent>
                              {CREATE_MEMBER_ROLES.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={newMemberDepartment} onValueChange={setNewMemberDepartment}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {CREATE_MEMBER_DEPARTMENTS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Seniority level</Label>
                          <Select value={newMemberSeniorityLevel} onValueChange={setNewMemberSeniorityLevel}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select seniority" />
                            </SelectTrigger>
                            <SelectContent>
                              {CREATE_MEMBER_SENIORITY.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <Label>Top priorities / goals (optional)</Label>
                      <p className="text-xs text-muted-foreground">Select goals that matter most to this user</p>
                      <div className="space-y-4 max-h-48 overflow-y-auto">
                        {CREATE_MEMBER_GOAL_CATEGORIES.map((cat) => (
                          <div key={cat.category}>
                            <h4 className="text-xs font-semibold text-muted-foreground mb-2">{cat.category}</h4>
                            <div className="flex flex-wrap gap-2">
                              {cat.goals.map((goal) => (
                                <label
                                  key={goal.value}
                                  className={cn(
                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer text-sm transition-colors",
                                    newMemberSelectedGoals.includes(goal.value)
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  <Checkbox
                                    checked={newMemberSelectedGoals.includes(goal.value)}
                                    onCheckedChange={() => toggleNewMemberGoal(goal.value)}
                                  />
                                  {goal.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={creatingMember}
                    >
                      {creatingMember ? "Creating..." : "Create Member"}
                    </Button>
                    {(!newMemberEmail.trim() || !newMemberName.trim()) && (
                      <p className="text-xs text-muted-foreground text-center">
                        Enter full name and email to create a member.
                      </p>
                    )}
                  </form>
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
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={member.user_profile?.email} disabled className="bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={profileUpdates[member.user_id]?.full_name ?? ""}
                          onChange={(e) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], full_name: e.target.value },
                            })
                          }
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Profile Role</Label>
                        <Select
                          value={profileUpdates[member.user_id]?.role ?? ""}
                          onValueChange={(v) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], role: v, kpi_1: "", kpi_2: "", kpi_3: "" },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CEO / Founder">CEO / Founder</SelectItem>
                            <SelectItem value="CFO">CFO</SelectItem>
                            <SelectItem value="COO">COO</SelectItem>
                            <SelectItem value="VP Sales">VP Sales</SelectItem>
                            <SelectItem value="VP Marketing">VP Marketing</SelectItem>
                            <SelectItem value="VP Product">VP Product</SelectItem>
                            <SelectItem value="VP Engineering">VP Engineering</SelectItem>
                            <SelectItem value="Head of Customer Success">Head of Customer Success</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Company Stage</Label>
                        <Select
                          value={profileUpdates[member.user_id]?.company_stage ?? ""}
                          onValueChange={(v) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], company_stage: v },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                            <SelectItem value="Seed">Seed</SelectItem>
                            <SelectItem value="Series A">Series A</SelectItem>
                            <SelectItem value="Series B">Series B</SelectItem>
                            <SelectItem value="Series C+">Series C+</SelectItem>
                            <SelectItem value="Public">Public</SelectItem>
                            <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Team Size</Label>
                        <Select
                          value={profileUpdates[member.user_id]?.team_size ?? ""}
                          onValueChange={(v) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], team_size: v },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10</SelectItem>
                            <SelectItem value="11-50">11-50</SelectItem>
                            <SelectItem value="51-200">51-200</SelectItem>
                            <SelectItem value="201-500">201-500</SelectItem>
                            <SelectItem value="501-1000">501-1000</SelectItem>
                            <SelectItem value="1000+">1000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Industry</Label>
                        <Select
                          value={profileUpdates[member.user_id]?.industry ?? ""}
                          onValueChange={(v) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], industry: v },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="B2B SaaS">B2B SaaS</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Financial Services">Financial Services</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Professional Services">Professional Services</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Business Model</Label>
                        <Select
                          value={profileUpdates[member.user_id]?.business_model ?? ""}
                          onValueChange={(v) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], business_model: v },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Subscription (SaaS)">Subscription (SaaS)</SelectItem>
                            <SelectItem value="Transactional">Transactional</SelectItem>
                            <SelectItem value="Marketplace">Marketplace</SelectItem>
                            <SelectItem value="Freemium">Freemium</SelectItem>
                            <SelectItem value="Enterprise License">Enterprise License</SelectItem>
                            <SelectItem value="Usage-based">Usage-based</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Market</Label>
                        <Input
                          value={profileUpdates[member.user_id]?.market ?? ""}
                          onChange={(e) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], market: e.target.value },
                            })
                          }
                          placeholder="e.g. North America, SMB"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Competitors</Label>
                        <Input
                          value={profileUpdates[member.user_id]?.competitors ?? ""}
                          onChange={(e) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], competitors: e.target.value },
                            })
                          }
                          placeholder="Key competitors"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Business Context</Label>
                        <Textarea
                          value={profileUpdates[member.user_id]?.business_context ?? ""}
                          onChange={(e) =>
                            setProfileUpdates({
                              ...profileUpdates,
                              [member.user_id]: { ...profileUpdates[member.user_id], business_context: e.target.value },
                            })
                          }
                          placeholder="Goals and context..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Key Performance Indicators (KPIs)</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Choose up to 3 KPIs; options depend on profile role.
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label>KPI 1</Label>
                          <Select
                            value={profileUpdates[member.user_id]?.kpi_1 ?? ""}
                            onValueChange={(v) =>
                              setProfileUpdates({
                                ...profileUpdates,
                                [member.user_id]: { ...profileUpdates[member.user_id], kpi_1: v },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Primary KPI" />
                            </SelectTrigger>
                            <SelectContent>
                              {getKPIsForRole(profileUpdates[member.user_id]?.role ?? member.user_profile?.role ?? "").map(
                                (kpi) => (
                                  <SelectItem key={kpi.value} value={kpi.value}>
                                    {kpi.label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>KPI 2</Label>
                          <Select
                            value={profileUpdates[member.user_id]?.kpi_2 ?? ""}
                            onValueChange={(v) =>
                              setProfileUpdates({
                                ...profileUpdates,
                                [member.user_id]: { ...profileUpdates[member.user_id], kpi_2: v },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Secondary KPI" />
                            </SelectTrigger>
                            <SelectContent>
                              {getKPIsForRole(profileUpdates[member.user_id]?.role ?? member.user_profile?.role ?? "").map(
                                (kpi) => (
                                  <SelectItem key={kpi.value} value={kpi.value}>
                                    {kpi.label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>KPI 3</Label>
                          <Select
                            value={profileUpdates[member.user_id]?.kpi_3 ?? ""}
                            onValueChange={(v) =>
                              setProfileUpdates({
                                ...profileUpdates,
                                [member.user_id]: { ...profileUpdates[member.user_id], kpi_3: v },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tertiary KPI" />
                            </SelectTrigger>
                            <SelectContent>
                              {getKPIsForRole(profileUpdates[member.user_id]?.role ?? member.user_profile?.role ?? "").map(
                                (kpi) => (
                                  <SelectItem key={kpi.value} value={kpi.value}>
                                    {kpi.label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
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
                      <Button variant="outline" size="sm" onClick={() => openEditProfile(member)}>
                        Edit Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemoveMemberClick(member.user_id, member)}
                        disabled={removingMember}
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
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">Signals</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculateSignals}
              disabled={recalculatingSignals}
              className="gap-2"
              title="Re-run calculations from this organisation's latest uploads (e.g. after formula changes)"
            >
              <RefreshCw className={cn("h-4 w-4", recalculatingSignals && "animate-spin")} />
              {recalculatingSignals ? "Recalculating…" : "Recalculate"}
            </Button>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground">User view (what users see)</h3>
              {!catalogLoading && (
                <div className="flex items-center gap-1">
                  <Button
                    variant={userViewTrendPeriod === "30d" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setUserViewTrendPeriod("30d")}
                  >
                    30d
                  </Button>
                  <Button
                    variant={userViewTrendPeriod === "90d" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setUserViewTrendPeriod("90d")}
                  >
                    90d
                  </Button>
                  <span className="text-muted-foreground mx-0.5">|</span>
                  <Button
                    variant={userViewTrendDisplay === "percent" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setUserViewTrendDisplay("percent")}
                  >
                    %
                  </Button>
                  <Button
                    variant={userViewTrendDisplay === "absolute" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setUserViewTrendDisplay("absolute")}
                  >
                    Abs
                  </Button>
                </div>
              )}
            </div>
            {catalogLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
              </div>
            ) : (
              <CatalogSignalsView
                catalogSignals={catalogSignals}
                orgSignals={signals as OrgSignalLike[]}
                trendPeriod={userViewTrendPeriod}
                trendDisplay={userViewTrendDisplay}
                readOnly
                otherSignals={filterOtherSignals(signals).map(orgSignalToSignalWithData)}
              />
            )}
          </div>

          <h3 className="text-sm font-semibold text-foreground pt-2">All signals (manage)</h3>
          {signals.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[200px] gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {signalCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedSignals.size === filteredSignals.length && filteredSignals.length > 0}
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
            </>
          )}

          <div className="space-y-2">
            {filteredSignals.map((signal) => {
              const sid = (signal as { id?: string; signal_id?: string }).id ?? (signal as { signal_id?: string }).signal_id
              return (
                <div key={sid} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedSignals.has(sid)}
                      onCheckedChange={() => toggleSignalSelection(sid)}
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
                      onClick={() => handleDeleteSignal(sid, signal.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {signals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No signals yet. Upload data to generate signals.
            </div>
          )}
          {signals.length > 0 && filteredSignals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No signals in this category.
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
                    onClick={async () => {
                      if (
                        !confirm(`Delete all ${signals.length} signals and their data points? This cannot be undone.`)
                      )
                        return
                      try {
                        const ids = signals.map((s) => (s as { id?: string; signal_id?: string }).id ?? (s as { signal_id?: string }).signal_id)
                        await deleteSignalsNeon(ids.filter(Boolean))
                        await loadOrgData()
                        toast({ title: "All signals deleted", description: `${signals.length} signal(s) and their data points have been removed.`, variant: "default" })
                      } catch (err) {
                        console.error(err)
                        toast({ title: "Failed to delete signals", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" })
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
                  {signals.slice(0, 5).map((signal) => {
                    const sid = (signal as { id?: string; signal_id?: string }).id ?? (signal as { signal_id?: string }).signal_id
                    return (
                      <div key={sid} className="flex items-center justify-between p-3 border rounded-lg">
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
                          onClick={() => handleDeleteSignal(sid, signal.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
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
                    ;(async () => {
                      try {
                        const signalIds = signals.map((s) => (s as { id?: string; signal_id?: string }).id ?? (s as { signal_id?: string }).signal_id).filter(Boolean)
                        await Promise.all([
                          ...uploads.map((u) => deleteOrgUpload(u.id, true)),
                          ...(signalIds.length > 0 ? [deleteSignalsNeon(signalIds)] : []),
                        ])
                        await loadOrgData()
                        toast({ title: "Organization data deleted", description: "All uploads and signals for this organisation have been removed.", variant: "default" })
                      } catch (err) {
                        console.error(err)
                        toast({ title: "Failed to delete data", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" })
                      }
                    })()
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
