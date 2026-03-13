"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { getUserProfileById, updateUserProfile } from "@/lib/admin-service"
import { getKPIsForRole } from "@/lib/kpi-templates"

export function UserProfileEditor({ userId }: { userId: string }) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availableKPIs, setAvailableKPIs] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      const data = await getUserProfileById(userId)
      setProfile(data)
      if (data?.role) {
        setAvailableKPIs(getKPIsForRole(data.role))
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      alert("Failed to load user profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      await updateUserProfile(userId, {
        full_name: profile.full_name,
        organization: profile.organization,
        role: profile.role,
        industry: profile.industry,
        business_context: profile.business_context,
        company_stage: profile.company_stage,
        team_size: profile.team_size,
        market: profile.market,
        competitors: profile.competitors,
        business_model: profile.business_model,
        kpi_1: profile.kpi_1,
        kpi_2: profile.kpi_2,
        kpi_3: profile.kpi_3,
      })
      alert("Profile updated successfully")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = (newRole: string) => {
    setProfile({ ...profile, role: newRole, kpi_1: "", kpi_2: "", kpi_3: "" })
    setAvailableKPIs(getKPIsForRole(newRole))
  }

  if (loading) {
    return <div className="text-center py-12">Loading user profile...</div>
  }

  if (!profile) {
    return <div className="text-center py-12">User not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit User Profile</h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={profile.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="User's full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={profile.organization || ""}
              onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
              placeholder="Company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={profile.role || ""} onValueChange={handleRoleChange}>
              <SelectTrigger id="role">
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
        </div>
      </Card>

      {/* Company Context */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Company Context</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyStage">Company Stage</Label>
            <Select
              value={profile.company_stage || ""}
              onValueChange={(value) => setProfile({ ...profile, company_stage: value })}
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
              value={profile.team_size || ""}
              onValueChange={(value) => setProfile({ ...profile, team_size: value })}
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
              value={profile.industry || ""}
              onValueChange={(value) => setProfile({ ...profile, industry: value })}
            >
              <SelectTrigger id="industry">
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
            <Label htmlFor="market">Market</Label>
            <Input
              id="market"
              value={profile.market || ""}
              onChange={(e) => setProfile({ ...profile, market: e.target.value })}
              placeholder="e.g., North America, Global, Enterprise, SMB"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="competitors">Competitors</Label>
            <Input
              id="competitors"
              value={profile.competitors || ""}
              onChange={(e) => setProfile({ ...profile, competitors: e.target.value })}
              placeholder="List key competitors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessModel">Business Model</Label>
            <Select
              value={profile.business_model || ""}
              onValueChange={(value) => setProfile({ ...profile, business_model: value })}
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
              value={profile.business_context || ""}
              onChange={(e) => setProfile({ ...profile, business_context: e.target.value })}
              placeholder="Describe the business context, goals, and challenges..."
              rows={4}
            />
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
        {profile.role ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kpi1">Primary KPI</Label>
              <Select value={profile.kpi_1 || ""} onValueChange={(value) => setProfile({ ...profile, kpi_1: value })}>
                <SelectTrigger id="kpi1">
                  <SelectValue placeholder="Select primary KPI" />
                </SelectTrigger>
                <SelectContent>
                  {availableKPIs.map((kpi) => (
                    <SelectItem key={kpi.value} value={kpi.value}>
                      {kpi.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kpi2">Secondary KPI</Label>
              <Select value={profile.kpi_2 || ""} onValueChange={(value) => setProfile({ ...profile, kpi_2: value })}>
                <SelectTrigger id="kpi2">
                  <SelectValue placeholder="Select secondary KPI" />
                </SelectTrigger>
                <SelectContent>
                  {availableKPIs.map((kpi) => (
                    <SelectItem key={kpi.value} value={kpi.value}>
                      {kpi.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kpi3">Tertiary KPI</Label>
              <Select value={profile.kpi_3 || ""} onValueChange={(value) => setProfile({ ...profile, kpi_3: value })}>
                <SelectTrigger id="kpi3">
                  <SelectValue placeholder="Select tertiary KPI" />
                </SelectTrigger>
                <SelectContent>
                  {availableKPIs.map((kpi) => (
                    <SelectItem key={kpi.value} value={kpi.value}>
                      {kpi.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a role first to configure KPIs</p>
        )}
      </Card>

      {/* Account Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Account Created</p>
            <p className="font-medium">{new Date(profile.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Updated</p>
            <p className="font-medium">{new Date(profile.updated_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Organization ID</p>
            <p className="font-medium font-mono text-xs">{profile.organization_id || "None"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Demo Mode</p>
            <p className="font-medium">{profile.demo_mode ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
