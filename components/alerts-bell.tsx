"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getUnreadAlerts, markAlertAsRead, type Alert } from "@/lib/notifications"
import { cn } from "@/lib/utils"

interface AlertsBellProps {
  onAlertClick: (issueId: string) => void
}

export function AlertsBell({ onAlertClick }: AlertsBellProps) {
  const [open, setOpen] = useState(false)
  const [alerts] = useState(getUnreadAlerts())
  const unreadCount = alerts.filter((a) => !a.read).length

  const handleAlertClick = (alert: Alert) => {
    markAlertAsRead(alert.id)
    setOpen(false)
    onAlertClick(alert.issueId)
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-warning text-warning-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative h-10 w-10 hover:bg-primary-foreground/10"
      >
        <Bell className="h-5 w-5 text-primary-foreground" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
          >
            {unreadCount}
          </Badge>
        )}
        <span className="sr-only">View alerts</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Alerts</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No alerts at this time</p>
            ) : (
              alerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors",
                    alert.read ? "bg-muted/50 border-border" : "bg-card border-primary/30 hover:bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm">{alert.title}</h3>
                    <Badge className={cn("text-xs", getSeverityColor(alert.severity))}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
