"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { userProfile, dataIntegrations } from "@/lib/user-data"
import { demoProfiles, getMetricsForRole } from "@/lib/demo-profiles"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Shield, Bell, Mail, Eye, X, Plus } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { isDemoModeActive, getActiveDemoProfileId, enableDemoMode, exitDemoMode } from "@/lib/demo-mode"
import { type SubIssue, type Issue, issueTreeData } from "@/lib/issue-tree-data"

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
  const [profile, setProfile] = useState(userProfile)
  const [demoMode, setDemoMode] = useState(false)
  const [selectedDemoProfile, setSelectedDemoProfile] = useState<string>("")
  const [notificationSettings, setNotificationSettings] = useState({
    alertsEnabled: true,
    weeklyEmailEnabled: true,
    customAlertIssues: ["csat", "revenue-growth"],
  })
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [editableImportantToMe, setEditableImportantToMe] = useState<string[]>(profile.importantToMe || [])
  const [editableImportantToTeam, setEditableImportantToTeam] = useState<string[]>(profile.importantToTeam || [])
  const [editableImportantToCompany, setEditableImportantToCompany] = useState<string[]>(
    profile.importantToCompany || [],
  )
  const [allAvailableIssues, setAllAvailableIssues] = useState<string[]>([])

  useEffect(() => {
    console.log("[v0] Profile page mounted")
    const isDemo = isDemoModeActive()
    const profileId = getActiveDemoProfileId()

    console.log("[v0] Demo mode:", isDemo, "Profile ID:", profileId)

    setDemoMode(isDemo)
    if (isDemo && profileId) {
      setSelectedDemoProfile(profileId)
      const demoProfile = demoProfiles.find((p) => p.id === profileId)
      if (demoProfile) {
        setProfile({
          ...userProfile,
          name: demoProfile.name,
          role: demoProfile.role,
          businessUnit: demoProfile.businessUnit,
          company: demoProfile.company,
          importantToMe: demoProfile.importantToMe.map((m) => m.metric),
          importantToTeam: demoProfile.importantToTeam.map((m) => m.metric),
          importantToCompany: demoProfile.importantToCompany.map((m) => m.metric),
          productCategory: demoProfile.productCategory,
          productStage: demoProfile.productStage,
          businessStage: demoProfile.businessStage,
          defaultView: demoProfile.defaultView,
        })
      }
    }

    const issues = getAllIssuesFromTree()
    setAllAvailableIssues(issues)
  }, [])

  const handleDemoProfileChange = (profileId: string) => {
    console.log("[v0] Demo profile selected:", profileId)
    setSelectedDemoProfile(profileId)
    const demoProfile = demoProfiles.find((p) => p.id === profileId)
    if (demoProfile) {
      enableDemoMode(profileId)
      setProfile({
        ...profile,
        name: demoProfile.name,
        role: demoProfile.role,
        businessUnit: demoProfile.businessUnit,
        company: demoProfile.company,
        importantToMe: demoProfile.importantToMe.map((m) => m.metric),
        importantToTeam: demoProfile.importantToTeam.map((m) => m.metric),
        importantToCompany: demoProfile.importantToCompany.map((m) => m.metric),
        productCategory: demoProfile.productCategory,
        productStage: demoProfile.productStage,
        businessStage: demoProfile.businessStage,
        defaultView: demoProfile.defaultView,
      })

      console.log("[v0] Navigating to guidance with profile:", demoProfile.name)
      router.push("/guidance")
    }
  }

  const handleToggleDemoMode = () => {
    if (demoMode) {
      // Exit demo mode
      exitDemoMode()
      setDemoMode(false)
      setSelectedDemoProfile("")
      // Reset to original user profile
      setProfile(userProfile)
    } else {
      // Enter demo mode
      setDemoMode(true)
    }
  }

  const roleMetrics = getMetricsForRole(profile.role)

  // Handlers for updating important issues
  const handleUpdateImportantToMe = (index: number, value: string) => {
    const updated = [...editableImportantToMe]
    updated[index] = value
    setEditableImportantToMe(updated)
  }

  const handleAddImportantToMe = () => {
    setEditableImportantToMe([...editableImportantToMe, allAvailableIssues[0] || ""])
  }

  const handleRemoveImportantToMe = (index: number) => {
    setEditableImportantToMe(editableImportantToMe.filter((_, i) => i !== index))
  }

  const handleUpdateImportantToTeam = (index: number, value: string) => {
    const updated = [...editableImportantToTeam]
    updated[index] = value
    setEditableImportantToTeam(updated)
  }

  const handleAddImportantToTeam = () => {
    setEditableImportantToTeam([...editableImportantToTeam, allAvailableIssues[0] || ""])
  }

  const handleRemoveImportantToTeam = (index: number) => {
    setEditableImportantToTeam(editableImportantToTeam.filter((_, i) => i !== index))
  }

  const handleUpdateImportantToCompany = (index: number, value: string) => {
    const updated = [...editableImportantToCompany]
    updated[index] = value
    setEditableImportantToCompany(updated)
  }

  const handleAddImportantToCompany = () => {
    setEditableImportantToCompany([...editableImportantToCompany, allAvailableIssues[0] || ""])
  }

  const handleRemoveImportantToCompany = (index: number) => {
    setEditableImportantToCompany(editableImportantToCompany.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-primary-foreground">Profile</h1>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Demo Mode Toggle */}
        <Card className="p-5 bg-accent/10 border-accent/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Demo Mode</h2>
              <Button variant={demoMode ? "default" : "outline"} size="sm" onClick={handleToggleDemoMode}>
                {demoMode ? "Exit Demo" : "Enter Demo"}
              </Button>
            </div>
            {demoMode && (
              <div className="space-y-2">
                <Label htmlFor="demoProfile" className="text-sm">
                  Select Demo Profile
                </Label>
                <Select value={selectedDemoProfile} onValueChange={handleDemoProfileChange}>
                  <SelectTrigger id="demoProfile">
                    <SelectValue placeholder="Choose a profile..." />
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
            )}
          </div>
        </Card>

        {/* User Profile Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={profile.name} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={profile.role} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="businessUnit">Business Unit / Department</Label>
              <Input id="businessUnit" value={profile.businessUnit} readOnly className="mt-1" />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={profile.company} readOnly className="mt-1" />
            </div>
          </div>
        </Card>

        {/* What's Important Section - with metric dropdowns */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">What's Important</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="importantToMe">What's important to me, right now</Label>
              <div className="mt-2 space-y-2">
                {editableImportantToMe.map((metric, index) => (
                  <div key={index} className="flex gap-2">
                    <Select value={metric} onValueChange={(value) => handleUpdateImportantToMe(index, value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allAvailableIssues.map((issue) => (
                          <SelectItem key={issue} value={issue}>
                            {issue}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImportantToMe(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddImportantToMe} className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Issue
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="importantToTeam">What's important to my team</Label>
              <div className="mt-2 space-y-2">
                {editableImportantToTeam.map((metric, index) => (
                  <div key={index} className="flex gap-2">
                    <Select value={metric} onValueChange={(value) => handleUpdateImportantToTeam(index, value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allAvailableIssues.map((issue) => (
                          <SelectItem key={issue} value={issue}>
                            {issue}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImportantToTeam(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddImportantToTeam}
                  className="w-full bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Issue
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="importantToCompany">What's important to my company</Label>
              <div className="mt-2 space-y-2">
                {editableImportantToCompany.map((metric, index) => (
                  <div key={index} className="flex gap-2">
                    <Select value={metric} onValueChange={(value) => handleUpdateImportantToCompany(index, value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allAvailableIssues.map((issue) => (
                          <SelectItem key={issue} value={issue}>
                            {issue}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImportantToCompany(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddImportantToCompany}
                  className="w-full bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Issue
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* My Context Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">My Context</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productCategory">Product Category</Label>
              <Select value={profile.productCategory} disabled>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2B SaaS">B2B SaaS</SelectItem>
                  <SelectItem value="B2C SaaS">B2C SaaS</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="productStage">Product Stage</Label>
              <Select value={profile.productStage} disabled>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Early">Early</SelectItem>
                  <SelectItem value="Growth">Growth</SelectItem>
                  <SelectItem value="Mature">Mature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="businessStage">Business Stage</Label>
              <Select value={profile.businessStage} disabled>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B">Series B</SelectItem>
                  <SelectItem value="Series C+">Series C+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>
          <div className="space-y-4">
            {/* Alerts Toggle */}
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

            {/* Custom Alert Issues */}
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

            {/* Weekly Email Toggle */}
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

            {/* Preview Email Button */}
            {notificationSettings.weeklyEmailEnabled && (
              <Button variant="outline" size="sm" onClick={() => setShowEmailPreview(true)} className="w-full gap-2">
                <Eye className="h-4 w-4" />
                Preview Weekly Summary
              </Button>
            )}
          </div>
        </Card>

        {/* Data Integrations Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Enterprise-Grade Security</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All integrations use OAuth 2.0 authentication and enterprise-grade encryption. Your data is protected
                  with SOC 2 Type II compliance, end-to-end encryption, and never shared with third parties.
                </p>
              </div>
            </div>

            <h2 className="text-lg font-semibold">Data Integrations</h2>
            <div className="space-y-3">
              {dataIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <span className="font-medium">{integration.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.status === "connected" ? (
                      <>
                        <Badge variant="default" className="bg-success">
                          Connected
                        </Badge>
                        <CheckCircle className="h-5 w-5 text-success" />
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline">
                          Request
                        </Button>
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Integrations can be updated during onboarding, via this app, or through the admin control panel.
            </p>
          </div>
        </Card>
      </main>

      <BottomNav />

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Weekly Summary - Dec 16, 2024</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowEmailPreview(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">5 key trends impacting what's important this week</p>

              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <details key={i} className="group border rounded-lg">
                    <summary className="p-4 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">Customer Satisfaction Declining</h3>
                          <p className="text-sm text-muted-foreground mt-1">Down 8% to 72% in last 7 days</p>
                        </div>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                    </summary>
                    <div className="px-4 pb-4 pt-2 space-y-3 border-t">
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Key Takeaway</h4>
                        <p className="text-sm text-muted-foreground">
                          CSAT drop correlates with recent UI changes and increased support wait times
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Impact</h4>
                        <p className="text-sm text-muted-foreground">
                          If trend continues, churn risk increases 15% and NPS drops below industry benchmark
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Recommended Action</h4>
                        <p className="text-sm text-muted-foreground">
                          Roll back UI changes, increase support capacity, conduct user interviews
                        </p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
