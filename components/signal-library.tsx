"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft, LinkIcon, Link2Off as LinkOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { signalTemplates, getSignalsByTeam, type SignalTemplate } from "@/lib/signal-templates"
import type { UserGroup } from "@/lib/types"
import { FixedHeader } from "@/components/fixed-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { NotificationsModal } from "@/components/notifications-modal"
import { SignalConnectionGuideModal } from "@/components/signal-connection-guide-modal"
import { DatasetConnectionFlowModal } from "@/components/dataset-connection-flow-modal"

export function SignalLibrary() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<UserGroup | null>(null)
  const [selectedSignal, setSelectedSignal] = useState<SignalTemplate | null>(null)
  const [view, setView] = useState<"byTeam" | "all">("byTeam")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showConnectionGuide, setShowConnectionGuide] = useState(false)
  const [showDatasetConnection, setShowDatasetConnection] = useState(false)

  const filteredSignals = signalTemplates.filter((signal) => {
    const matchesSearch =
      signal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTeam = !selectedTeam || signal.team === selectedTeam
    return matchesSearch && matchesTeam
  })

  const teams: UserGroup[] = [
    "product",
    "engineering",
    "design",
    "sales",
    "marketing",
    "customer-success",
    "finance",
    "delivery",
  ]
  const teamLabels: Record<UserGroup, string> = {
    product: "Product",
    engineering: "Engineering",
    design: "Design",
    sales: "Sales",
    marketing: "Marketing",
    "customer-success": "Customer Success",
    finance: "Finance",
    delivery: "Delivery",
  }

  const handleConnectSignal = () => {
    if (!selectedSignal) return
    if (selectedSignal.connected) {
      router.push("/insights")
    } else {
      setShowConnectionGuide(true)
    }
  }

  const handleStartConnection = () => {
    if (!selectedSignal) return
    setShowConnectionGuide(false)
    setShowDatasetConnection(true)
  }

  const handleConnectionComplete = () => {
    setShowDatasetConnection(false)
    if (selectedSignal) {
      selectedSignal.connected = true
    }
    router.push("/insights")
  }

  if (selectedSignal) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-20">
        <FixedHeader onNotifications={() => setShowNotifications(true)} />

        <div className="flex-1 overflow-y-auto pt-16 px-4 py-6">
          <Button variant="ghost" onClick={() => setSelectedSignal(null)} className="mb-4" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <CardTitle className="text-xl">{selectedSignal.name}</CardTitle>
                    {selectedSignal.connected ? (
                      <Badge variant="default" className="gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <LinkOff className="h-3 w-3" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedSignal.description}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {teamLabels[selectedSignal.team]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Source */}
              <div>
                <h3 className="font-semibold mb-2 text-sm">Data Source</h3>
                <Badge variant="secondary">{selectedSignal.dataSource}</Badge>
              </div>

              {/* What it measures */}
              <div>
                <h3 className="font-semibold mb-2 text-sm">What it measures</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedSignal.explanation}</p>
              </div>

              {/* Why it matters */}
              <div>
                <h3 className="font-semibold mb-2 text-sm">Why it matters</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedSignal.whyItMatters}</p>
              </div>

              <Button className="w-full" size="lg" onClick={handleConnectSignal}>
                {selectedSignal.connected ? "View in Dashboard" : "Learn How to Connect"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}

        {showConnectionGuide && selectedSignal && (
          <SignalConnectionGuideModal
            signalName={selectedSignal.name}
            dataSource={selectedSignal.dataSource}
            onClose={() => setShowConnectionGuide(false)}
            onStartConnection={handleStartConnection}
          />
        )}

        {showDatasetConnection && selectedSignal && (
          <DatasetConnectionFlowModal
            datasetName={selectedSignal.dataSource}
            onClose={() => setShowDatasetConnection(false)}
            onComplete={handleConnectionComplete}
          />
        )}

        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <FixedHeader onNotifications={() => setShowNotifications(true)} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-16 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Signal Library</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Browse all available signals and learn how to connect them
          </p>
        </div>

        {/* Search and filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search signals..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant={view === "byTeam" ? "default" : "outline"} size="sm" onClick={() => setView("byTeam")}>
              By Team
            </Button>
            <Button variant={view === "all" ? "default" : "outline"} size="sm" onClick={() => setView("all")}>
              All Signals
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={!selectedTeam ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTeam(null)}
            >
              All Teams
            </Badge>
            {teams.map((team) => (
              <Badge
                key={team}
                variant={selectedTeam === team ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTeam(team)}
              >
                {teamLabels[team]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Signal Cards */}
        {view === "byTeam" ? (
          <div className="space-y-6">
            {teams.map((team) => {
              const teamSignals = getSignalsByTeam(team).filter((signal) => {
                const matchesSearch =
                  signal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  signal.description.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesTeamFilter = !selectedTeam || signal.team === selectedTeam
                return matchesSearch && matchesTeamFilter
              })

              if (teamSignals.length === 0) return null

              return (
                <div key={team}>
                  <div className="mb-3">
                    <h2 className="text-lg font-semibold mb-1">{teamLabels[team]} Signals</h2>
                    <p className="text-sm text-muted-foreground">
                      Key metrics for {teamLabels[team].toLowerCase()} teams
                    </p>
                  </div>
                  <div className="space-y-3">
                    {teamSignals.map((signal) => (
                      <Card
                        key={signal.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setSelectedSignal(signal)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-sm">{signal.name}</h3>
                            {signal.connected ? (
                              <LinkIcon className="h-4 w-4 text-primary flex-shrink-0" />
                            ) : (
                              <LinkOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{signal.description}</p>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {signal.dataSource}
                            </Badge>
                            <span className="text-xs text-primary">Learn more →</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSignals.map((signal) => (
              <Card
                key={signal.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedSignal(signal)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-sm">{signal.name}</h3>
                        {signal.connected ? (
                          <LinkIcon className="h-3 w-3 text-primary" />
                        ) : (
                          <LinkOff className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize mb-2">
                        {teamLabels[signal.team]}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{signal.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {signal.dataSource}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredSignals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No signals found matching your search</p>
          </div>
        )}
      </div>

      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}

      <BottomNavigation />
    </div>
  )
}
