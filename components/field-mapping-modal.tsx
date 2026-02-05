"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, CheckCircle2 } from 'lucide-react'
import type { SignalTemplate } from "@/lib/signal-templates"
import { toast } from "sonner"

interface FieldMappingModalProps {
  signal: SignalTemplate
  onClose: () => void
  onComplete: () => void
}

export function FieldMappingModal({ signal, onClose, onComplete }: FieldMappingModalProps) {
  const [signalName, setSignalName] = useState(signal.name)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSave = async () => {
    setIsProcessing(true)

    setTimeout(() => {
      toast.success(`${signalName} configuration saved!`)
      setIsProcessing(false)
      onComplete()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg mt-20 mb-8">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Configure Signal</h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isProcessing}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Customize your signal configuration
            </p>
          </div>

          {/* Signal Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Signal Name</label>
            <Input
              value={signalName}
              onChange={(e) => setSignalName(e.target.value)}
              placeholder="Enter signal name"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">Customize how this signal appears in your dashboard</p>
          </div>


          {/* Info */}
          <Card className="p-3 bg-primary/5 border-primary/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This signal will be added to your dashboard with the configured settings.
            </p>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={isProcessing}>
              {isProcessing ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
