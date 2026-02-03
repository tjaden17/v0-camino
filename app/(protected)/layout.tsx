"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/bottom-nav"
import Link from "next/link"
import { ChangePasswordModal } from "@/components/change-password-modal"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          router.push("/auth/login")
          return
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/auth/login")
        } else {
          setUser(user)

          // Check onboarding status
          try {
            const onboardingResponse = await fetch("/api/user/onboarding-status")
            if (onboardingResponse.ok) {
              const onboardingData = await onboardingResponse.json()
              if (!onboardingData.onboardingCompleted) {
                router.push("/auth/onboarding")
                return
              }
            }
          } catch (onboardingError) {
            // If onboarding check fails, continue (might be first-time setup)
            console.log("Onboarding check skipped:", onboardingError)
          }

          // Check password change requirement
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("must_change_password, password_changed_at")
              .eq("id", user.id)
              .single()

            if (profile?.must_change_password && !profile?.password_changed_at) {
              setMustChangePassword(true)
            }
          } catch (profileError) {
            // If profile or columns don't exist, skip password check
          }

          setIsLoading(false)
        }
      } catch (error) {
        console.error("Protected layout auth error:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/auth/login")
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-primary-foreground">
            Camino
          </Link>
        </div>
      </header>
      {children}
      <BottomNav />

      <ChangePasswordModal open={mustChangePassword} onClose={() => setMustChangePassword(false)} isFirstLogin={true} />
    </div>
  )
}
