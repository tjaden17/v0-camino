"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Upload, Link2, Info, Sparkles } from "lucide-react"
import Link from "next/link"
import { DemoModeSelector } from "./demo-mode-selector"
import { clearDemoModeIfExists } from "@/lib/demo-mode-service"

export function EmptySignalsTips() {
  const [dismissedTips, setDismissedTips] = useState<string[]>([])
  const [showTips, setShowTips] = useState(true)
  const [showDemoDialog, setShowDemoDialog] = useState(false)

  useEffect(() => {
    clearDemoModeIfExists()

    const dismissed = localStorage.getItem("dismissedSignalTips")
    if (dismissed) {
      setDismissedTips(JSON.parse(dismissed))
    }
  }, [])

  const handleDismiss = (tipId: string) => {
    const newDismissed = [...dismissedTips, tipId]
    setDismissedTips(newDismissed)
    localStorage.setItem("dismissedSignalTips", JSON.stringify(newDismissed))
  }

  const handleShowAll = () => {
    setDismissedTips([])
    localStorage.removeItem("dismissedSignalTips")
  }

  const handleDemoModeComplete = () => {
    window.location.reload()
  }

  const tips = [
    {
      id: "demo-mode",
      icon: Sparkles,
      title: "Try Demo Mode",
      description:
        "Explore Camino with realistic mock data from Zoho CRM, Desk, and HubSpot. See how it works instantly.",
      actionText: "Enable Demo Mode",
      action: () => setShowDemoDialog(true),
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "connect-data",
      icon: Link2,
      title: "Connect Your Data Sources",
      description: "Link your Zoho CRM, Zoho Desk, or HubSpot accounts to automatically sync your business metrics.",
      actionText: "Connect Integrations",
      actionHref: "/integrations",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "upload-files",
      icon: Upload,
      title: "Upload Data Files",
      description: "Import CSV or Excel files containing your business metrics and historical data.",
      actionText: "Upload Data",
      actionHref: "/upload",
      color: "from-orange-500 to-amber-500",
    },
  ]

  const visibleTips = tips.filter((tip) => !dismissedTips.includes(tip.id))
  const hasHiddenTips = dismissedTips.length > 0

  if (!showTips || visibleTips.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Info className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">No Signals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by connecting your data sources or uploading files.
            </p>
          </div>
          {hasHiddenTips && (
            <Button variant="outline" onClick={handleShowAll}>
              Show Getting Started Tips
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Getting Started</h3>
          {hasHiddenTips && (
            <Button variant="ghost" size="sm" onClick={handleShowAll}>
              Show all tips
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleTips.map((tip) => {
            const Icon = tip.icon
            return (
              <Card key={tip.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tip.color}`} />
                <CardContent className="pt-6">
                  <button
                    onClick={() => handleDismiss(tip.id)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
                    aria-label="Dismiss tip"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>

                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tip.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h4 className="font-semibold mb-2">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{tip.description}</p>

                  {tip.actionHref ? (
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href={tip.actionHref}>{tip.actionText}</Link>
                    </Button>
                  ) : (
                    <Button onClick={tip.action} variant="outline" className="w-full bg-transparent">
                      {tip.actionText}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <DemoModeSelector open={showDemoDialog} onOpenChange={setShowDemoDialog} onComplete={handleDemoModeComplete} />
    </>
  )
}
