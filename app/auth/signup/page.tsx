"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Starting signup process for:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      console.log("[v0] Signup response:", { data, error })

      // #region agent log
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseHost = supabaseUrl.replace(/^https?:\/\//, "").split("/")[0] || "not-set"
      fetch("http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "auth/signup:after-signUp",
          message: "Signup response",
          data: {
            supabaseHost,
            signUpError: error?.message ?? null,
            userCreated: !!data?.user,
            emailConfirmed: !!data?.user?.email_confirmed_at,
            identitiesLength: data?.user?.identities?.length ?? 0,
            sessionPresent: !!data?.session,
          },
          timestamp: Date.now(),
          hypothesisId: "H2",
        }),
      }).catch(() => {})
      // #endregion

      if (error) throw error

      if (data?.user?.identities?.length === 0) {
        console.log("[v0] Email already registered")
        setError("This email is already registered. Please sign in instead.")
        return
      }

      if (data?.user?.email_confirmed_at) {
        // Email confirmation is disabled, user is ready to go
        // Redirect to mission page instead of check-email
        router.push("/mission")
      } else {
        // Email confirmation is enabled, need to check email
        router.push("/auth/check-email")
      }
    } catch (error: unknown) {
      console.log("[v0] Signup error:", error)
      const msg = error instanceof Error ? error.message : "An error occurred"
      const isRateLimit = /rate limit|rate_limit/i.test(msg)
      setError(
        isRateLimit
          ? "Email rate limit exceeded. Supabase limits how many signup emails can be sent in a short time. You can wait an hour and try again, or create this user in Supabase Dashboard: Authentication → Users → Add user (set email and password), then sign in here."
          : msg
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Camino
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Focus on what matters</p>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create account</CardTitle>
            <CardDescription>Get started with Camino today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
