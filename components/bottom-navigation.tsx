"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Activity, Bookmark, Map, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/insights",
    icon: Activity,
    label: "Signals",
    activeRoutes: ["/insights"],
  },
  {
    href: "/saved",
    icon: Bookmark,
    label: "Saved",
    activeRoutes: ["/saved"],
  },
  {
    href: "/signal-map",
    icon: Map,
    label: "Impact",
    activeRoutes: ["/signal-map"],
  },
  {
    href: "/intel",
    icon: User,
    label: "Profile",
    activeRoutes: ["/intel"],
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.activeRoutes.includes(pathname)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-3 px-4 rounded-lg transition-colors min-w-16",
                isActive ? "text-white bg-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className={cn("text-xs font-medium", isActive ? "text-white" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
