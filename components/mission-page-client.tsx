"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Users } from "lucide-react"
import type { UserProfile, KPIOwnership, Decision } from "@/lib/mission-service"
import Link from "next/link"

interface MissionPageClientProps {
  profile: UserProfile | null
  kpis: KPIOwnership[]
  decisions: Decision[]
}

export function MissionPageClient({ profile, kpis, decisions }: MissionPageClientProps) {
  const getTrendIcon = (trend: string | null) => {
    if (trend === "increasing") return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === "decreasing") return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary-foreground">Mission</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl">Your Role</CardTitle>
            {profile?.role && <CardDescription className="text-lg">{profile.role}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.organization && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Organization</div>
                <div className="font-semibold">{profile.organization}</div>
              </div>
            )}
            {profile?.business_context && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Business Context</div>
                <div className="text-sm">{profile.business_context}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Your KPIs
                </CardTitle>
                <CardDescription>Key metrics you track</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">Update KPIs</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {kpis.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No KPIs set yet</p>
                <p className="text-sm text-muted-foreground mt-2">Go to your profile to select your 3 main KPIs</p>
                <Button asChild className="mt-4">
                  <Link href="/profile">Set Your KPIs</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {kpis.map((kpi, index) => (
                  <Card key={kpi.signal_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{kpi.signal_name}</div>
                          {kpi.is_primary && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  Upcoming Decisions
                </CardTitle>
                <CardDescription>Decisions you need to make soon</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/decisions">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {decisions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming decisions</p>
                <Button asChild>
                  <Link href="/decisions/new">Create Decision</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {decisions.map((decision) => (
                  <Link key={decision.id} href={`/decisions/${decision.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-semibold">{decision.title}</div>
                            {decision.target_date && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Due: {new Date(decision.target_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {decision.signal_count} signals
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Team Directory
            </CardTitle>
            <CardDescription>See what others are focused on</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/mission/team">View Team Directory</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
