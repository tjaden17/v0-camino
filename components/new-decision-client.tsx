"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface Signal {
  id: string
  name: string
  category: string | null
}

interface NewDecisionClientProps {
  signals: Signal[]
  userId: string
}

export function NewDecisionClient({ signals, userId }: NewDecisionClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [context, setContext] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [selectedSignals, setSelectedSignals] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          context: context || null,
          target_date: targetDate || null,
          signal_ids: selectedSignals,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Decision created",
          description: "Your decision has been created successfully",
        })
        router.push(`/decisions/${data.decision_id}`)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create decision",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Create decision error:", error)
      toast({
        title: "Error",
        description: "Failed to create decision",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSignal = (signalId: string) => {
    setSelectedSignals((prev) => (prev.includes(signalId) ? prev.filter((id) => id !== signalId) : [...prev, signalId]))
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
          <h1 className="text-xl font-bold text-primary-foreground">New Decision</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Decision Details</CardTitle>
              <CardDescription>Create a new decision to track</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What decision needs to be made?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Context</Label>
                <Textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Describe the context and background for this decision..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Decision Date</Label>
                <Input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Link Signals</CardTitle>
              <CardDescription>Select metrics that will inform this decision</CardDescription>
            </CardHeader>
            <CardContent>
              {signals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">No signals available</p>
                  <Button asChild variant="outline">
                    <Link href="/upload">Upload Data First</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {signals.map((signal) => (
                    <div
                      key={signal.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleSignal(signal.id)}
                    >
                      <Checkbox
                        checked={selectedSignals.includes(signal.id)}
                        onCheckedChange={() => toggleSignal(signal.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{signal.name}</div>
                        {signal.category && <div className="text-xs text-muted-foreground">{signal.category}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedSignals.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-semibold mb-2">{selectedSignals.length} signals selected</div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title} className="flex-1">
              {loading ? "Creating..." : "Create Decision"}
            </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}
