"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Link2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Target,
  Database,
} from "lucide-react"
import Link from "next/link"

interface ProgressiveEmptyStateProps {
  dataState: "zero" | "low" | "rich"
  signalCount: number
  avgDataQuality: number
  recommendations: string[]
}

export function ProgressiveEmptyState({
  dataState,
  signalCount,
  avgDataQuality,
  recommendations,
}: ProgressiveEmptyStateProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Calculate progress: 0-100 based on signal count and data quality
    const signalProgress = Math.min((signalCount / 10) * 50, 50)
    const qualityProgress = (avgDataQuality / 100) * 50
    const totalProgress = signalProgress + qualityProgress

    setTimeout(() => setProgress(totalProgress), 100)
  }, [signalCount, avgDataQuality])

  if (dataState === "zero") {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Camino!</CardTitle>
            <CardDescription className="text-base">
              Let's get you set up. Choose how you'd like to start tracking your business signals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                  <CardTitle className="text-lg">Demo Mode</CardTitle>
                  <CardDescription>Explore with sample data instantly</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link href="/setup">
                      Try Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <Link2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <CardTitle className="text-lg">Connect Data</CardTitle>
                  <CardDescription>Link Zoho, HubSpot, or other sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/integrations">
                      Connect
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <Upload className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-2" />
                  <CardTitle className="text-lg">Upload Files</CardTitle>
                  <CardDescription>Import CSV with your metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/upload">
                      Upload
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What you'll get</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex gap-3">
                <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Automated Signals</p>
                  <p className="text-sm text-muted-foreground">Track key metrics that matter</p>
                </div>
              </div>
              <div className="flex gap-3">
                <BarChart3 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Smart Analysis</p>
                  <p className="text-sm text-muted-foreground">AI-powered insights & trends</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Decision Support</p>
                  <p className="text-sm text-muted-foreground">Context for better decisions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (dataState === "low") {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>You're Making Progress!</CardTitle>
                <CardDescription>Keep going to unlock full insights</CardDescription>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Setup Progress</span>
                <span className="text-muted-foreground">
                  {signalCount} signals, {avgDataQuality}% avg quality
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="grid gap-3 mt-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-primary" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button asChild>
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Add More Data
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/integrations">
                  <Link2 className="mr-2 h-4 w-4" />
                  Connect Source
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">First signals created</p>
                  <p className="text-sm text-muted-foreground">{signalCount} signals tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Reach 10+ signals</p>
                  <p className="text-sm text-muted-foreground">Get comprehensive dashboard view</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Improve data quality</p>
                  <p className="text-sm text-muted-foreground">Target 75%+ quality score</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
