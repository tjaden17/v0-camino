"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Database, ArrowRight, Check, Lock, Settings, CheckCircle2, Loader2, X } from "lucide-react"

interface DatasetConnectionFlowModalProps {
  dataset?: {
    id: string
    name: string
    description?: string
  }
  datasetName?: string
  onClose: () => void
  onComplete: () => void
}

type ConnectionStep = "auth" | "permissions" | "config" | "connecting" | "success"

export function DatasetConnectionFlowModal({
  dataset,
  datasetName,
  onClose,
  onComplete,
}: DatasetConnectionFlowModalProps) {
  const displayName = dataset?.name || datasetName || "Data Source"

  const [currentStep, setCurrentStep] = useState<ConnectionStep>("auth")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["read_data", "write_data"])
  const [syncFrequency, setSyncFrequency] = useState("hourly")

  const permissions = [
    { id: "read_data", label: "Read data", description: "Allow Camino to read your data", required: true },
    { id: "write_data", label: "Write data", description: "Allow Camino to write updates", required: false },
    { id: "manage_users", label: "Manage users", description: "Sync user information", required: false },
  ]

  const handleAuth = () => {
    setCurrentStep("permissions")
  }

  const handlePermissions = () => {
    setCurrentStep("config")
  }

  const handleConfig = () => {
    setCurrentStep("connecting")
    // Simulate connection process
    setTimeout(() => {
      setCurrentStep("success")
    }, 2000)
  }

  const handleFinish = () => {
    onComplete()
    onClose()
  }

  const togglePermission = (permissionId: string) => {
    const permission = permissions.find((p) => p.id === permissionId)
    if (permission?.required) return // Can't toggle required permissions

    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permissionId))
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Connect {displayName}</h2>
              <p className="text-sm text-muted-foreground">
                {currentStep === "auth" && "Step 1 of 4: Authentication"}
                {currentStep === "permissions" && "Step 2 of 4: Permissions"}
                {currentStep === "config" && "Step 3 of 4: Configuration"}
                {currentStep === "connecting" && "Step 4 of 4: Connecting"}
                {currentStep === "success" && "Complete"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Authentication Step */}
          {currentStep === "auth" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Lock className="w-5 h-5" />
                <h3 className="font-medium">Authenticate with {displayName}</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  Camino uses OAuth 2.0 to securely connect to your {displayName} account. We never store your password.
                </p>
              </div>
            </div>
          )}

          {/* Permissions Step */}
          {currentStep === "permissions" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Lock className="w-5 h-5" />
                <h3 className="font-medium">Grant Permissions</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Select what Camino can access in your {displayName} account
              </p>

              <div className="space-y-3">
                {permissions.map((permission) => (
                  <Card
                    key={permission.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedPermissions.includes(permission.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    } ${permission.required ? "opacity-50" : ""}`}
                    onClick={() => togglePermission(permission.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          selectedPermissions.includes(permission.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {selectedPermissions.includes(permission.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{permission.label}</p>
                          {permission.required && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Step */}
          {currentStep === "config" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Settings className="w-5 h-5" />
                <h3 className="font-medium">Configure Sync Settings</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Sync Frequency</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["hourly", "daily", "weekly"].map((freq) => (
                      <Card
                        key={freq}
                        className={`p-3 cursor-pointer text-center transition-colors ${
                          syncFrequency === freq ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
                        }`}
                        onClick={() => setSyncFrequency(freq)}
                      >
                        <p className="text-sm font-medium capitalize">{freq}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Label>Data to Sync</Label>
                  <div className="space-y-2 mt-2">
                    {["Contacts", "Deals", "Companies", "Activities"].map((dataType) => (
                      <div key={dataType} className="flex items-center gap-2 p-2 border rounded">
                        <div className="w-4 h-4 rounded border-2 bg-primary border-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm">{dataType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  Initial sync may take a few minutes. You'll receive a notification when complete.
                </p>
              </div>
            </div>
          )}

          {/* Connecting Step */}
          {currentStep === "connecting" && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h3 className="font-semibold text-lg mb-2">Connecting to {displayName}</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                We're establishing a secure connection and performing an initial data sync. This may take a moment...
              </p>
            </div>
          )}

          {/* Success Step */}
          {currentStep === "success" && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Successfully Connected!</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                {displayName} is now connected to Camino. Your data will sync {syncFrequency}.
              </p>
              <div className="w-full p-4 bg-muted/50 rounded-lg text-left">
                <p className="text-sm font-medium mb-2">What's next?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your signals will start appearing in the dashboard</li>
                  <li>• Initial sync will complete in 5-10 minutes</li>
                  <li>• You can configure alerts and notifications</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          {currentStep === "auth" && (
            <Button onClick={handleAuth} disabled={!authEmail || !authPassword}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {currentStep === "permissions" && (
            <Button onClick={handlePermissions}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {currentStep === "config" && (
            <Button onClick={handleConfig}>
              Connect
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {currentStep === "success" && (
            <Button onClick={handleFinish}>
              <Check className="w-4 h-4 mr-2" />
              Done
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
