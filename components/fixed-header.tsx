"use client"

import { Button } from "@/components/ui/button"
import { Share2, Bookmark, Bell, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { getUnreadCount } from "@/lib/notification-utils"
import { useRouter, usePathname } from "next/navigation"

interface FixedHeaderProps {
  onSave?: () => void
  onShare?: () => void
  onNotifications?: () => void
}

export function FixedHeader({ onSave, onShare, onNotifications }: FixedHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(getUnreadCount())
    }
    updateCount()

    window.addEventListener("storage", updateCount)
    window.addEventListener("notificationsUpdated", updateCount)

    return () => {
      window.removeEventListener("storage", updateCount)
      window.removeEventListener("notificationsUpdated", updateCount)
    }
  }, [])

  const handleSignalLibrary = () => {
    router.push("/signals")
  }

  const handleBack = () => {
    router.back()
  }

  const handleForward = () => {
    router.forward()
  }

  const handleLogoClick = () => {
    router.push("/insights")
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack} title="Go back">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleForward} title="Go forward">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <button
              onClick={handleLogoClick}
              className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
            >
              Camino
            </button>
          </div>
          <div className="flex items-center gap-2">
            {pathname !== "/signals" && (
              <Button variant="ghost" size="sm" onClick={handleSignalLibrary} title="Signal Library">
                <BookOpen className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onNotifications} className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
            {onSave && (
              <Button variant="ghost" size="sm" onClick={onSave}>
                <Bookmark className="h-4 w-4" />
              </Button>
            )}
            {onShare && (
              <Button variant="ghost" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
