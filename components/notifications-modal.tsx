"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Bell, CheckCheck, Trash2 } from "lucide-react"
import { getNotifications, markNotificationAsRead, clearAllNotifications } from "@/lib/notification-utils"
import { DataIntegrationSetupModal } from "@/components/data-integration-setup-modal"
import type { Notification } from "@/lib/types"
import { useRouter } from "next/navigation"

interface NotificationsModalProps {
  onClose: () => void
}

export function NotificationsModal({ onClose }: NotificationsModalProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDataSetup, setShowDataSetup] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = () => {
    setNotifications(getNotifications())
  }

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id)
    loadNotifications()

    window.dispatchEvent(new Event("notificationsUpdated"))

    if (notification.type === "signal_request" && notification.actionRequired) {
      setSelectedNotification(notification)
      setShowDataSetup(true)
    } else if (notification.type === "signal_added") {
      onClose()
      router.push("/insights")
    } else {
      onClose()
      router.push("/profile")
    }
  }

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) {
        markNotificationAsRead(n.id)
      }
    })
    loadNotifications()
    window.dispatchEvent(new Event("notificationsUpdated"))
  }

  const handleClearAll = () => {
    clearAllNotifications()
    loadNotifications()
    window.dispatchEvent(new Event("notificationsUpdated"))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "signal_request":
        return "📊"
      case "signal_added":
        return "✅"
      case "team_invite":
        return "👥"
      case "data_connection_request":
        return "💾"
      case "metric_assignment":
        return "🎯"
      default:
        return "🔔"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMins < 1) return "Just now"
    if (diffInMins < 60) return `${diffInMins}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${diffInDays}d ago`
  }

  const handleDataSetupClose = () => {
    setShowDataSetup(false)
    setSelectedNotification(null)
    onClose()
  }

  if (showDataSetup && selectedNotification) {
    return (
      <DataIntegrationSetupModal
        signalName={selectedNotification.signalName || "Signal"}
        signalId={selectedNotification.metadata?.signalId}
        requestedBy={selectedNotification.from || { name: "Team Member", email: "" }}
        onClose={handleDataSetupClose}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg mt-20 mb-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {notifications.filter((n) => !n.read).length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {notifications.filter((n) => !n.read).length}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs">
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs text-destructive">
              <Trash2 className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">{notification.message}</p>
                      {notification.from && (
                        <p className="text-xs text-muted-foreground mb-1">From: {notification.from.name}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</p>
                        {notification.actionRequired && (
                          <Badge variant="secondary" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
