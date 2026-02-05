"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Target, Eye, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function ManagerLanding() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Camino</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push("/onboarding")}>
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Preparation in Your Pocket
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Helps organizations be data-driven with the right signals at the right time
          </p>
        </div>

        {/* How It Works */}
        <div className="w-full space-y-6 mb-12">
          <h3 className="text-xl font-semibold text-center mb-6">How It Works</h3>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Set Direction</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Define your business goals and what success looks like for your team
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">See Signals</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect your data sources and view key signals that drive your business forward
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Save & Share</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Save important insights and share them with your team to build alignment
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <Button size="lg" className="w-full max-w-sm" onClick={() => router.push("/onboarding")}>
          Get Started
        </Button>
      </div>
    </div>
  )
}
