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
      console.log("[v0] Attempting login for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login response:", { data, error })

      if (error) throw error

      if (!data.session) {
        throw new Error(
          "No session created. Please check your email for a confirmation link, or ask your admin to disable email confirmation in Supabase Settings.",
        )
      }

      console.log("[v0] Login successful, redirecting to signals")
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/signals")
    } catch (error: unknown) {
      console.log("[v0] Login error:", error)
      if (error instanceof Error && error.message.includes("Missing Supabase")) {
        setSetupRequired(true)
      } else {
        setError(error instanceof Error ? error.message : "An error occurred")
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
