"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, AlertCircle, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      console.log("[v0] Admin login attempt for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (!data.session) {
        throw new Error("No session created. Please check your credentials.")
      }

      // Check if user is master admin
      if (data.user?.email !== "admin@admin.com") {
        // Not a master admin, sign out and show error
        await supabase.auth.signOut()
        throw new Error("Access denied. This login is for master administrators only.")
      }

      console.log("[v0] Master admin login successful, redirecting to organisations")
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/admin/organisations")
    } catch (error: unknown) {
      console.log("[v0] Admin login error:", error)
      const message = error instanceof Error ? error.message : "An error occurred"
      const isInvalidCreds = /invalid login credentials/i.test(message)
      setError(
        isInvalidCreds
          ? "Invalid login credentials. Ensure the user admin@admin.com exists in Supabase Auth (Dashboard → Authentication → Users) and the password is correct. You can create or reset the user there."
          : message
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Camino Master Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Administrative access only</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription>Sign in with master administrator credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@admin.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="font-mono"
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
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Sign in as Admin
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                <Link href="/auth/login" className="text-muted-foreground hover:text-primary transition-colors">
                  ← Back to regular login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">This page is restricted to Camino administrators</p>
        </div>
      </div>
    </div>
  )
}
