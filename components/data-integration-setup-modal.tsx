"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ArrowRight, ArrowLeft } from "lucide-react"
import { addNotification } from "@/lib/notification-utils"
import { getUserProfile } from "@/lib/user-utils"
import { getSignalById, type SignalTemplate } from "@/lib/signal-templates"

interface DataIntegrationSetupModalProps {
  signalName?: string
  signalId?: string
  requestedBy?: { name: string; email: string }
  onClose: () => void
  preSelectedSignal?: string
}

export function DataIntegrationSetupModal({
  signalName = "New Signal",
  signalId,
  requestedBy,
  onClose,
}: DataIntegrationSetupModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null)
  const [selectedSignals, setSelectedSignals] = useState<string[]>([])

  const profile = getUserProfile()

  const signalDetails: SignalTemplate | undefined = signalId ? getSignalById(signalId) : undefined

  const dataSources = [
    { id: "hubspot", name: "HubSpot", icon: "🔶", description: "CRM and sales data" },
    { id: "salesforce", name: "Salesforce", icon: "☁️", description: "Sales and customer data" },
    { id: "google-analytics", name: "Google Analytics", icon: "📊", description: "Website and user analytics" },
    { id: "stripe", name: "Stripe", icon: "💳", description: "Payment and subscription data" },
  ]

  const availableSignals = signalDetails
    ? [{ id: signalDetails.id, name: signalDetails.name, description: signalDetails.description }]
    : [
        { id: "win-loss", name: "Win/Loss Rate", description: "Track sales win and loss rates" },
        { id: "lead-velocity", name: "Lead Velocity", description: "Rate of new leads over time" },
        { id: "conversion-rate", name: "Conversion Rate", description: "Lead to customer conversion" },
        { id: "pipeline-value", name: "Pipeline Value", description: "Total pipeline value" },
      ]

  const handleNext = () => {
    if (currentStep === 1 && selectedDataSource) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedSignals.length > 0) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      if (profile) {
        addNotification({
          type: "signal_added",
          title: "Signal Added",
          message: `${profile.name} has set up the "${signalName}" signal. It's now available on your dashboard.`,
          from: {
            name: profile.name,
            email: profile.email,
          },
          signalName,
          actionRequired: false,
          read: false,
        })
        window.dispatchEvent(new Event("notificationsUpdated"))
      }
      onClose()
    }
  }

  const toggleSignal = (signalId: string) => {
    setSelectedSignals((prev) => (prev.includes(signalId) ? prev.filter((id) => id !== signalId) : [...prev, signalId]))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step < currentStep
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 3 && <div className="w-12 h-0.5 bg-muted mx-2" />}
              </div>
            ))}
          </div>

          {/* Request Info */}
          {requestedBy && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium mb-1">
                {requestedBy.name} would like to view "{signalName}" in Camino
              </p>
              <p className="text-sm text-muted-foreground">
                This signal helps your organization progress towards your business goals. Let's get it set up in 3
                simple steps.
              </p>
            </div>
          )}

          {/* Step 1: Connect Data Source */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Let's connect to {signalDetails?.dataSource || "your data source"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {signalDetails
                  ? `To track ${signalName}, we'll need to connect to ${signalDetails.dataSource}. Just click the button below to authorize the connection.`
                  : "Choose where your data lives. We'll securely connect and only access the data you specify."}
              </p>
              <div className="space-y-3 mb-6">
                {dataSources.map((source) => (
                  <Card
                    key={source.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedDataSource === source.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedDataSource(source.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{source.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold mb-0.5">{source.name}</p>
                        <p className="text-sm text-muted-foreground">{source.description}</p>
                      </div>
                      {selectedDataSource === source.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  🔒 Your data is secure. We use OAuth authentication and only access the specific fields needed for
                  your signals.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Choose Signals with Field Mapping */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {signalDetails ? `We found ${signalName} in your ${selectedDataSource}` : "Choose your signals"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {signalDetails
                  ? `Here's what we'll track and where it comes from:`
                  : "Select which metrics you want to track. You can always add more later."}
              </p>

              {signalDetails && signalDetails.hubspotFields && (
                <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold mb-3 text-sm">Field Mapping</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-3 bg-background rounded border">
                        <p className="text-xs text-muted-foreground mb-1">What Camino needs</p>
                        <p className="text-sm font-medium">{signalDetails.name}</p>
                      </div>
                      <div className="text-primary font-bold">→</div>
                      <div className="flex-1 p-3 bg-background rounded border">
                        <p className="text-xs text-muted-foreground mb-1">From {signalDetails.dataSource}</p>
                        <div className="space-y-1">
                          {signalDetails.hubspotFields.map((field, idx) => (
                            <p key={idx} className="text-xs font-medium">
                              • {field}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{signalDetails.explanation}</p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {availableSignals.map((signal) => (
                  <Card
                    key={signal.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedSignals.includes(signal.id)
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleSignal(signal.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold mb-1">{signal.name}</p>
                        <p className="text-sm text-muted-foreground">{signal.description}</p>
                      </div>
                      {selectedSignals.includes(signal.id) && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Complete with Preview */}
          {currentStep === 3 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">You're all set!</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Your signals are now connected and will appear on your dashboard. {requestedBy?.name} will be notified
                that everything is ready.
              </p>

              <div className="p-4 bg-muted/50 rounded-lg text-left mb-6">
                <p className="text-sm font-semibold mb-3">Connected Signals:</p>
                <div className="space-y-2">
                  {selectedSignals.map((signalId) => {
                    const signal = availableSignals.find((s) => s.id === signalId)
                    const signalTemplate = getSignalById(signalId)
                    return (
                      <div key={signalId} className="p-3 bg-background rounded border">
                        <div className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-0.5">{signal?.name}</p>
                            {signalTemplate?.whyItMatters && (
                              <p className="text-xs text-muted-foreground">{signalTemplate.whyItMatters}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  💡 Your signals will update automatically. You can customize how they appear on your dashboard
                  anytime.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {currentStep > 1 && currentStep < 3 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !selectedDataSource) || (currentStep === 2 && selectedSignals.length === 0)
              }
              className="flex-1"
              size="lg"
            >
              {currentStep === 3 ? "View Dashboard" : "Continue"}
              {currentStep < 3 && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
