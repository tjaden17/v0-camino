"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [setupRequired, setSetupRequired] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      createClient()
    } catch (error) {
      console.log("[v0] Supabase setup error:", error)
      setSetupRequired(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseHost = supabaseUrl.replace(/^https?:\/\//, "").split("/")[0] || "not-set"
      console.log("[v0] Attempting login for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login response:", { data, error })

      if (error) {
        // #region agent log
        const errPayload: Record<string, unknown> = {
          location: "auth/login:signIn-error",
          message: "Supabase signInWithPassword error",
          data: {
            supabaseHost,
            errorMessage: error.message,
            errorStatus: (error as { status?: number }).status,
            errorCode: (error as { code?: string }).code,
            hasUser: !!data?.user,
            identitiesLength: data?.user?.identities?.length,
          },
          timestamp: Date.now(),
          hypothesisId: "H1",
        }
        fetch("http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(errPayload),
        }).catch(() => {})
        // #endregion
        throw error
      }

      if (!data.session) {
        throw new Error(
          "No session created. Please check your email for a confirmation link, or ask your admin to disable email confirmation in Supabase Settings.",
        )
      }

      console.log("[v0] Login successful, redirecting to mission")
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/mission")
    } catch (error: unknown) {
      console.log("[v0] Login error:", error)
      // #region agent log
      const msg = error instanceof Error ? error.message : String(error)
      fetch("http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "auth/login:catch",
          message: "Login catch",
          data: { errorMessage: msg },
          timestamp: Date.now(),
          hypothesisId: "H1",
        }),
      }).catch(() => {})
      // #endregion
      if (error instanceof Error && error.message.includes("Missing Supabase")) {
        setSetupRequired(true)
      } else {
        const msg = error instanceof Error ? error.message : "An error occurred"
        const isInvalidCreds = /invalid login credentials/i.test(msg)
        setError(
          isInvalidCreds
            ? "Invalid login credentials. If you just created an account, check your email and click the confirmation link first, then try again. If an admin created your account, use the temporary password they gave you. Otherwise use Forgot password below to set a new one."
            : msg
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (setupRequired) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Camino
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Focus on what matters</p>
          </div>

          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription>
              Supabase environment variables are not configured. Please complete the setup process to continue.
            </AlertDescription>
          </Alert>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Configuration Missing</CardTitle>
              <CardDescription>Follow these steps to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Click the button below to go to the setup page</li>
                <li>Follow the instructions to configure Supabase</li>
                <li>Add environment variables in the Vars section</li>
                <li>Return here to sign in</li>
              </ol>
              <Button asChild className="w-full">
                <Link href="/setup">Go to Setup</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {error}
                      {error.includes("confirmation") && (
                        <div className="mt-2">
                          <Link href="/setup" className="underline font-semibold">
                            View setup instructions
                          </Link>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
                  Create account
                </Link>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                To see another user&apos;s data: sign in, open Profile, then Log out and sign in with a different account.
              </p>
              <div className="mt-4 pt-4 border-t text-center">
                <Link
                  href="/auth/admin-login"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <span>Administrator access</span>
                  <span>→</span>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
