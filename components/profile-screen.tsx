"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BottomNavigation } from "@/components/bottom-navigation"
import { FixedHeader } from "@/components/fixed-header"
import { GroupSelector } from "@/components/group-selector"
import { UserTypeSelector } from "@/components/user-type-selector"
import { PermissionManager } from "@/components/permission-manager"
import { DataIntegrations } from "@/components/data-integrations"
import { AlertsModal } from "@/components/alerts-modal"
import { TeamManagement } from "@/components/team-management"
import { NotificationsModal } from "@/components/notifications-modal"
import { EditContextModal } from "@/components/edit-context-modal"
import { UploadDataModal } from "@/components/upload-data-modal"
import { IntegrationsModal } from "@/components/integrations-modal"
import { getUserProfile, updateUserProfile, getUserTypeLabel, getGroupLabel } from "@/lib/user-utils"
import { getUserSubscription } from "@/lib/plans"
import type { UserProfile, UserGroup, UserType } from "@/lib/types"
import { useRouter } from "next/navigation"
import { Bell, ChevronDown, ChevronRight, Edit, FileText, CreditCard, DollarSign, Package, Gift } from "lucide-react"
import { productCategories, productStages, businessStages } from "@/lib/profile-options"

export function ProfileScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedEmail, setEditedEmail] = useState("")
  const [editedGroups, setEditedGroups] = useState<UserGroup[]>([])
  const [editedUserType, setEditedUserType] = useState<UserType | null>(null)
  const [showAlerts, setShowAlerts] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false)

  const [expandedSections, setExpandedSections] = useState({
    yourContext: true,
    profileInfo: false,
    uploadedData: false,
    yourTeam: false,
    alerts: false,
    permissions: false,
    dataIntegrations: false,
    billing: false,
    usage: false,
  })

  const [userContext, setUserContext] = useState("")
  const [productCategory, setProductCategory] = useState("")
  const [productStage, setProductStage] = useState("")
  const [businessStage, setBusinessStage] = useState("")

  const [uploadedFiles, setUploadedFiles] = useState([
    { id: "1", name: "user_analytics_q4.csv", description: "Q4 user behavior data", uploadDate: "2024-01-15" },
    { id: "2", name: "conversion_funnel.xlsx", description: "Conversion funnel analysis", uploadDate: "2024-01-10" },
  ])

  const [integrations, setIntegrations] = useState([
    { id: "amplitude", name: "Amplitude", status: "connected", type: "analytics" },
    { id: "mixpanel", name: "Mixpanel", status: "disconnected", type: "analytics" },
    { id: "dovetail", name: "Dovetail", status: "connected", type: "research" },
  ])

  const [subscription, setSubscription] = useState<any>(null)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  useEffect(() => {
    const userProfile = getUserProfile()
    if (!userProfile) {
      router.push("/onboarding")
      return
    }
    setProfile(userProfile)
    setEditedName(userProfile.name)
    setEditedEmail(userProfile.email)
    setEditedGroups(userProfile.groups)
    setEditedUserType(userProfile.userType)
    setProductCategory(userProfile.productCategory || "")
    setProductStage(userProfile.productStage || "")
    setBusinessStage(userProfile.businessStage || "")

    const savedContext = localStorage.getItem("camino-user-context")
    if (savedContext) {
      setUserContext(savedContext)
    } else {
      setUserContext(
        "I'm Sarah Chen. As a Senior Product Manager at TechFlow, I want to increase user engagement by 25% in Q1 so that we can improve our retention metrics and drive revenue growth.",
      )
    }

    // Load subscription data
    const sub = getUserSubscription()
    setSubscription(sub)
  }, [router])

  const handleSave = () => {
    if (profile && editedUserType) {
      updateUserProfile({
        name: editedName,
        email: editedEmail,
        groups: editedGroups,
        userType: editedUserType,
        productCategory: productCategory,
        productStage: productStage,
        businessStage: businessStage,
      })
      setProfile({
        ...profile,
        name: editedName,
        email: editedEmail,
        groups: editedGroups,
        userType: editedUserType,
        productCategory: productCategory,
        productStage: productStage,
        businessStage: businessStage,
      })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditedName(profile.name)
      setEditedEmail(profile.email)
      setEditedGroups(profile.groups)
      setEditedUserType(profile.userType)
      setProductCategory(profile.productCategory || "")
      setProductStage(profile.productStage || "")
      setBusinessStage(profile.businessStage || "")
      setIsEditing(false)
    }
  }

  const handleContextUpdate = (newContext: string) => {
    setUserContext(newContext)
    localStorage.setItem("camino-user-context", newContext)
  }

  const getSelectedMetrics = () => {
    const selected = localStorage.getItem("camino-selected-metrics")
    if (selected) {
      try {
        return JSON.parse(selected)
      } catch {
        return []
      }
    }
    return []
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  const selectedMetrics = getSelectedMetrics()

  return (
    <div
      className="flex flex-col min-h-screen bg-background"
      style={{ paddingBottom: "max(5rem, calc(5rem + env(safe-area-inset-bottom)))", paddingTop: "4rem" }}
    >
      <FixedHeader onNotifications={() => setShowNotifications(true)} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection("yourContext")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {expandedSections.yourContext ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <CardTitle>Your Context</CardTitle>
              </div>
              {expandedSections.yourContext && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowEditModal(true)
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          {expandedSections.yourContext && (
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Your Statement</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{userContext}</p>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Role</p>
                <Badge variant="secondary">{profile.role || getUserTypeLabel(profile.userType)}</Badge>
              </div>

              {profile.goal && (
                <div>
                  <p className="text-sm font-medium mb-2">Goal</p>
                  <p className="text-sm text-muted-foreground">{profile.goal}</p>
                </div>
              )}

              {selectedMetrics.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Metrics Important to You</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMetrics.slice(0, 8).map((metric, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                    {selectedMetrics.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedMetrics.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Product Category</p>
                  <select
                    value={productCategory}
                    onChange={(e) => {
                      setProductCategory(e.target.value)
                      const currentProfile = getUserProfile()
                      const updatedProfile = { ...currentProfile, productCategory: e.target.value }
                      localStorage.setItem("camino-user-profile", JSON.stringify(updatedProfile))
                    }}
                    className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                  >
                    <option value="">Select category...</option>
                    {productCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Product Stage</p>
                  <select
                    value={productStage}
                    onChange={(e) => {
                      setProductStage(e.target.value)
                      const currentProfile = getUserProfile()
                      const updatedProfile = { ...currentProfile, productStage: e.target.value }
                      localStorage.setItem("camino-user-profile", JSON.stringify(updatedProfile))
                    }}
                    className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                  >
                    <option value="">Select stage...</option>
                    {productStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Business Stage</p>
                  <select
                    value={businessStage}
                    onChange={(e) => {
                      setBusinessStage(e.target.value)
                      const currentProfile = getUserProfile()
                      const updatedProfile = { ...currentProfile, businessStage: e.target.value }
                      localStorage.setItem("camino-user-profile", JSON.stringify(updatedProfile))
                    }}
                    className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                  >
                    <option value="">Select stage...</option>
                    {businessStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Profile Information - Collapsible */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => !isEditing && toggleSection("profileInfo")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {expandedSections.profileInfo ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <CardTitle>Profile Information</CardTitle>
              </div>
              {expandedSections.profileInfo && !isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                  }}
                >
                  Edit
                </Button>
              ) : expandedSections.profileInfo && isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCancel()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSave()
                    }}
                  >
                    Save
                  </Button>
                </div>
              ) : null}
            </div>
          </CardHeader>
          {expandedSections.profileInfo && (
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">User Type</label>
                    <UserTypeSelector value={editedUserType} onChange={setEditedUserType} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Teams</label>
                    <GroupSelector selectedGroups={editedGroups} onChange={setEditedGroups} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">User Type</p>
                    <p className="font-medium">{getUserTypeLabel(profile.userType)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teams</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.groups.map((group) => (
                        <Badge key={group} variant="secondary">
                          {getGroupLabel(group)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{profile.role || "Not specified"}</p>
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection("dataIntegrations")}>
            <div className="flex items-center gap-2">
              {expandedSections.dataIntegrations ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              <div>
                <CardTitle>Data Integrations</CardTitle>
                <CardDescription>Connect data sources and upload files</CardDescription>
              </div>
            </div>
          </CardHeader>
          {expandedSections.dataIntegrations && (
            <CardContent className="space-y-4">
              <DataIntegrations />

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 text-sm">Uploaded Files</h4>
                {uploadedFiles.length > 0 ? (
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.description}</p>
                          <p className="text-xs text-muted-foreground">Uploaded: {file.uploadDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data files uploaded yet.</p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Your Team - Collapsible */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection("yourTeam")}>
            <div className="flex items-center gap-2">
              {expandedSections.yourTeam ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <div>
                <CardTitle>Your Team</CardTitle>
                <CardDescription>Manage your teams and invite colleagues</CardDescription>
              </div>
            </div>
          </CardHeader>
          {expandedSections.yourTeam && (
            <CardContent>
              <TeamManagement />
            </CardContent>
          )}
        </Card>

        {/* Configure Alerts - Collapsible */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection("alerts")}>
            <div className="flex items-center gap-2">
              {expandedSections.alerts ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <div>
                <CardTitle>Configure Alerts</CardTitle>
                <CardDescription>Set up notifications for when signals trend up or down</CardDescription>
              </div>
            </div>
          </CardHeader>
          {expandedSections.alerts && (
            <CardContent>
              <Button onClick={() => setShowAlerts(true)} className="w-full" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Manage Alerts
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Permission Management - Collapsible (CEO only) */}
        {profile.userType === "ceo" && (
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection("permissions")}>
              <div className="flex items-center gap-2">
                {expandedSections.permissions ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <div>
                  <CardTitle>Permission Management</CardTitle>
                  <CardDescription>Manage user permissions for your organization</CardDescription>
                </div>
              </div>
            </CardHeader>
            {expandedSections.permissions && (
              <CardContent>
                <PermissionManager />
              </CardContent>
            )}
          </Card>
        )}

        {/* Billing Section */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection("billing")}>
            <div className="flex items-center gap-2">
              {expandedSections.billing ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <div>
                <CardTitle>Billing</CardTitle>
                <CardDescription>Manage your subscription and payments</CardDescription>
              </div>
            </div>
          </CardHeader>
          {expandedSections.billing && (
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => router.push("/plans")}
              >
                <Package className="w-4 h-4 mr-2" />
                View Plans
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => alert("Manage billing coming soon")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => alert("Buy credits coming soon")}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Buy Credits
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => alert("Redeem code coming soon")}
              >
                <Gift className="w-4 h-4 mr-2" />
                Redeem Code
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Usage Section */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection("usage")}>
            <div className="flex items-center gap-2">
              {expandedSections.usage ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              <div>
                <CardTitle>Usage</CardTitle>
                <CardDescription>Track your plan usage</CardDescription>
              </div>
            </div>
          </CardHeader>
          {expandedSections.usage && subscription && (
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Current Plan</span>
                  <Badge variant="secondary" className="capitalize">
                    {subscription.planType}
                  </Badge>
                </div>
                {subscription.status === "trial" && subscription.trialEndsAt && (
                  <p className="text-sm text-muted-foreground">
                    Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Signals Used</span>
                    <span className="font-medium">
                      {subscription.signalsUsed} /{" "}
                      {subscription.planType === "individual" ? 3 : subscription.planType === "team" ? 10 : 50}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(subscription.signalsUsed / (subscription.planType === "individual" ? 3 : subscription.planType === "team" ? 10 : 50)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Datasets Used</span>
                    <span className="font-medium">
                      {subscription.datasetsUsed} /{" "}
                      {subscription.planType === "individual" ? 3 : subscription.planType === "team" ? 10 : 20}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(subscription.datasetsUsed / (subscription.planType === "individual" ? 3 : subscription.planType === "team" ? 10 : 20)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <BottomNavigation currentPage="profile" />

      {/* Modals */}
      {showAlerts && <AlertsModal onClose={() => setShowAlerts(false)} />}
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
      {showEditModal && (
        <EditContextModal context={userContext} onSave={handleContextUpdate} onClose={() => setShowEditModal(false)} />
      )}
      {showUploadModal && (
        <UploadDataModal
          onUpload={(file) => {
            setUploadedFiles((prev) => [...prev, file])
          }}
          onClose={() => setShowUploadModal(false)}
        />
      )}
      {showIntegrationsModal && (
        <IntegrationsModal
          integrations={integrations}
          onUpdate={setIntegrations}
          onClose={() => setShowIntegrationsModal(false)}
        />
      )}
    </div>
  )
}
