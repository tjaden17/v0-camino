"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Link2, Check } from "lucide-react"
import { useState } from "react"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issueName: string
  signalId?: string
}

export function ShareDialog({ open, onOpenChange, issueName, signalId }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")

  const logShare = async (method: "copy" | "email", recipientEmail?: string) => {
    if (!signalId) return
    try {
      await fetch("/api/signals/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signalId,
          shareMethod: method,
          recipientEmail,
        }),
      })
    } catch (error) {
      console.error("Failed to log share:", error)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    await logShare("copy")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailShare = async () => {
    const subject = encodeURIComponent(`Camino: ${issueName}`)
    const body = encodeURIComponent(
      `${note ? note + "\n\n" : ""}Check out this issue analysis: ${window.location.href}`,
    )
    const mailto = email ? `${email}?subject=${subject}&body=${body}` : `?subject=${subject}&body=${body}`
    await logShare("email", email || undefined)
    window.location.href = `mailto:${mailto}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Share: {issueName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Email input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">
              Email Address (optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
            />
          </div>

          {/* Note input */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm">
              Add a Note (optional)
            </Label>
            <Textarea
              id="note"
              placeholder="Add context or thoughts to share..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-background resize-none"
              rows={3}
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <Button variant="default" className="w-full justify-start gap-3" onClick={handleEmailShare}>
              <Mail className="h-5 w-5" />
              <span>Share via Email</span>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 bg-transparent" onClick={handleCopyLink}>
              {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
