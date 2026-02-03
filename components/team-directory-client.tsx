"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, User } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface UserWithKPIs {
  id: string
  full_name: string | null
  role: string | null
  organization: string | null
  kpis: string[]
}

interface TeamDirectoryClientProps {
  users: UserWithKPIs[]
}

export function TeamDirectoryClient({ users }: TeamDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.kpis.some((kpi) => kpi.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="text-primary-foreground">
            <Link href="/mission">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-primary-foreground">Team Directory</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Find Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or KPI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{user.full_name || "Unknown User"}</div>
                    {user.role && <div className="text-sm text-muted-foreground">{user.role}</div>}
                    {user.organization && (
                      <div className="text-xs text-muted-foreground mt-0.5">{user.organization}</div>
                    )}
                    {user.kpis.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.kpis.map((kpi, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {kpi}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No team members found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
