"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Database, Settings, Zap, ArrowRight } from "lucide-react"

interface SignalConnectionGuideModalProps {
  signalName: string
  dataSource: string
  onClose: () => void
  onStartConnection: () => void
}

export function SignalConnectionGuideModal({
  signalName,
  dataSource,
  onClose,
  onStartConnection,
}: SignalConnectionGuideModalProps) {
  const steps = [
    {
      icon: Database,
      title: "Connect Your Data Source",
      description: `Authenticate and connect your ${dataSource} account securely. We'll guide you through the authorization process.`,
    },
    {
      icon: Settings,
      title: "Configure Access & Permissions",
      description: "Select which data to sync and set up permissions. You control exactly what data is shared.",
    },
    {
      icon: Zap,
      title: "Activate Signal",
      description: `Once connected, we'll automatically start tracking ${signalName} and surface insights in your dashboard.`,
    },
    {
      icon: CheckCircle2,
      title: "Start Getting Insights",
      description: "View real-time updates, trends, and actionable recommendations based on your data.",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b shrink-0">
          <CardTitle className="text-xl">How to Connect {signalName}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Follow these simple steps to start tracking this signal</p>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {index < steps.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                      <span>{step.title}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">What You'll Need</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Admin access to your {dataSource} account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>5 minutes to complete the setup</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Authorization to grant data access permissions</span>
              </li>
            </ul>
          </div>
        </CardContent>

        <div className="border-t p-4 flex gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={onStartConnection} className="flex-1 gap-2">
            Start Connection
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
