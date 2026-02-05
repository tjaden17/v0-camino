"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditContextModal } from "@/components/edit-context-modal"
import { AddContextModal } from "@/components/add-context-modal"
import { UploadDataModal } from "@/components/upload-data-modal"
import { IntegrationsModal } from "@/components/integrations-modal"
import { BottomNavigation } from "@/components/bottom-navigation"
import { FixedHeader } from "@/components/fixed-header"
import { NotificationsModal } from "@/components/notifications-modal"
import { Edit, Plus, Upload, Link, FileText, Database, BarChart3 } from "lucide-react"

export function IntelScreen() {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const [userContext, setUserContext] = useState("")

  useEffect(() => {
    const savedContext = localStorage.getItem("camino-user-context")
    if (savedContext) {
      setUserContext(savedContext)
    } else {
      setUserContext(
        "I'm Sarah Chen. As a Senior Product Manager at TechFlow, I want to increase user engagement by 25% in Q1 so that we can improve our retention metrics and drive revenue growth.",
      )
    }
  }, [])

  const [additionalContext, setAdditionalContext] = useState({
    businessKPIs: ["Monthly Active Users", "Customer Acquisition Cost", "Lifetime Value"],
    productKPIs: ["Feature Adoption Rate", "Time to Value", "User Engagement Score"],
    competitors: ["CompetitorA", "CompetitorB", "CompetitorC"],
    productCategory: "SaaS Analytics Platform",
    website: "https://techflow.com",
    deadlines: ["Q1 2024 - 25% engagement increase", "Q2 2024 - New feature launch"],
    constraints: ["Limited engineering resources", "Budget constraints for new tools"],
  })

  const [uploadedFiles, setUploadedFiles] = useState([
    { id: "1", name: "user_analytics_q4.csv", description: "Q4 user behavior data", uploadDate: "2024-01-15" },
    { id: "2", name: "conversion_funnel.xlsx", description: "Conversion funnel analysis", uploadDate: "2024-01-10" },
  ])

  const [integrations, setIntegrations] = useState([
    { id: "amplitude", name: "Amplitude", status: "connected", type: "analytics" },
    { id: "mixpanel", name: "Mixpanel", status: "disconnected", type: "analytics" },
    { id: "dovetail", name: "Dovetail", status: "connected", type: "research" },
  ])

  const handleContextUpdate = (newContext: string) => {
    setUserContext(newContext)
    localStorage.setItem("camino-user-context", newContext)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 pt-16">
      <FixedHeader onNotifications={() => setShowNotifications(true)} />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Your Context Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Your Context</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{userContext}</p>
          </CardContent>
        </Card>

        {/* Additional Context Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Additional Context</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Business KPIs */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Business KPIs</h4>
              <div className="flex flex-wrap gap-2">
                {additionalContext.businessKPIs.map((kpi, index) => (
                  <Badge key={index} variant="secondary">
                    {kpi}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Product KPIs */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Product KPIs</h4>
              <div className="flex flex-wrap gap-2">
                {additionalContext.productKPIs.map((kpi, index) => (
                  <Badge key={index} variant="secondary">
                    {kpi}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Competitors */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Competitors</h4>
              <div className="flex flex-wrap gap-2">
                {additionalContext.competitors.map((competitor, index) => (
                  <Badge key={index} variant="outline">
                    {competitor}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Product Category */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Product Category</h4>
              <p className="text-sm text-muted-foreground">{additionalContext.productCategory}</p>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Data Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Uploaded Data</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Integrations Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Data Integrations</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowIntegrationsModal(true)}>
              <Link className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    {integration.type === "analytics" ? (
                      <BarChart3 className="w-4 h-4" />
                    ) : (
                      <Database className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{integration.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{integration.type}</p>
                  </div>
                  <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                    {integration.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditContextModal context={userContext} onSave={handleContextUpdate} onClose={() => setShowEditModal(false)} />
      )}

      {showAddModal && (
        <AddContextModal
          context={additionalContext}
          onSave={setAdditionalContext}
          onClose={() => setShowAddModal(false)}
        />
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

      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
