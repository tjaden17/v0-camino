"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, ArrowRight, Key, Database, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type IntegrationProvider = {
  id: string
  name: string
  icon: string
  description: string
  authUrl?: string
}

type ConnectionWizardProps = {
  provider: IntegrationProvider | null
  open: boolean
  onClose: () => void
}

export function ConnectionWizardDialog({ provider, open, onClose }: ConnectionWizardProps) {
  const [step, setStep] = useState(1)
  const [apiKey, setApiKey] = useState("")
  const [domain, setDomain] = useState("")
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionSuccess, setConnectionSuccess] = useState(false)

  if (!provider) return null

  const handleTestConnection = async () => {
    setTestingConnection(true)

    // Simulate connection testing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setTestingConnection(false)
    setConnectionSuccess(true)
    setStep(4)
  }

  const handleComplete = () => {
    // Reset state
    setStep(1)
    setApiKey("")
    setDomain("")
    setConnectionSuccess(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{provider.icon}</span>
            <div>
              <DialogTitle>Connect {provider.name}</DialogTitle>
              <DialogDescription>{provider.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > num ? <CheckCircle2 className="h-5 w-5" /> : num}
              </div>
              {num < 4 && <div className={`flex-1 h-1 mx-2 ${step > num ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Overview */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">What you'll need</h3>
              <div className="space-y-3">
                <Card className="p-4">
                  <div className="flex gap-3">
                    <Key className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">API Credentials</p>
                      <p className="text-sm text-muted-foreground">
                        You'll need an API key or OAuth credentials from {provider.name}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex gap-3">
                    <Database className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Account Access</p>
                      <p className="text-sm text-muted-foreground">Admin access to your {provider.name} account</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Auto-Sync Setup</p>
                      <p className="text-sm text-muted-foreground">Configure which data to sync automatically</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This connection wizard demonstrates the setup process. For full OAuth integration, contact your
                administrator to configure {provider.name} OAuth credentials.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep(2)}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Credentials */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Enter Your Credentials</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="domain">{provider.id.includes("zoho") ? "Zoho Domain" : "Account Domain"}</Label>
                  <Input
                    id="domain"
                    placeholder={
                      provider.id.includes("zoho")
                        ? "yourcompany.zoho.com"
                        : provider.id === "hubspot"
                          ? "yourcompany.hubspot.com"
                          : "your-domain.com"
                    }
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key or Client ID</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Find this in your {provider.name} developer settings
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Demo Mode:</strong> This wizard shows the connection flow. In production, you'll be redirected
                to {provider.name} to authorize access via OAuth.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!domain || !apiKey}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Test Connection */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Test Connection</h3>
              <Card className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Domain</p>
                    <p className="text-sm text-muted-foreground">{domain}</p>
                  </div>
                  <Badge variant="outline">Provided</Badge>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">API Key</p>
                    <p className="text-sm text-muted-foreground">••••••••{apiKey.slice(-4)}</p>
                  </div>
                  <Badge variant="outline">Secured</Badge>
                </div>
              </Card>

              <p className="text-sm text-muted-foreground mt-4">
                We'll test the connection to ensure everything is set up correctly.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleTestConnection} disabled={testingConnection}>
                {testingConnection ? "Testing Connection..." : "Test Connection"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Connection Successful!</h3>
              <p className="text-muted-foreground mb-6">{provider.name} has been connected to your Camino account</p>

              <Card className="p-4 text-left space-y-3">
                <h4 className="font-medium">Next Steps:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Configure which metrics to sync automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Set up sync schedule (daily, weekly, or manual)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>View synced data in your Signals dashboard</span>
                  </li>
                </ul>
              </Card>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo Mode:</strong> This is a demonstration of the connection flow. To enable real data
                  syncing, your administrator needs to configure OAuth apps for each integration.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={handleComplete} className="w-full">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
