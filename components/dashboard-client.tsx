"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { LayoutGrid, Target, Upload, TrendingUp, CheckCircle, Lightbulb, Loader2 } from "lucide-react"

interface Profile {
  id: string
  full_name: string | null
  organization: string | null
  business_context: string | null
  role: string | null
}

export default function DashboardClient() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [kpiCount, setKpiCount] = useState(0)
  const [decisionsCount, setDecisionsCount] = useState(0)
  const [userEmail, setUserEmail] = useState("")
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadDashboard() {
      try {
        console.log("[v0] Dashboard client: Getting user")
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.log("[v0] Dashboard client: No user found")
          return
        }

        console.log("[v0] Dashboard client: User found:", user.email)
        setUserEmail(user.email || "")

        // Load profile
        console.log("[v0] Dashboard client: Loading profile")
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("[v0] Dashboard client: Profile error:", profileError)
        } else {
          console.log("[v0] Dashboard client: Profile loaded:", profileData)
          setProfile(profileData)
        }

        // Load KPI count
        console.log("[v0] Dashboard client: Loading KPI count")
        const { count: kpis, error: kpiError } = await supabase
          .from("kpi_ownership")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        if (kpiError) {
          console.error("[v0] Dashboard client: KPI error:", kpiError)
        } else {
          setKpiCount(kpis || 0)
        }

        // Load decisions count
        console.log("[v0] Dashboard client: Loading decisions count")
        const { count: decisions, error: decisionsError } = await supabase
          .from("decisions")
          .select("*", { count: "exact", head: true })
          .eq("owner", user.id)
          .in("status", ["upcoming", "decided"])

        if (decisionsError) {
          console.error("[v0] Dashboard client: Decisions error:", decisionsError)
        } else {
          setDecisionsCount(decisions || 0)
        }

        console.log("[v0] Dashboard client: All data loaded successfully")
      } catch (error) {
        console.error("[v0] Dashboard client error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [supabase])

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
  <div>
  <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
    <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold text-primary-foreground">Dashboard</h1>
    </div>
  </header>
  <main className="container max-w-6xl mx-auto px-4 py-8">
  <div className="mb-8">
  <h2 className="text-3xl font-bold text-balance">
  Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
  </h2>
  <p className="mt-2 text-muted-foreground">Focus on what matters most to your business</p>
  </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your KPIs</CardDescription>
            <CardTitle className="text-3xl">{kpiCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Decisions</CardDescription>
            <CardTitle className="text-3xl">{decisionsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Organization</CardDescription>
            <CardTitle className="text-lg">{profile?.organization || "Not set"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Signals</CardTitle>
            <CardDescription>View your key business metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/signals">View Signals</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Target className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Mission</CardTitle>
            <CardDescription>Your role, KPIs, and team directory</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/mission">View Mission</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CheckCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Decisions</CardTitle>
            <CardDescription>Track and review business decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/decisions">View Decisions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Lightbulb className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Insights</CardTitle>
            <CardDescription>Data quality and benchmark analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/insights">View Insights</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Upload className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Upload Data</CardTitle>
            <CardDescription>Import your business data and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              {/* #region agent log */}
              <Link
                href="/upload"
                onClick={() =>
                  fetch("http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      location: "dashboard-client:Link-click",
                      message: "Upload Data link clicked",
                      data: { href: "/upload" },
                      timestamp: Date.now(),
                      hypothesisId: "H2",
                    }),
                  }).catch(() => {})
                }
              >
                Upload Data
              </Link>
              {/* #endregion */}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <LayoutGrid className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Team Directory</CardTitle>
            <CardDescription>See everyone's KPIs and focus areas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/mission/team">View Team</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {profile?.business_context && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Business Context</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{profile.business_context}</p>
          </CardContent>
        </Card>
      )}
    </main>
  </div>
  )
}
