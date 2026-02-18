"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Loader2, Building2, User, Target, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Step 1: Organization details
const industries = [
  { value: "b2b_saas", label: "B2B SaaS" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "fintech", label: "Financial Services / Fintech" },
  { value: "healthcare", label: "Healthcare" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "professional_services", label: "Professional Services" },
  { value: "retail", label: "Retail" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
]

const companySizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
]

const businessStages = [
  { value: "pre_revenue", label: "Pre-revenue / Building" },
  { value: "early_stage", label: "Early Stage (Finding PMF)" },
  { value: "growth", label: "Growth Stage (Scaling)" },
  { value: "expansion", label: "Expansion (Multi-product/market)" },
  { value: "mature", label: "Mature / Optimizing" },
]

// Step 2: Role details
const roles = [
  { value: "ceo_founder", label: "CEO / Founder" },
  { value: "cfo", label: "CFO" },
  { value: "coo", label: "COO" },
  { value: "cro", label: "CRO / Chief Revenue Officer" },
  { value: "vp_sales", label: "VP Sales" },
  { value: "vp_marketing", label: "VP Marketing" },
  { value: "vp_product", label: "VP Product" },
  { value: "vp_engineering", label: "VP Engineering" },
  { value: "vp_cs", label: "VP Customer Success" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "analyst", label: "Analyst" },
  { value: "other", label: "Other" },
]

const departments = [
  { value: "executive", label: "Executive / Leadership" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "product", label: "Product" },
  { value: "engineering", label: "Engineering" },
  { value: "customer_success", label: "Customer Success" },
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "hr", label: "HR / People" },
  { value: "other", label: "Other" },
]

const seniorityLevels = [
  { value: "c_level", label: "C-Level" },
  { value: "vp", label: "VP / SVP" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "individual_contributor", label: "Individual Contributor" },
]

// Step 3: Goals / KPIs
const goalCategories = [
  {
    category: "Revenue & Growth",
    goals: [
      { value: "increase_revenue", label: "Increase revenue" },
      { value: "improve_margins", label: "Improve margins" },
      { value: "accelerate_growth", label: "Accelerate growth rate" },
      { value: "expand_arr", label: "Grow ARR / MRR" },
    ],
  },
  {
    category: "Sales & Pipeline",
    goals: [
      { value: "increase_pipeline", label: "Increase pipeline" },
      { value: "improve_win_rate", label: "Improve win rate" },
      { value: "shorten_sales_cycle", label: "Shorten sales cycle" },
      { value: "increase_deal_size", label: "Increase average deal size" },
    ],
  },
  {
    category: "Customer Success",
    goals: [
      { value: "reduce_churn", label: "Reduce churn" },
      { value: "improve_nrr", label: "Improve Net Revenue Retention" },
      { value: "increase_nps", label: "Increase NPS / CSAT" },
      { value: "improve_onboarding", label: "Improve customer onboarding" },
    ],
  },
  {
    category: "Efficiency & Operations",
    goals: [
      { value: "reduce_cac", label: "Reduce Customer Acquisition Cost" },
      { value: "improve_ltv_cac", label: "Improve LTV:CAC ratio" },
      { value: "increase_efficiency", label: "Increase operational efficiency" },
      { value: "reduce_costs", label: "Reduce costs" },
    ],
  },
]

const TOTAL_STEPS = 3

function OnboardingContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Organization
    organizationName: "",
    industry: "",
    companySize: "",
    businessStage: "",
    // Step 2: Role
    role: "",
    department: "",
    seniorityLevel: "",
    // Step 3: Goals
    selectedGoals: [] as string[],
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        setUserId(user.id)
        
        // Check if already onboarded – send back to intended page (e.g. /upload) if passed
        const response = await fetch("/api/user/onboarding-status")
        if (response.ok) {
          const data = await response.json()
          if (data.onboardingCompleted) {
            const redirect = searchParams.get("redirect")
            const target = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard"
            router.push(target)
            return
          }
        }
      }
      setIsCheckingAuth(false)
    }
    checkUser()
  }, [router, supabase])

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleGoal = (goalValue: string) => {
    setFormData(prev => {
      const goals = prev.selectedGoals.includes(goalValue)
        ? prev.selectedGoals.filter(g => g !== goalValue)
        : [...prev.selectedGoals, goalValue]
      return { ...prev, selectedGoals: goals }
    })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.organizationName && formData.industry && formData.companySize && formData.businessStage
      case 2:
        return formData.role && formData.department && formData.seniorityLevel
      case 3:
        return formData.selectedGoals.length >= 1
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to complete onboarding")
      }

      const redirect = searchParams.get("redirect")
      const target = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard"
      router.push(target)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Camino
            </h1>
            <span className="text-sm text-muted-foreground">Step {currentStep} of {TOTAL_STEPS}</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { step: 1, icon: Building2, label: "Organization" },
            { step: 2, icon: User, label: "Your Role" },
            { step: 3, icon: Target, label: "Your Goals" },
          ].map(({ step, icon: Icon, label }) => (
            <div key={step} className="flex items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                currentStep === step 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : currentStep > step 
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-muted/50 text-muted-foreground"
              )}>
                {currentStep > step ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={cn(
                "text-sm font-medium hidden sm:block",
                currentStep === step ? "text-foreground" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card className="border-2">
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Tell us about your organization
                </CardTitle>
                <CardDescription>
                  This helps us understand your business context and show relevant signals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization name</Label>
                  <Input
                    id="orgName"
                    placeholder="Acme Inc."
                    value={formData.organizationName}
                    onChange={(e) => updateFormData("organizationName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={formData.industry} onValueChange={(v) => updateFormData("industry", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Company size</Label>
                  <Select value={formData.companySize} onValueChange={(v) => updateFormData("companySize", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Business stage</Label>
                  <Select value={formData.businessStage} onValueChange={(v) => updateFormData("businessStage", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessStages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Tell us about your role
                </CardTitle>
                <CardDescription>
                  This helps us prioritize signals that matter most to you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Your role</Label>
                  <Select value={formData.role} onValueChange={(v) => updateFormData("role", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={formData.department} onValueChange={(v) => updateFormData("department", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Seniority level</Label>
                  <Select value={formData.seniorityLevel} onValueChange={(v) => updateFormData("seniorityLevel", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seniority level" />
                    </SelectTrigger>
                    <SelectContent>
                      {seniorityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  What are your top priorities?
                </CardTitle>
                <CardDescription>
                  Select the goals that matter most to you (select at least 1)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goalCategories.map((category) => (
                    <div key={category.category}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">{category.category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.goals.map((goal) => (
                          <label
                            key={goal.value}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                              formData.selectedGoals.includes(goal.value)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <Checkbox
                              checked={formData.selectedGoals.includes(goal.value)}
                              onCheckedChange={() => toggleGoal(goal.value)}
                            />
                            <span className="text-sm">{goal.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {/* Error display */}
          {error && (
            <div className="px-6 pb-4">
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            </div>
          )}

          {/* Navigation */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={!canProceed() || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete setup
                    <Check className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}

function OnboardingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingContent />
    </Suspense>
  )
}
