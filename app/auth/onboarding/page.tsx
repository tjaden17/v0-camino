'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const ROLES = [
  { id: 'ceo', label: 'CEO/Founder', icon: '👔' },
  { id: 'cfo', label: 'CFO/Finance', icon: '💰' },
  { id: 'vp_sales', label: 'VP Sales', icon: '📈' },
  { id: 'sales_manager', label: 'Sales Manager', icon: '👥' },
  { id: 'vp_marketing', label: 'VP Marketing', icon: '📢' },
  { id: 'vp_product', label: 'VP Product', icon: '🎯' },
  { id: 'vp_cs', label: 'VP Customer Success', icon: '🤝' },
  { id: 'csm', label: 'Customer Success Manager', icon: '💬' },
  { id: 'support_lead', label: 'Support Lead', icon: '🆘' },
  { id: 'operations', label: 'Operations', icon: '⚙️' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUserId(user.id)
      }
    }
    checkUser()
  }, [])

  const handleComplete = async () => {
    if (!selectedRole || !userId) return

    setIsLoading(true)
    try {
      console.log('[v0] Completing onboarding for user:', userId, 'role:', selectedRole)

      const response = await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (response.ok) {
        console.log('[v0] Onboarding completed, redirecting to signals')
        router.push('/signals')
      } else {
        console.error('[v0] Failed to complete onboarding')
        alert('Failed to complete onboarding')
      }
    } catch (error) {
      console.error('[v0] Error completing onboarding:', error)
      alert('Error completing onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Welcome to Camino
          </h1>
          <p className="text-lg text-muted-foreground">
            Tell us your role so we can personalize your signals
          </p>
        </div>

        {/* Progress */}
        <Progress value={100} className="mb-8 h-1" />

        {/* Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Role</CardTitle>
            <CardDescription>
              Choose the role that best matches your position
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{role.icon}</div>
                  <div className="text-sm font-medium">{role.label}</div>
                </button>
              ))}
            </div>

            <div className="pt-6 flex gap-3">
              <Button
                onClick={handleComplete}
                disabled={!selectedRole || isLoading}
                size="lg"
                className="flex-1"
              >
                {isLoading ? 'Setting up...' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
