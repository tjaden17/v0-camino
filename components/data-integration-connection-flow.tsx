"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Loader2, Database, ExternalLink } from "lucide-react"

interface DataIntegrationConnectionFlowProps {
  datasetName: string
  onComplete: () => void
  onCancel: () => void
}

export function DataIntegrationConnectionFlow({
  datasetName,
  onComplete,
  onCancel,
}: DataIntegrationConnectionFlowProps) {
  const [step, setStep] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [accountId, setAccountId] = useState("")

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate connection process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsConnecting(false)
    setStep(step + 1)
  }

  const handleTest = async () => {
    setIsConnecting(true)
    // Simulate testing connection
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsConnecting(false)
    setStep(step + 1)
  }

  const handleComplete = () => {
    onComplete()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Connect {datasetName}</CardTitle>
            <CardDescription>Step {step} of 4</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Authentication Required</h3>
              <p className="text-sm text-muted-foreground">
                To connect {datasetName}, you'll need to provide your API credentials. This allows Camino to securely
                access your data.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID</Label>
                <Input
                  id="accountId"
                  placeholder="Enter your account ID"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Need help finding your credentials?</p>
                  <a href="#" className="text-primary hover:underline">
                    View {datasetName} integration guide →
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleConnect} disabled={!apiKey || !accountId || isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Configure Data Access</h3>
              <p className="text-sm text-muted-foreground">Select which data you want to sync from {datasetName}.</p>
            </div>

            <div className="space-y-3">
              {[
                "Historical data (last 12 months)",
                "Real-time updates",
                "User activity logs",
                "Performance metrics",
              ].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configuring...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Test Connection</h3>
              <p className="text-sm text-muted-foreground">
                We'll verify that the connection to {datasetName} is working correctly.
              </p>
            </div>

            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Credentials verified</p>
                  <p className="text-sm text-muted-foreground">API authentication successful</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Data access confirmed</p>
                  <p className="text-sm text-muted-foreground">Permissions granted</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
              <Button onClick={handleTest} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4 py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Connection Successful!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {datasetName} has been connected to Camino. Your data will begin syncing shortly.
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">What happens next?</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Initial data sync will complete in 5-10 minutes</li>
                <li>Real-time updates will be available once sync is complete</li>
                <li>You can view connection status in Data Integrations</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <Button onClick={handleComplete} className="w-full sm:w-auto">
                Done
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
