"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { X, Search, LinkIcon, Link2Off as LinkOff, Users, BookOpen, BadgeIcon, Database } from 'lucide-react'
import { getUserProfile } from "@/lib/user-utils"
import { addNotification } from "@/lib/notification-utils"
import { signalTemplates, type SignalTemplate } from "@/lib/signal-templates"
import { dataSourceOptions } from "@/lib/data-sources"
import type { UserGroup } from "@/lib/types"
import { useRouter } from 'next/navigation'

interface AddSignalModalProps {
  onClose: () => void
}

export function AddSignalModal({ onClose }: AddSignalModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<"choose-source" | "choose-signal" | "choose-connection" | "request" | "add-dataset">("choose-source")
  const [signalSource, setSignalSource] = useState<"connected" | "benchmark" | "role" | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<UserGroup | null>(null)
  const [selectedSignal, setSelectedSignal] = useState<SignalTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [connectionMethod, setConnectionMethod] = useState<"self" | "team" | null>(null)
  const [inviteeName, setInviteeName] = useState("")
  const [inviteeEmail, setInviteeEmail] = useState("")
  const [suggestedSignals, setSuggestedSignals] = useState("")
  const [dataSourceSearch, setDataSourceSearch] = useState("")

  const profile = getUserProfile()

  const filteredSignals = signalTemplates.filter((signal) => {
    const matchesSearch =
      signal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTeam = !selectedTeam || signal.team === selectedTeam
    const matchesSource =
      signalSource === "connected"
        ? signal.connected
        : signalSource === "benchmark"
          ? !signal.connected
          : signalSource === "role" && profile
            ? profile.groups.includes(signal.team)
            : true
    return matchesSearch && matchesTeam && matchesSource
  })

  const filteredDataSources = dataSourceOptions.filter(ds =>
    ds.name.toLowerCase().includes(dataSourceSearch.toLowerCase()) ||
    ds.description.toLowerCase().includes(dataSourceSearch.toLowerCase())
  )

  const popularDataSources = dataSourceOptions.filter(ds => ds.popular)

  const handleChooseSource = (source: "connected" | "benchmark" | "role") => {
    setSignalSource(source)
    setStep("choose-signal")
  }

  const handleSelectSignal = (signal: SignalTemplate) => {
    setSelectedSignal(signal)
    setStep("choose-connection")
  }

  const handleChooseConnection = (method: "self" | "team") => {
    setConnectionMethod(method)
    if (method === "team") {
      setStep("request")
    } else {
      // Connect themselves - would open data integration modal
      onClose()
    }
  }

  const handleSendRequest = () => {
    if (inviteeName && inviteeEmail && selectedSignal && profile) {
      const message = suggestedSignals
        ? `${profile.name} has requested you to set up signals for the ${selectedSignal.team} team. Suggested signals: ${suggestedSignals}`
        : `${profile.name} has requested you to set up the "${selectedSignal.name}" signal`

      addNotification({
        type: "signal_request",
        title: "Signal Request",
        message,
        from: {
          name: profile.name,
          email: profile.email,
        },
        signalName: selectedSignal.name,
        actionRequired: true,
        read: false,
        metadata: {
          signalId: selectedSignal.id,
          requestedBy: profile.id,
          suggestedSignals: suggestedSignals || undefined,
        },
      })
      window.dispatchEvent(new Event("notificationsUpdated"))
      onClose()
    }
  }

  const handleBrowseLibrary = () => {
    onClose()
    router.push("/signals")
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg mt-20 mb-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Add Signal</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === "choose-source" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">Step 1: Choose where to find your signal</p>

              <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={handleBrowseLibrary}>
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Browse Signal Library</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Explore all available signals with detailed explanations
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => setStep("add-dataset")}
              >
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Add Dataset</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Connect to a new data source to unlock more signals
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleChooseSource("benchmark")}
              >
                <div className="flex items-start gap-3">
                  <BadgeIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">From Benchmark Signals</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      See what signals similar successful businesses track
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleChooseSource("role")}
              >
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">From My Role</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Quick access to signals most relevant to your role and team
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {step === "add-dataset" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">Connect a data source</p>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={dataSourceSearch}
                  onChange={(e) => setDataSourceSearch(e.target.value)}
                  placeholder="Search data sources..."
                  className="pl-9"
                />
              </div>

              {!dataSourceSearch && popularDataSources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Popular Sources</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {popularDataSources.map((ds) => (
                      <Card
                        key={ds.id}
                        className="p-3 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => {
                          onClose()
                          // Would open data integration flow
                        }}
                      >
                        <div className="text-2xl mb-1">{ds.icon}</div>
                        <h4 className="font-medium text-sm">{ds.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{ds.description}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-medium">All Data Sources</h4>
                {Object.entries(
                  filteredDataSources.reduce((acc, ds) => {
                    if (!acc[ds.category]) acc[ds.category] = []
                    acc[ds.category].push(ds)
                    return acc
                  }, {} as Record<string, typeof filteredDataSources>)
                ).map(([category, sources]) => (
                  <div key={category} className="space-y-2">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase">{category}</h5>
                    <div className="space-y-2">
                      {sources.map((ds) => (
                        <Card
                          key={ds.id}
                          className="p-3 cursor-pointer hover:border-primary transition-colors"
                          onClick={() => {
                            onClose()
                            // Would open data integration flow
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-xl flex-shrink-0">{ds.icon}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm">{ds.name}</h4>
                              <p className="text-xs text-muted-foreground">{ds.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={() => setStep("choose-source")} className="w-full">
                Back
              </Button>
            </div>
          )}

          {step === "choose-signal" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">Step 1: Choose a signal</p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search signals..."
                  className="pl-9"
                />
              </div>

              {/* Team Filter */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={!selectedTeam ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTeam(null)}
                >
                  All Teams
                </Badge>
                <Badge
                  variant={selectedTeam === "product" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTeam("product")}
                >
                  Product
                </Badge>
                <Badge
                  variant={selectedTeam === "sales" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTeam("sales")}
                >
                  Sales
                </Badge>
                <Badge
                  variant={selectedTeam === "marketing" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTeam("marketing")}
                >
                  Marketing
                </Badge>
                <Badge
                  variant={selectedTeam === "design" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTeam("design")}
                >
                  Design
                </Badge>
                <Badge
                  variant={selectedTeam === "engineering" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTeam("engineering")}
                >
                  Engineering
                </Badge>
                <Badge
                  variant={selectedTeam === "customer-success" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTeam("customer-success")}
                >
                  CS
                </Badge>
                <Badge
                  variant={selectedTeam === "finance" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTeam("finance")}
                >
                  Finance
                </Badge>
                <Badge
                  variant={selectedTeam === "delivery" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTeam("delivery")}
                >
                  Delivery
                </Badge>
              </div>

              {/* Signals List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredSignals.map((signal) => (
                  <Card
                    key={signal.id}
                    className="p-3 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelectSignal(signal)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-medium text-sm">{signal.name}</h4>
                          {signal.connected ? (
                            <LinkIcon className="h-3 w-3 text-primary" />
                          ) : (
                            <LinkOff className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-1">{signal.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {signal.dataSource}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                        {signal.team}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>

              <Button variant="outline" onClick={() => setStep("choose-source")} className="w-full">
                Back
              </Button>
            </div>
          )}

          {step === "choose-connection" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Step 2: How would you like to connect this signal?
              </p>

              {selectedSignal && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">{selectedSignal.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSignal.description}</p>
                </div>
              )}

              <Card
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleChooseConnection("self")}
              >
                <h3 className="font-semibold mb-2">I'll connect it myself</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set up the data connection and configure the signal on your own
                </p>
              </Card>

              <Card
                className="p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleChooseConnection("team")}
              >
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Request from team member</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Send a request to a team member to set up this signal
                    </p>
                  </div>
                </div>
              </Card>

              <Button variant="outline" onClick={() => setStep("choose-signal")} className="w-full">
                Back
              </Button>
            </div>
          )}

          {step === "request" && (
            <div className="space-y-4">
              <h3 className="font-semibold">Request Signal Setup</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Send a request to a team member to set up this signal
              </p>

              {selectedSignal && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-1">{selectedSignal.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{selectedSignal.description}</p>
                  {selectedSignal.whyItMatters && (
                    <p className="text-xs text-muted-foreground italic">{selectedSignal.whyItMatters}</p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={inviteeName}
                    onChange={(e) => setInviteeName(e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={inviteeEmail}
                    onChange={(e) => setInviteeEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>

                {profile?.userType === "elt" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Suggest additional signals (optional)</label>
                    <Textarea
                      value={suggestedSignals}
                      onChange={(e) => setSuggestedSignals(e.target.value)}
                      placeholder="e.g., Please include Win/Loss rate, Deal Velocity"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Suggest other signals you'd like this team member to include
                    </p>
                  </div>
                )}

                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">Request Message:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile?.name} would like to view {selectedSignal ? `"${selectedSignal.name}"` : "team signals"} in
                    Camino. This signal helps your organization progress towards your business goals.
                    {suggestedSignals && ` Additional suggestions: ${suggestedSignals}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("choose-connection")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSendRequest} disabled={!inviteeName || !inviteeEmail} className="flex-1">
                  Send Request
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
