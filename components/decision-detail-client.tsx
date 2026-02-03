"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, User } from "lucide-react"
import type { DecisionWithDetails } from "@/lib/decisions-service"
import Link from "next/link"
import { format } from "date-fns"

interface DecisionDetailClientProps {
  decision: DecisionWithDetails
  userId: string
}

export function DecisionDetailClient({ decision, userId }: DecisionDetailClientProps) {
  const isOwner = decision.owner_id === userId

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-yellow-50 text-yellow-700 border-yellow-300"
      case "decided":
        return "bg-blue-50 text-blue-700 border-blue-300"
      case "implemented":
        return "bg-green-50 text-green-700 border-green-300"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="text-primary-foreground">
            <Link href="/decisions">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-primary-foreground truncate">Decision Details</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{decision.title}</CardTitle>
                <Badge variant="outline" className={getStatusColor(decision.status)}>
                  {decision.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {decision.owner_name && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Owner
                  </div>
                  <div className="font-semibold">{decision.owner_name}</div>
                </div>
              )}

              {decision.target_date && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Target Date
                  </div>
                  <div className="font-semibold">{format(new Date(decision.target_date), "MMMM d, yyyy")}</div>
                </div>
              )}

              {decision.decided_at && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Decided On</div>
                  <div className="font-semibold">{format(new Date(decision.decided_at), "MMMM d, yyyy")}</div>
                </div>
              )}

              {decision.implemented_at && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Implemented On</div>
                  <div className="font-semibold">{format(new Date(decision.implemented_at), "MMMM d, yyyy")}</div>
                </div>
              )}
            </div>

            {decision.context && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Context</div>
                <div className="prose prose-sm max-w-none">
                  <p>{decision.context}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked Signals ({decision.signals.length})</CardTitle>
            <CardDescription>Metrics considered in this decision</CardDescription>
          </CardHeader>
          <CardContent>
            {decision.signals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No signals linked to this decision</div>
            ) : (
              <div className="space-y-3">
                {decision.signals.map((signal) => (
                  <Link key={signal.id} href={`/signals/${signal.signal_id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold mb-2">{signal.signal_name}</div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Snapshot Value</div>
                                <div className="font-semibold">
                                  {signal.snapshot_value !== null ? signal.snapshot_value.toLocaleString() : "—"}
                                </div>
                                {signal.snapshot_date && (
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(signal.snapshot_date), "MMM d, yyyy")}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-muted-foreground">Current Value</div>
                                <div className="font-semibold">
                                  {signal.current_value !== null ? signal.current_value.toLocaleString() : "—"}
                                </div>
                              </div>
                            </div>
                          </div>
                          {signal.change !== null && (
                            <div
                              className={`flex items-center gap-1 ${signal.change >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {signal.change >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span className="font-semibold">
                                {signal.change >= 0 ? "+" : ""}
                                {signal.change.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isOwner && decision.status === "upcoming" && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button className="flex-1">Mark as Decided</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Edit Decision
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
