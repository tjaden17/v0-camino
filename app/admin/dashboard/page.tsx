"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, BarChart3, Database, Upload } from "lucide-react"
import { getSystemStats, getAllUsers, getAllSignals } from "@/lib/admin-service"
import { createBrowserClient } from "@/lib/supabase/client"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    signals: 0,
    dataPoints: 0,
    uploads: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentSignals, setRecentSignals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [isMasterAdmin, setIsMasterAdmin] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const masterAdmin = user.email === "admin@admin.com"
        setIsMasterAdmin(masterAdmin)

        let orgId = null
        if (!masterAdmin) {
          const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

          orgId = profile?.organization_id || null
          setOrganizationId(orgId)
        }

        const [statsData, usersData, signalsData] = await Promise.all([
          getSystemStats(orgId, masterAdmin),
          getAllUsers(orgId, masterAdmin),
          getAllSignals(orgId, masterAdmin),
        ])

        setStats(statsData)
        setRecentUsers(usersData.slice(0, 5))
        setRecentSignals(signalsData.slice(0, 5))
      } catch (error) {
        console.error("Error loading admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-500" },
    { label: "Active Signals", value: stats.signals, icon: BarChart3, color: "text-green-500" },
    { label: "Data Points", value: stats.dataPoints, icon: Database, color: "text-purple-500" },
    { label: "Uploads", value: stats.uploads, icon: Upload, color: "text-orange-500" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isMasterAdmin ? "System Overview" : "Organization Overview"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isMasterAdmin ? "Monitor your Camino platform" : "Monitor your organization's performance"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
            ) : (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.organization || "No organization"} • {user.role || "No role"}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Signals */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Signals</h2>
          <div className="space-y-3">
            {recentSignals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No signals yet</p>
            ) : (
              recentSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{signal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {signal.category} • {signal.data_points_count} data points
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{signal.owner_email}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
