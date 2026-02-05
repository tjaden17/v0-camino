"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Mail, Linkedin, Twitter, Copy } from "lucide-react"
import { useState } from "react"
import type { Insight } from "@/lib/types"

interface ShareModalProps {
  insight: Insight
  onClose: () => void
}

export function ShareModal({ insight, onClose }: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [copied, setCopied] = useState(false)
  const [customNote, setCustomNote] = useState("")

  const shareText = `Check out this insight: ${insight.header} - ${insight.change} ${insight.timeframe}`
  const shareUrl = `${window.location.origin}/insights/${insight.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link")
    }
  }

  const handleEmailShare = () => {
    if (email) {
      const subject = encodeURIComponent(`Insight: ${insight.header}`)
      const noteText = customNote ? `\n\nNote: ${customNote}\n\n` : "\n\n"
      const body = encodeURIComponent(`${shareText}${noteText}View full details: ${shareUrl}`)
      window.open(`mailto:${email}?subject=${subject}&body=${body}`)
      onClose()
    }
  }

  const handleSocialShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(shareUrl)

    let url = ""
    switch (platform) {
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
    }

    if (url) {
      window.open(url, "_blank")
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <h2 className="font-semibold">Share Insight</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Add a Note (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add a Note (Optional)</label>
            <Textarea
              placeholder="Write a personal note to include with this insight..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Email Share */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Send via Email</label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleEmailShare} disabled={!email}>
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share on Social Media</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSocialShare("linkedin")}
                className="flex-1 flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare("twitter")}
                className="flex-1 flex items-center gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Copy Link</label>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2 bg-transparent"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
