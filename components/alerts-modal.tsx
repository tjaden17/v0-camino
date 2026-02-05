"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { X, Plus, Bell, Mail, MessageSquare, TrendingUp, TrendingDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Alert {
  id: string
  signalName: string
  condition: "trending_up" | "trending_down" | "threshold"
  threshold?: number
  notifyVia: ("email" | "sms")[]
  enabled: boolean
}

interface AlertsModalProps {
  onClose: () => void
}

export function AlertsModal({ onClose }: AlertsModalProps) {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "alert-1",
      signalName: "Win/Loss Rate",
      condition: "trending_down",
      notifyVia: ["email"],
      enabled: true,
    },
    {
      id: "alert-2",
      signalName: "User Engagement",
      condition: "trending_up",
      notifyVia: ["email", "sms"],
      enabled: true,
    },
  ])
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [newAlertSignal, setNewAlertSignal] = useState("")
  const [newAlertCondition, setNewAlertCondition] = useState<"trending_up" | "trending_down" | "threshold">(
    "trending_down",
  )
  const [newAlertEmail, setNewAlertEmail] = useState(true)
  const [newAlertSMS, setNewAlertSMS] = useState(false)

  const handleToggleAlert = (alertId: string) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert)))
  }

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  const handleCreateAlert = () => {
    if (newAlertSignal) {
      const notifyVia: ("email" | "sms")[] = []
      if (newAlertEmail) notifyVia.push("email")
      if (newAlertSMS) notifyVia.push("sms")

      const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        signalName: newAlertSignal,
        condition: newAlertCondition,
        notifyVia,
        enabled: true,
      }
      setAlerts([...alerts, newAlert])
      setShowCreateAlert(false)
      setNewAlertSignal("")
      setNewAlertEmail(true)
      setNewAlertSMS(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-background border border-border rounded-lg shadow-lg mt-20 mb-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Alerts</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!showCreateAlert ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Get notified when your signals trend up or down. Choose how you want to be alerted.
                </p>
                <Button onClick={() => setShowCreateAlert(true)} className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Alert
                </Button>
              </div>

              {/* Alerts List */}
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{alert.signalName}</h3>
                          {alert.condition === "trending_up" ? (
                            <Badge variant="default" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Trending Up
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <TrendingDown className="h-3 w-3" />
                              Trending Down
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Notify via:</span>
                          {alert.notifyVia.includes("email") && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Mail className="h-3 w-3" />
                              Email
                            </Badge>
                          )}
                          {alert.notifyVia.includes("sms") && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <MessageSquare className="h-3 w-3" />
                              SMS
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={alert.enabled} onCheckedChange={() => handleToggleAlert(alert.id)} />
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAlert(alert.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold">Create New Alert</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Signal</label>
                  <Input
                    value={newAlertSignal}
                    onChange={(e) => setNewAlertSignal(e.target.value)}
                    placeholder="Enter signal name (e.g., Win/Loss Rate)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Alert Condition</label>
                  <Select value={newAlertCondition} onValueChange={(v: any) => setNewAlertCondition(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending_up">Trending Up</SelectItem>
                      <SelectItem value="trending_down">Trending Down</SelectItem>
                      <SelectItem value="threshold">Reaches Threshold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notification Method</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Email</span>
                      </div>
                      <Switch checked={newAlertEmail} onCheckedChange={setNewAlertEmail} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">SMS</span>
                      </div>
                      <Switch checked={newAlertSMS} onCheckedChange={setNewAlertSMS} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateAlert(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreateAlert} disabled={!newAlertSignal} className="flex-1">
                  Create Alert
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
