"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import { LayoutDashboard, Users, Settings, Building2, LogOut, Database, Activity, Plug, HelpCircle, FileUp, Zap, Target } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isMasterAdmin, setIsMasterAdmin] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const ADMIN_AUTH_TIMEOUT_MS = 10_000

    const clearAuthTimeout = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const checkAdminAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (cancelled) return
        if (error || !user) {
          clearAuthTimeout()
          setIsLoading(false)
          router.push("/dashboard")
          return
        }

        const masterAdmin = user.email === "admin@admin.com"
        setIsMasterAdmin(masterAdmin)

        // Check if user is org admin (only for non–master admin; org data may be in Neon)
        if (!masterAdmin) {
          const { data: membership } = await supabase
            .from("organization_members")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle()

          if (cancelled) return
          if (!membership) {
            clearAuthTimeout()
            setIsLoading(false)
            router.push("/dashboard")
            return
          }
        }

        clearAuthTimeout()
        setUser(user)
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Admin layout - error checking auth:", error)
        clearAuthTimeout()
        if (!cancelled) setIsLoading(false)
        router.push("/dashboard")
      }
    }

    checkAdminAuth()

    // Only redirect if auth check is still pending after timeout (e.g. network hang)
    timeoutId = setTimeout(() => {
      if (cancelled) return
      timeoutId = null
      setIsLoading(false)
      router.push("/dashboard")
    }, ADMIN_AUTH_TIMEOUT_MS)

    return () => {
      cancelled = true
      clearAuthTimeout()
    }
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/delivery", label: "Delivery", icon: Target },
    { href: "/admin/data", label: "Data", icon: Database },
    { href: "/admin/signals", label: "Signals", icon: Activity },
    { href: "/admin/signal-hub", label: "Signal Hub", icon: Zap },
    { href: "/admin/integrations", label: "Integrations", icon: Plug },
    { href: "/admin/import", label: "Import Data", icon: FileUp },
    { href: "/admin/organisations", label: "Organisations", icon: Building2, masterAdminOnly: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/admin/faq", label: "Help & FAQ", icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 h-screen">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <Link href="/admin/dashboard" className="text-lg font-bold text-foreground">
            {isMasterAdmin ? "Camino Master Admin" : "Admin Panel"}
          </Link>
          <p className="text-xs text-muted-foreground mt-1">{isMasterAdmin ? "Master Admin" : "Organisation Admin"}</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            if (item.masterAdminOnly && !isMasterAdmin) {
              return null
            }

            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="px-4 py-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
