"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Bell, Mail, Eye, LogOut, Key, Building2, Users, UserPlus } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { createBrowserClient } from "@/lib/supabase/client"
import { type SubIssue, type Issue, issueTreeData } from "@/lib/issue-tree-data"
import { demoProfiles } from "@/lib/demo-profiles"
import { enableDemoMode, exitDemoMode, isDemoModeActive, getActiveDemoProfileId } from "@/lib/demo-mode"
import { ChangePasswordModal } from "@/components/change-password-modal"
import { useToast } from "@/hooks/use-toast"
import { getKPIsForRole } from "@/lib/kpi-templates"
import {
  createOrganization,
  inviteUserToOrganization,
  getOrganizationMembers,
  updateMemberRole,
  removeMember,
} from "@/lib/organization-service"

function getAllIssuesFromTree(node: SubIssue | Issue = issueTreeData, issues: string[] = []): string[] {
  issues.push(node.name)
  if ("subIssues" in node && node.subIssues) {
    for (const subIssue of node.subIssues) {
      getAllIssuesFromTree(subIssue, issues)
    }
  }
  return issues
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState({
    organization: "",
    industry: "",
    role: "",
    business_context: "",
    full_name: "",
    company_stage: "",
    team_size: "",
    market: "",
    competitors: "",
    business_model: "",
    kpi_1: "",
    kpi_2: "",
    kpi_3: "",
    organization_id: null as string | null,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    alertsEnabled: true,
    weeklyEmailEnabled: true,
    customAlertIssues: ["csat", "revenue-growth"],
  })
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [allAvailableIssues, setAllAvailableIssues] = useState<string[]>([])
  const supabase = createBrowserClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [inDemoMode, setInDemoMode] = useState(false)
  const [selectedDemoProfileId, setSelectedDemoProfileId] = useState<string>("")
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [availableKPIs, setAvailableKPIs] = useState<Array<{ value: string; label: string }>>([])
  const [showCreateOrg, setShowCreateOrg] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [showInviteUser, setShowInviteUser] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "read-only">("read-only")
  const [orgMembers, setOrgMembers] = useState<any[]>([])
  const [userOrgRole, setUserOrgRole] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState<string | null>(null)
  const { toast } = useToast()
  /** Signal names (and categories) from uploaded data – "what the data has" for KPI suggestions */
  const [signalNamesFromData, setSignalNamesFromData] = useState<string[]>([])

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      if (user.email === "admin@admin.com") {
        setIsAdmin(true)
        setInDemoMode(isDemoModeActive())
        const activeDemoId = getActiveDemoProfileId()
        if (activeDemoId) {
          setSelectedDemoProfileId(activeDemoId)
        }
      }

      // Load from Neon first (source of truth for KPIs, role, full_name – used by Signals page)
      const neonRes = await fetch("/api/user/profile")
      if (neonRes.ok) {
        const { profile: neonProfile } = await neonRes.json()
        if (neonProfile) {
          setProfile((prev) => ({
            ...prev,
            role: neonProfile.role || prev.role,
            full_name: neonProfile.full_name || prev.full_name,
            kpi_1: neonProfile.kpi_1 || "",
            kpi_2: neonProfile.kpi_2 || "",
            kpi_3: neonProfile.kpi_3 || "",
            organization_id: neonProfile.organization_id ?? prev.organization_id,
          }))
          if (neonProfile.role) {
            setAvailableKPIs(getKPIsForRole(neonProfile.role))
          }
          if (neonProfile.organization_id) {
            loadOrganizationMembers(neonProfile.organization_id, user.id)
          }
        }
      }

      // Merge in Supabase profile if present (extra fields: organization name, industry, etc.)
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profileData && !error) {
        setProfile((prev) => ({
          ...prev,
          organization: profileData.organization || prev.organization,
          industry: profileData.industry || prev.industry,
          role: profileData.role || prev.role,
          business_context: profileData.business_context || prev.business_context,
          full_name: profileData.full_name || prev.full_name,
          company_stage: profileData.company_stage || prev.company_stage,
          team_size: profileData.team_size || prev.team_size,
          market: profileData.market || prev.market,
          competitors: profileData.competitors || prev.competitors,
          business_model: profileData.business_model || prev.business_model,
          kpi_1: profileData.kpi_1 ?? prev.kpi_1,
          kpi_2: profileData.kpi_2 ?? prev.kpi_2,
          kpi_3: profileData.kpi_3 ?? prev.kpi_3,
          organization_id: profileData.organization_id ?? prev.organization_id,
        }))
        if (profileData.role) {
          setAvailableKPIs(getKPIsForRole(profileData.role))
        }
        if (profileData.organization_id) {
          loadOrganizationMembers(profileData.organization_id, user.id)
          const { data: orgData } = await supabase
            .from("organizations")
            .select("name")
            .eq("id", profileData.organization_id)
            .single()
          if (orgData) {
            setOrganizationName(orgData.name)
          }
        }
      }
    }

    loadProfile()

    const issues = getAllIssuesFromTree()
    setAllAvailableIssues(issues)
  }, [router, supabase])

  // Load "what the data has" (signal names in this org) for KPI suggestions
  useEffect(() => {
    if (!profile.organization_id) {
      setSignalNamesFromData([])
      return
    }
    let cancelled = false
    fetch("/api/signals/names")
      .then((res) => (res.ok ? res.json() : { names: [], categories: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.names)) {
          const names = [...(data.names || [])]
          if (Array.isArray(data.categories)) names.push(...(data.categories || []))
          setSignalNamesFromData([...new Set(names)])
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [profile.organization_id])

  async function loadOrganizationMembers(orgId: string, currentUserId: string) {
    try {
      const members = await getOrganizationMembers(orgId)
      setOrgMembers(members)

      const currentMember = members.find((m: any) => m.user_id === currentUserId)
      if (currentMember) {
        setUserOrgRole(currentMember.role)
      }
    } catch (error) {
      console.error("[v0] Error loading organization members:", error)
    }
  }

  const handleSaveProfile = async () => {
    if (!userId) return

    setIsSaving(true)
    try {
      // Save to Neon first (source of truth for KPIs – used by Signals page for prioritisation)
      const patchRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kpi_1: profile.kpi_1 || null,
          kpi_2: profile.kpi_2 || null,
          kpi_3: profile.kpi_3 || null,
          full_name: profile.full_name || null,
          role: profile.role || null,
        }),
      })

      if (!patchRes.ok) {
        const err = await patchRes.json().catch(() => ({}))
        toast({
          title: "Could not save profile",
          description: err?.error ?? "Please try again.",
          variant: "destructive",
        })
        return
      }

      // Optionally sync to Supabase for backwards compatibility (don't block on it)
      const { error } = await supabase
        .from("profiles")
        .update({
          organization: profile.organization,
          industry: profile.industry,
          role: profile.role,
          business_context: profile.business_context,
          full_name: profile.full_name,
          company_stage: profile.company_stage,
          team_size: profile.team_size,
          market: profile.market,
          competitors: profile.competitors,
          business_model: profile.business_model,
          kpi_1: profile.kpi_1,
          kpi_2: profile.kpi_2,
          kpi_3: profile.kpi_3,
        })
        .eq("id", userId)

      if (error) {
        console.error("[v0] Supabase profile update failed (Neon save succeeded):", error)
      }

      toast({ title: "Profile saved", description: "Your KPIs and details are saved. Prioritised signals will update on the Signals page." })
      setIsEditing(false)
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast({
        title: "Could not save profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRoleChange = (newRole: string) => {
    setProfile({ ...profile, role: newRole })
    setAvailableKPIs(getKPIsForRole(newRole))
  }

  const handleCreateOrganization = async () => {
    if (!userId || !newOrgName.trim()) return

    try {
const org = await createOrganization(newOrgName, userId)
        setProfile({ ...profile, organization_id: org.id })
        setOrganizationName(newOrgName)
        setShowCreateOrg(false)
        setNewOrgName("")
        await loadOrganizationMembers(org.id, userId)
    } catch (error) {
      console.error("[v0] Error creating organization:", error)
      alert("Failed to create organization")
    }
  }

  const handleInviteUser = async () => {
    if (!userId || !profile.organization_id || !inviteEmail.trim()) return

    try {
      await inviteUserToOrganization(profile.organization_id, inviteEmail, inviteRole, userId)
      setShowInviteUser(false)
      setInviteEmail("")
      setInviteRole("read-only")
      await loadOrganizationMembers(profile.organization_id, userId)
    } catch (error: any) {
      console.error("[v0] Error inviting user:", error)
      alert(error.message || "Failed to invite user")
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: "admin" | "read-only") => {
    try {
      await updateMemberRole(memberId, newRole)
      if (profile.organization_id) {
        await loadOrganizationMembers(profile.organization_id, userId!)
      }
    } catch (error) {
      console.error("[v0] Error updating member role:", error)
      alert("Failed to update member role")
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      await removeMember(memberId)
      if (profile.organization_id) {
        await loadOrganizationMembers(profile.organization_id, userId!)
      }
    } catch (error) {
      console.error("[v0] Error removing member:", error)
      alert("Failed to remove member")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleExitDemoMode = async () => {
    await exitDemoMode()
    setInDemoMode(false)
  }

  const handleEnableDemoMode = async () => {
    if (!selectedDemoProfileId) return

    await enableDemoMode(selectedDemoProfileId)
    setInDemoMode(true)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-primary-foreground">Profile</h1>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {isAdmin && (
          <Card className="max-w-full border-2 border-primary">
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold">Admin: Demo Mode</h2>
              </div>

              {inDemoMode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium text-primary mb-1">Demo Mode Active</p>
                    <p className="text-xs text-muted-foreground">
                      Currently viewing as:{" "}
                      {demoProfiles.find((p) => p.id === selectedDemoProfileId)?.name || "Unknown"}
                    </p>
                  </div>
                  <Button onClick={handleExitDemoMode} variant="outline" className="w-full bg-transparent">
                    Exit Demo Mode
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demoProfile">Select Demo Profile</Label>
                    <Select value={selectedDemoProfileId} onValueChange={setSelectedDemoProfileId}>
                      <SelectTrigger id="demoProfile">
                        <SelectValue placeholder="Choose a demo profile..." />
                      </SelectTrigger>
                      <SelectContent>
                        {demoProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name} - {profile.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleEnableDemoMode} disabled={!selectedDemoProfileId} className="w-full">
                    Enable Demo Mode
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Demo mode allows you to view the app as different user personas with pre-configured data and
                    settings.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        <Card className="max-w-full">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Your Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile()
                  } else {
                    setIsEditing(true)
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : isEditing ? "Save" : "Edit"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={profile.organization}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Your company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={profile.role} onValueChange={handleRoleChange} disabled={!isEditing}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
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
            </div>
          </div>
        </Card>

        <Card className="max-w-full">
          <div className="p-5 space-y-4">
            <h2 className="text-base font-semibold">Role & Context</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyStage">Company Stage</Label>
                <Select
                  value={profile.company_stage}
                  onValueChange={(value) => setProfile({ ...profile, company_stage: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="companyStage">
                    <SelectValue placeholder="Select company stage" />
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
                <Label htmlFor="teamSize">Team Size</Label>
                <Select
                  value={profile.team_size}
                  onValueChange={(value) => setProfile({ ...profile, team_size: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="teamSize">
                    <SelectValue placeholder="Select team size" />
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
                <Label htmlFor="industry">Industry/Vertical</Label>
                <Select
                  value={profile.industry}
                  onValueChange={(value) => setProfile({ ...profile, industry: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select your industry" />
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
                <Label htmlFor="market">Market</Label>
                <Input
                  id="market"
                  value={profile.market}
                  onChange={(e) => setProfile({ ...profile, market: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., North America, Global, Enterprise, SMB"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitors">Competitors</Label>
                <Input
                  id="competitors"
                  value={profile.competitors}
                  onChange={(e) => setProfile({ ...profile, competitors: e.target.value })}
                  disabled={!isEditing}
                  placeholder="List key competitors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessModel">Business Model</Label>
                <Select
                  value={profile.business_model}
                  onValueChange={(value) => setProfile({ ...profile, business_model: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="businessModel">
                    <SelectValue placeholder="Select business model" />
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

              <div className="space-y-2">
                <Label htmlFor="businessContext">Business Context</Label>
                <Textarea
                  id="businessContext"
                  value={profile.business_context}
                  onChange={(e) => setProfile({ ...profile, business_context: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Describe your top priorities and business context"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="max-w-full">
          <div className="p-5 space-y-4">
            <h2 className="text-base font-semibold">Your KPIs</h2>
            <p className="text-sm text-muted-foreground">
              Choose up to 3 metrics that matter most to you. Type your own (e.g. monthly pipeline value, win rate, CSAT) or pick from suggestions. Matching signals will be prioritised on the Signals page.
            </p>
            {signalNamesFromData.length > 0 && (
              <p className="text-xs text-muted-foreground">
                In your data: {signalNamesFromData.slice(0, 12).join(", ")}
                {signalNamesFromData.length > 12 ? ` +${signalNamesFromData.length - 12} more` : ""}
              </p>
            )}

            <div className="space-y-4">
              {[
                { key: "kpi_1" as const, id: "kpi1", label: "KPI 1" },
                { key: "kpi_2" as const, id: "kpi2", label: "KPI 2" },
                { key: "kpi_3" as const, id: "kpi3", label: "KPI 3" },
              ].map(({ key, id, label }) => {
                const roleLabels = availableKPIs.map((k) => k.label)
                const suggestions = [...new Set([...signalNamesFromData, ...roleLabels])].filter(Boolean).sort((a, b) => a.localeCompare(b))
                return (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={id}>{label}</Label>
                    <Input
                      id={id}
                      list={`kpi-datalist-${id}`}
                      value={profile[key]}
                      onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g. Win rate, Pipeline value, CSAT"
                      className="bg-background"
                    />
                    <datalist id={`kpi-datalist-${id}`}>
                      {suggestions.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <Card className="max-w-full">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <h2 className="text-base font-semibold">Organization</h2>
              </div>
              {!profile.organization_id && (
                <Button size="sm" onClick={() => setShowCreateOrg(true)}>
                  Create Organization
                </Button>
              )}
            </div>

            {showCreateOrg && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Enter organization name"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateOrganization} size="sm">
                    Create
                  </Button>
                  <Button onClick={() => setShowCreateOrg(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {profile.organization_id && (
              <div className="space-y-4">
                {organizationName && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">{organizationName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Team Members ({orgMembers.length})</span>
                  </div>
                  {userOrgRole === "admin" && (
                    <Button size="sm" variant="outline" onClick={() => setShowInviteUser(true)}>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Invite
                    </Button>
                  )}
                </div>

                {showInviteUser && (
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inviteRole">Permission Level</Label>
                      <Select value={inviteRole} onValueChange={(value: "admin" | "read-only") => setInviteRole(value)}>
                        <SelectTrigger id="inviteRole">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin - Full access</SelectItem>
                          <SelectItem value="read-only">Read-only - View only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleInviteUser} size="sm">
                        Send Invite
                      </Button>
                      <Button onClick={() => setShowInviteUser(false)} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {orgMembers.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{member.profiles?.full_name || member.profiles?.email}</p>
                        <p className="text-xs text-muted-foreground">{member.profiles?.role || "No role set"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {userOrgRole === "admin" && member.user_id !== userId ? (
                          <>
                            <Select
                              value={member.role}
                              onValueChange={(value: "admin" | "read-only") => handleUpdateMemberRole(member.id, value)}
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="read-only">Read-only</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveMember(member.id)}
                              className="h-8"
                            >
                              Remove
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            {member.role === "admin" ? "Admin" : "Read-only"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!profile.organization_id && !showCreateOrg && (
              <p className="text-sm text-muted-foreground">
                Create an organization to invite team members and collaborate.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="alerts-toggle" className="font-medium">
                  Trend Alerts
                </Label>
                <p className="text-xs text-muted-foreground">Get notified of significant changes</p>
              </div>
              <Button
                id="alerts-toggle"
                variant={notificationSettings.alertsEnabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setNotificationSettings({
                    ...notificationSettings,
                    alertsEnabled: !notificationSettings.alertsEnabled,
                  })
                }
              >
                {notificationSettings.alertsEnabled ? "On" : "Off"}
              </Button>
            </div>

            {notificationSettings.alertsEnabled && (
              <div>
                <Label className="text-sm mb-2 block">Alert me about these issues</Label>
                <div className="space-y-2">
                  <Select value="csat" disabled>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select issue..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csat">Customer Satisfaction (CSAT)</SelectItem>
                      <SelectItem value="revenue-growth">Revenue Growth</SelectItem>
                      <SelectItem value="support-volume">Support Ticket Volume</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="revenue-growth" disabled>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csat">Customer Satisfaction (CSAT)</SelectItem>
                      <SelectItem value="revenue-growth">Revenue Growth</SelectItem>
                      <SelectItem value="support-volume">Support Ticket Volume</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label htmlFor="email-toggle" className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Weekly Email Summary
                </Label>
                <p className="text-xs text-muted-foreground">Receive top 5 trends every Monday</p>
              </div>
              <Button
                id="email-toggle"
                variant={notificationSettings.weeklyEmailEnabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setNotificationSettings({
                    ...notificationSettings,
                    weeklyEmailEnabled: !notificationSettings.weeklyEmailEnabled,
                  })
                }
              >
                {notificationSettings.weeklyEmailEnabled ? "On" : "Off"}
              </Button>
            </div>

            {notificationSettings.weeklyEmailEnabled && (
              <Button variant="outline" size="sm" onClick={() => setShowEmailPreview(true)} className="w-full gap-2">
                <Eye className="h-4 w-4" />
                Preview Weekly Summary
              </Button>
            )}
          </div>
        </Card>

        <Card className="max-w-full">
          <div className="p-5 space-y-4">
            <h2 className="text-base font-semibold">Account</h2>
            <Button onClick={() => setShowChangePassword(true)} variant="outline" className="w-full bg-transparent">
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </Card>
      </main>

      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />

      <BottomNav />
    </div>
  )
}
