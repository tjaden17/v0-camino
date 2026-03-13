"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/bottom-nav"
import { Calendar, CheckCircle, Clock, Plus } from "lucide-react"
import type { DecisionWithDetails } from "@/lib/decisions-service"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface DecisionsPageClientProps {
  decisions: DecisionWithDetails[]
  userId: string
}

export function DecisionsPageClient({ decisions, userId }: DecisionsPageClientProps) {
  const upcomingDecisions = decisions.filter((d) => d.status === "upcoming")
  const decidedDecisions = decisions.filter((d) => d.status === "decided")
  const implementedDecisions = decisions.filter((d) => d.status === "implemented")

  const myDecisions = upcomingDecisions.filter((d) => d.owner_id === userId)
  const teamDecisions = upcomingDecisions.filter((d) => d.owner_id !== userId)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            Upcoming
          </Badge>
        )
      case "decided":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            Decided
          </Badge>
        )
      case "implemented":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            Implemented
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-foreground">Decisions</h1>
          <Button asChild size="sm" variant="secondary">
            <Link href="/decisions/new">
              <Plus className="h-4 w-4 mr-2" />
              New Decision
            </Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {myDecisions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">My Upcoming Decisions ({myDecisions.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {myDecisions.map((decision) => (
                <Link key={decision.id} href={`/decisions/${decision.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{decision.title}</CardTitle>
                        {getStatusBadge(decision.status)}
                      </div>
                      {decision.context && (
                        <CardDescription className="line-clamp-2">{decision.context}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {decision.target_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Due {formatDistanceToNow(new Date(decision.target_date), { addSuffix: true })}
                        </div>
                      )}
                      {decision.signals.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary">{decision.signals.length} signals linked</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {teamDecisions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Team Decisions ({teamDecisions.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {teamDecisions.map((decision) => (
                <Link key={decision.id} href={`/decisions/${decision.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{decision.title}</CardTitle>
                        {getStatusBadge(decision.status)}
                      </div>
                      {decision.context && (
                        <CardDescription className="line-clamp-2">{decision.context}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {decision.owner_name && (
                        <div className="text-sm text-muted-foreground">Owner: {decision.owner_name}</div>
                      )}
                      {decision.target_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Due {formatDistanceToNow(new Date(decision.target_date), { addSuffix: true })}
                        </div>
                      )}
                      {decision.signals.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary">{decision.signals.length} signals linked</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {decidedDecisions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Recent Decisions ({decidedDecisions.length})
            </h2>
            <div className="grid gap-3">
              {decidedDecisions.slice(0, 5).map((decision) => (
                <Link key={decision.id} href={`/decisions/${decision.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold">{decision.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Decided by {decision.owner_name || "Unknown"}
                          </div>
                        </div>
                        {getStatusBadge(decision.status)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {upcomingDecisions.length === 0 && decidedDecisions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No decisions tracked yet</p>
              <Button asChild>
                <Link href="/decisions/new">Create Your First Decision</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
