"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Target, TrendingUp, Share2 } from "lucide-react"

interface CEOWalkthroughModalProps {
  onClose: () => void
}

export function CEOWalkthroughModal({ onClose }: CEOWalkthroughModalProps) {
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
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Lead with Confidence</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You're leading your business towards a destination. Get there faster, with less effort and risk by
                managing the right signals.
              </p>
            </div>
          )}

          {/* Step 2: Set Direction */}
          {currentStep === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">1. Set Direction</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">Tell us your business goals</p>
              <div className="p-4 bg-muted/50 rounded-lg text-left">
                <p className="text-sm text-foreground leading-relaxed">
                  Define where you want your business to go. Your goals become the destination that guides your team's
                  efforts.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: See Signals */}
          {currentStep === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">2. See Signals</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                See the indicators and metrics that matter the most
              </p>
              <div className="p-4 bg-muted/50 rounded-lg text-left">
                <p className="text-sm text-foreground leading-relaxed">
                  Track the leading indicators that show whether you're on course. Choose signals yourself or request
                  them from your teams.
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
              <h3 className="text-xl font-semibold text-foreground mb-3">3. Share & Align</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                So your teams are pulling in the right direction
              </p>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-left">
                <p className="text-sm text-foreground leading-relaxed">
                  Keep everyone aligned on what matters. Share signals with your teams so they know exactly where to
                  focus their efforts.
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
