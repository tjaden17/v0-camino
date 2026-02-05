"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, Mail, Plus, Database } from "lucide-react"
import { getAllRequiredDatasets } from "@/lib/metrics-by-role"
import { addNotification } from "@/lib/notification-utils"
import { getUserProfile } from "@/lib/user-utils"
import type { MetricRecommendation } from "@/lib/metrics-by-role"

interface YourDatasetsScreenProps {
  selectedMetrics: MetricRecommendation[]
  onNext: () => void
  onBack: () => void
}

export function YourDatasetsScreen({ selectedMetrics, onNext, onBack }: YourDatasetsScreenProps) {
  const requiredDatasets = getAllRequiredDatasets(selectedMetrics)
  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(new Set(requiredDatasets))
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteSent, setInviteSent] = useState(false)
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherDataset, setOtherDataset] = useState("")
  const [customDatasets, setCustomDatasets] = useState<string[]>([])

  const handleToggleDataset = (dataset: string) => {
    const newSelected = new Set(selectedDatasets)
    if (newSelected.has(dataset)) {
      newSelected.delete(dataset)
    } else {
      newSelected.add(dataset)
    }
    setSelectedDatasets(newSelected)
  }

  const handleAddOtherDataset = () => {
    if (otherDataset.trim()) {
      const trimmedDataset = otherDataset.trim()
      setCustomDatasets([...customDatasets, trimmedDataset])
      handleToggleDataset(trimmedDataset)
      setOtherDataset("")
      setShowOtherInput(false)
    }
  }

  const handleInviteTeamMember = () => {
    if (!inviteEmail) return

    const currentUser = getUserProfile()

    addNotification({
      type: "data_connection_request",
      title: "Dataset Connection Request",
      message: `${currentUser?.name || "Team member"} has requested you to connect datasets: ${Array.from(selectedDatasets).join(", ")}`,
      from: {
        name: currentUser?.name || "Team Member",
        email: currentUser?.email || "",
      },
      actionRequired: true,
      read: false,
      metadata: {
        requestedDatasets: Array.from(selectedDatasets),
        invitedEmail: inviteEmail,
      },
    })

    setInviteSent(true)
    setTimeout(() => {
      onNext()
    }, 1500)
  }

  const handleContinue = () => {
    localStorage.setItem("camino-selected-datasets", JSON.stringify(Array.from(selectedDatasets)))
    onNext()
  }

  if (inviteSent) {
    return (
      <div className="flex flex-col min-h-screen bg-background px-4 py-8 items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Invitation Sent!</h2>
          <p className="text-muted-foreground">
            We've sent an invitation to {inviteEmail} to connect the datasets. They'll receive an email and
            notification.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 py-8 max-w-full overflow-x-hidden">
      <header className="flex items-center justify-between mb-8 w-full">
        <h1 className="text-2xl font-bold text-primary">Camino</h1>
      </header>

      <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance px-2">Your Datasets</h2>
          <p className="text-sm text-muted-foreground">
            To track your selected metrics, you'll need to connect these datasets
          </p>
        </div>

        <div className="w-full space-y-6 mb-8">
          <div>
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Required Datasets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requiredDatasets.map((dataset) => (
                <Card
                  key={dataset}
                  className={`cursor-pointer transition-all ${
                    selectedDatasets.has(dataset) ? "border-primary border-2" : ""
                  }`}
                  onClick={() => handleToggleDataset(dataset)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{dataset}</span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedDatasets.has(dataset) ? "bg-primary border-primary" : "border-muted-foreground"
                        }`}
                      >
                        {selectedDatasets.has(dataset) && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {customDatasets.map((dataset) => (
                <Card
                  key={dataset}
                  className={`cursor-pointer transition-all ${
                    selectedDatasets.has(dataset) ? "border-primary border-2" : ""
                  }`}
                  onClick={() => handleToggleDataset(dataset)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">{dataset}</span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedDatasets.has(dataset) ? "bg-primary border-primary" : "border-muted-foreground"
                        }`}
                      >
                        {selectedDatasets.has(dataset) && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!showOtherInput ? (
                <Card
                  className="cursor-pointer border-dashed hover:border-primary transition-all"
                  onClick={() => setShowOtherInput(true)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Plus className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-muted-foreground">Other</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-primary border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Enter dataset name"
                        value={otherDataset}
                        onChange={(e) => setOtherDataset(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddOtherDataset()
                          } else if (e.key === "Escape") {
                            setShowOtherInput(false)
                            setOtherDataset("")
                          }
                        }}
                        autoFocus
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleAddOtherDataset} disabled={!otherDataset.trim()}>
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Need help connecting datasets?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Invite a team member (like your data manager) to connect these datasets for you
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="teammate@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleInviteTeamMember} disabled={!inviteEmail}>
                      Invite
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full flex gap-3 sticky bottom-0 bg-background pt-4 pb-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 py-6 text-lg font-semibold bg-transparent"
            size="lg"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedDatasets.size === 0}
            className="flex-1 py-6 text-lg font-semibold"
            size="lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
