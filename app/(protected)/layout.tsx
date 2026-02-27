"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { BottomNav } from "@/components/bottom-nav"
import { ChangePasswordModal } from "@/components/change-password-modal"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  // #region agent log
  try { fetch('http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(protected)/layout.tsx:mount',message:'Protected layout mounting',data:{pathname:pathname},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{}) } catch (_) {}
  // #endregion
  let supabase: ReturnType<typeof createBrowserClient>
  try {
    supabase = createBrowserClient()
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(protected)/layout.tsx:createClient-throw',message:'createBrowserClient threw',data:{errMsg:String(e instanceof Error?e.message:e),errName:e instanceof Error?e.name:''},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{})
    // #endregion
    throw e
  }

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const AUTH_TIMEOUT_MS = 10_000

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "app/(protected)/layout.tsx:useEffect",
        message: "Protected layout effect ran",
        data: { pathname },
        timestamp: Date.now(),
        hypothesisId: "H1",
      }),
    }).catch(() => {})
    // #endregion

    const clearAuthTimeout = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (cancelled) return
        if (sessionError || !session) {
          clearAuthTimeout()
          setIsLoading(false)
          // #region agent log
          fetch("http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "layout:no-session", message: "Redirect to login (no session)", data: { pathname }, timestamp: Date.now(), hypothesisId: "H1" }) }).catch(() => {})
          // #endregion
          router.push("/auth/login")
          return
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (cancelled) return
        if (error || !user) {
          clearAuthTimeout()
          setIsLoading(false)
          router.push("/auth/login")
          return
        }

        setUser(user)

        // Check onboarding status
        try {
          const onboardingResponse = await fetch("/api/user/onboarding-status")
          if (cancelled) return
          if (onboardingResponse.ok) {
            const onboardingData = await onboardingResponse.json()
            if (!onboardingData.onboardingCompleted) {
              clearAuthTimeout()
              setIsLoading(false)
              const redirectTo = pathname && pathname !== "/" ? pathname : "/mission"
              // #region agent log
              fetch("http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "layout:onboarding", message: "Redirect to onboarding", data: { pathname, redirectTo }, timestamp: Date.now(), hypothesisId: "H3" }) }).catch(() => {})
              // #endregion
              router.push("/auth/onboarding?redirect=" + encodeURIComponent(redirectTo))
              return
            }
          }
        } catch (onboardingError) {
          if (cancelled) return
          console.log("Onboarding check skipped:", onboardingError)
        }

        // Check password change requirement
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("must_change_password, password_changed_at")
            .eq("id", user.id)
            .maybeSingle()

          if (!cancelled && profile?.must_change_password && !profile?.password_changed_at) {
            setMustChangePassword(true)
          }
        } catch (profileError) {
          // If profile or columns don't exist, skip password check
        }

        clearAuthTimeout()
        if (!cancelled) setIsLoading(false)
        // #region agent log
        if (!cancelled) fetch("http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "layout:checkAuth-done", message: "checkAuth completed, no redirect", data: { pathname }, timestamp: Date.now(), hypothesisId: "H1" }) }).catch(() => {})
        // #endregion
      } catch (error) {
        console.error("Protected layout auth error:", error)
        clearAuthTimeout()
        if (!cancelled) setIsLoading(false)
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "layout:catch", message: "Auth useEffect threw", data: { pathname, errMsg: error instanceof Error ? error.message : String(error) }, timestamp: Date.now(), hypothesisId: "H4" }) }).catch(() => {})
        // #endregion
        router.push("/auth/login")
      }
    }

    checkAuth()

    // Only redirect if auth check is still pending after timeout (e.g. network hang)
    timeoutId = setTimeout(() => {
      if (cancelled) return
      timeoutId = null
      setIsLoading(false)
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "layout:timeout", message: "Auth timeout, redirect to login", data: { pathname }, timestamp: Date.now(), hypothesisId: "H5" }) }).catch(() => {})
      // #endregion
      router.push("/auth/login")
    }, AUTH_TIMEOUT_MS)

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

    return () => {
      cancelled = true
      if (timeoutId !== null) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
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

  // #region agent log
  try { fetch('http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(protected)/layout.tsx:render-main',message:'Rendering main content (auth done)',data:{pathname:pathname},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{}) } catch (_) {}
  // #endregion
  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <BottomNav />

      <ChangePasswordModal open={mustChangePassword} onClose={() => setMustChangePassword(false)} isFirstLogin={true} />
    </div>
  )
}
