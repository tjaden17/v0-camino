"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TrendingUp, Target, CheckCircle, Upload, Lightbulb, Users, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/signals", label: "Signals", icon: TrendingUp },
  { href: "/mission", label: "Mission", icon: Target },
  { href: "/decisions", label: "Decisions", icon: CheckCircle },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/mission/team", label: "Team", icon: Users },
  { href: "/upload", label: "Upload", icon: Upload },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                  "hover:text-primary border-b-2 border-transparent",
                  isActive ? "text-primary border-primary" : "text-muted-foreground hover:border-muted-foreground/50",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
