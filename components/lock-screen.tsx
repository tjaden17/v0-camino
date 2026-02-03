"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUnreadAlerts } from "@/lib/notifications"

interface LockScreenProps {
  onClose: () => void
}

export function LockScreen({ onClose }: LockScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const alerts = getUnreadAlerts()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">
      {/* Time Display */}
      <div className="text-center mb-12">
        <h1 className="text-7xl font-bold text-white mb-2">
          {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </h1>
        <p className="text-xl text-white/70">
          {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Notifications */}
      <div className="w-full max-w-md space-y-3 mb-8">
        {alerts.slice(0, 3).map((alert) => (
          <Card key={alert.id} className="p-4 bg-white/10 backdrop-blur-md border-white/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Bell className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">Camino</span>
                  <Badge variant="destructive" className="text-xs">
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-white mb-1">{alert.title}</p>
                <p className="text-xs text-white/70 line-clamp-2">{alert.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Close Button */}
      <Button
        onClick={onClose}
        size="lg"
        className="rounded-full h-14 w-14 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30"
      >
        <X className="h-6 w-6 text-white" />
        <span className="sr-only">Close lock screen</span>
      </Button>

      <p className="text-xs text-white/50 mt-4">Tap to return to app</p>
    </div>
  )
}
