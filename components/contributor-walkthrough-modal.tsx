"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Eye, Compass, Share2 } from "lucide-react"

interface ContributorWalkthroughModalProps {
  onClose: () => void
}

export function ContributorWalkthroughModal({ onClose }: ContributorWalkthroughModalProps) {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNext = () => {
    if (currentStep < 3) {
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
            {[1, 2, 3].map((step) => (
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
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Preparation in Your Pocket</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Instant access to data, metrics, and signals that matter
              </p>
            </div>
          )}

          {/* Step 2: See Team Signals */}
          {currentStep === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Step 1: See Your Team's Signals</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                View the signals that drive business goals
              </p>
              <div className="p-4 bg-muted/50 rounded-lg text-left">
                <p className="text-sm text-foreground leading-relaxed">
                  Stay informed about the metrics your team is tracking. Understand how your work contributes to key
                  business objectives.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Share & Align */}
          {currentStep === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Step 2: Share & Align</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Collaborate on what matters with your organization
              </p>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-left">
                <p className="text-sm text-foreground leading-relaxed">
                  Browse signals from successful companies. Share insights and stay aligned with your team on priorities
                  and progress.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <Button onClick={handleNext} className="w-full" size="lg">
              {currentStep === 3 ? "View Dashboard" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {currentStep < 3 && (
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
