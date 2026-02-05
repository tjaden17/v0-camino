"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

interface TrialEndedModalProps {
  daysRemaining: number
  onClose: () => void
}

export function TrialEndedModal({ daysRemaining, onClose }: TrialEndedModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    router.push("/plans")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <CardTitle>Your trial expires in {daysRemaining} days</CardTitle>
              <CardDescription>Upgrade to continue using all features</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p className="font-medium">When your trial expires, you'll revert to our free plan and:</p>
            <ul className="space-y-1 text-muted-foreground ml-4">
              <li>• Lose access to all but 3 signals + insights</li>
              <li>• Limited to 3 datasets</li>
              <li>• No team collaboration features</li>
              <li>• No access to metrics workshops</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Remind Me Later
            </Button>
            <Button onClick={handleUpgrade} className="flex-1">
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
