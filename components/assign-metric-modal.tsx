"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, UserPlus } from "lucide-react"
import { createMetricAssignmentNotification } from "@/lib/notification-utils"
import { getUserProfile } from "@/lib/user-utils"

interface AssignMetricModalProps {
  metricName: string
  metricId: string
  currentOwner?: string
  onClose: () => void
  onAssign: (owner: string, email: string) => void
}

export function AssignMetricModal({ metricName, metricId, currentOwner, onClose, onAssign }: AssignMetricModalProps) {
  const [ownerName, setOwnerName] = useState(currentOwner || "")
  const [ownerEmail, setOwnerEmail] = useState("")

  const handleAssign = () => {
    if (!ownerName || !ownerEmail) return

    const currentUser = getUserProfile()

    // Create notification for the assigned user
    createMetricAssignmentNotification(metricName, ownerEmail, {
      name: currentUser?.name || "Team Lead",
      email: currentUser?.email || "",
    })

    // Call the onAssign callback to update the signal owner
    onAssign(ownerName, ownerEmail)

    // Trigger notification update event
    window.dispatchEvent(new Event("notificationsUpdated"))

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Assign Metric Owner</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Metric</Label>
            <p className="text-lg font-semibold mt-1">{metricName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-name">Owner Name</Label>
            <Input
              id="owner-name"
              placeholder="e.g., Sarah Chen - Sales Manager"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-email">Owner Email</Label>
            <Input
              id="owner-email"
              type="email"
              placeholder="sarah@company.com"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">The owner will receive a notification about this assignment</p>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!ownerName || !ownerEmail} className="flex-1">
            Assign Owner
          </Button>
        </div>
      </div>
    </div>
  )
}
