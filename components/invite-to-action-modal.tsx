"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Send } from "lucide-react"

interface InviteToActionModalProps {
  onClose: () => void
}

export function InviteToActionModal({ onClose }: InviteToActionModalProps) {
  const [email, setEmail] = useState("")
  const [metrics, setMetrics] = useState("")
  const [dataSets, setDataSets] = useState("")
  const [message, setMessage] = useState("")

  const handleSend = () => {
    // In a real app, this would send the invitation
    console.log("Sending invitation:", { email, metrics, dataSets, message })
    alert("Invitation sent successfully!")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - fixed at top */}
        <div className="flex items-center justify-between p-6 pb-4 border-b shrink-0">
          <h2 className="text-xl font-semibold">Invite to Action</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable content area */}
        <CardContent className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="metrics">Metrics Needed</Label>
              <Textarea
                id="metrics"
                placeholder="E.g., Win/Loss Rate, Average Deal Size, Sales Cycle Length..."
                value={metrics}
                onChange={(e) => setMetrics(e.target.value)}
                className="mt-1 min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-1">List the specific metrics you need access to</p>
            </div>

            <div>
              <Label htmlFor="datasets">Data Sets Required</Label>
              <Textarea
                id="datasets"
                placeholder="E.g., Salesforce CRM, HubSpot Marketing, Google Analytics..."
                value={dataSets}
                onChange={(e) => setDataSets(e.target.value)}
                className="mt-1 min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-1">Specify which data sources need to be connected</p>
            </div>

            <div>
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add any context or specific requests..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>

        {/* Footer - fixed at bottom */}
        <div className="flex gap-3 p-6 pt-4 border-t shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!email || !metrics || !dataSets} className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Send Invitation
          </Button>
        </div>
      </Card>
    </div>
  )
}
