"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Target, TrendingUp, Share2, Trophy } from "lucide-react"

interface ManagerWalkthroughModalProps {
  onClose: () => void
}

export function ManagerWalkthroughModal({ onClose }: ManagerWalkthroughModalProps) {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-colors ${step === currentStep ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          {/* Step 1: Overview */}
          {currentStep === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Lead Your Team to Winning</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Ensure your team's efforts are driving the right metrics
              </p>
            </div>
          )}

          {/* Step 2: Align with ELT */}
          {currentStep === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Step 1: Align with ELT</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Understand where the business is heading
              </p>
              <div className="p-4 bg-muted/50 rounded-lg text-left">
                <p className="text-sm text-foreground leading-relaxed">
                  Stay connected to executive leadership's vision and goals. Know how your team's work contributes to
                  the bigger picture.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Choose Signals */}
          {currentStep === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Step 2: Choose Signals</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">Select signals to measure and manage</p>
              <div className="p-4 bg-muted/50 rounded-lg text-left">
                <p className="text-sm text-foreground leading-relaxed">
                  Pick the metrics that matter most for your team. Connect your data sources and track what drives
                  success.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Share & Align */}
          {currentStep === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Step 3: Share & Align</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">Keep ELT and your team aligned</p>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-left">
                <p className="text-sm text-foreground leading-relaxed">
                  Share your team's signals with leadership and team members. Build transparency and alignment on what
                  you're tracking.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <Button onClick={handleNext} className="w-full" size="lg">
              {currentStep === 4 ? "View Dashboard" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {currentStep < 4 && (
              <Button onClick={handleSkip} variant="ghost" className="w-full" size="sm">
                Skip Tutorial
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
