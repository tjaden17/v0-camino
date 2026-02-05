"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

interface UpgradePromptModalProps {
  onClose: () => void
  feature: string
}

export function UpgradePromptModal({ onClose, feature }: UpgradePromptModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    router.push("/plans")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Upgrade Required</CardTitle>
              <CardDescription>You'll need to purchase additional credits</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You will need to purchase additional credits for {feature}. Would you like to go ahead?
          </p>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleUpgrade} className="flex-1">
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
