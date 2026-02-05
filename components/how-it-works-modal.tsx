"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Bookmark, Share2, TrendingUp } from "lucide-react"

interface HowItWorksModalProps {
  onClose: () => void
}

export function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
      router.push("/insights")
    }
  }

  const handleSkip = () => {
    onClose()
    router.push("/insights")
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

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Great. You've updated your destination.</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Now let's help get you there.</p>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Insight Cards</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Think of this as news headlines related to your business, summarised and delivered to you daily.
              </p>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Personalised Insights</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Once you've connected to your product data, you'll see insights based on your actual customer and
                product data. Think of this as critical trends from your customer support data, product analytics,
                customer research etc, summarised and delivered to you daily.
              </p>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="flex gap-1">
                  <Bookmark className="w-6 h-6 text-primary" />
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Save & Share</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Save insights to help guide the way on your journey. Share insights to build alignment with your team.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <Button onClick={handleNext} className="w-full" size="lg">
              {currentStep === 4 ? "Get Started" : "Next"}
            </Button>
            {currentStep < 4 && (
              <Button onClick={handleSkip} variant="ghost" className="w-full" size="sm">
                Skip
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
