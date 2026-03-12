import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SetupPage() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isConfigured = hasSupabaseUrl && hasSupabaseKey

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-3xl mx-auto py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Camino Setup</h1>
          <p className="text-muted-foreground mt-2">Configure your Supabase connection to get started</p>
        </div>

        {isConfigured ? (
          <Alert className="mb-6 border-green-500">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Configuration Complete</AlertTitle>
            <AlertDescription>Your Supabase environment variables are configured correctly.</AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Required</AlertTitle>
            <AlertDescription>Please set up your Supabase environment variables to continue.</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Create Supabase Project</CardTitle>
              <CardDescription>Create a free Supabase account and project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    supabase.com <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Click "Start your project" and sign up</li>
                <li>Create a new project (choose any region)</li>
                <li>Wait for the project to finish setting up (2-3 minutes)</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Get API Credentials</CardTitle>
              <CardDescription>Find your project URL and anon key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>In your Supabase project, go to Settings → API</li>
                <li>
                  Copy the <strong>Project URL</strong> (looks like: https://xxxxx.supabase.co)
                </li>
                <li>
                  Copy the <strong>anon public</strong> key (under "Project API keys")
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-orange-500">
            <CardHeader>
              <CardTitle>Step 2.5: Disable Email Confirmation (Development)</CardTitle>
              <CardDescription>Allow instant sign-in without email verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Important for Development:</strong> This allows you to test the app immediately without
                  waiting for confirmation emails. Re-enable for production.
                </AlertDescription>
              </Alert>

              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>In your Supabase project, go to Authentication → Providers</li>
                <li>Click on "Email" provider</li>
                <li>
                  Find the setting <strong>"Confirm email"</strong>
                </li>
                <li>
                  <strong>Toggle it OFF</strong> (disabled)
                </li>
                <li>Click "Save"</li>
              </ol>

              <div className="bg-muted p-3 rounded-lg text-xs space-y-2">
                <p className="font-semibold">Why this matters:</p>
                <p>
                  With email confirmation enabled, new users must click a link in their email before they can sign in.
                  During development, this adds friction and may not work if email delivery isn't configured.
                </p>
                <p className="text-muted-foreground">
                  You can re-enable this before going to production for added security.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Add Environment Variables in v0</CardTitle>
              <CardDescription>Configure your v0 project with Supabase credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li>Open the in-chat sidebar (left side of v0)</li>
                <li>Click on "Vars" section</li>
                <li>Add these two variables:</li>
              </ol>

              <div className="bg-muted p-4 rounded-lg space-y-3 mt-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="text-sm">NEXT_PUBLIC_SUPABASE_URL</strong>
                    {hasSupabaseUrl ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Paste your Project URL here</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>
                    {hasSupabaseKey ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Paste your anon public key here</p>
                </div>
              </div>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  After adding the variables, refresh this page to verify they're working.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 4: Run Database Migrations</CardTitle>
              <CardDescription>Set up the database tables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>In Supabase, go to SQL Editor</li>
                <li>Click "New query"</li>
                <li>
                  Copy and run each SQL script from the <code className="text-xs">scripts/</code> folder in order:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>001_create_profiles.sql</li>
                    <li>002_create_signals.sql</li>
                    <li>003_create_kpis_and_decisions.sql</li>
                    <li>004_data_foundations_and_benchmarks.sql</li>
                  </ul>
                </li>
                <li>Run each script one at a time</li>
              </ol>
            </CardContent>
          </Card>

          {isConfigured && (
            <div className="flex justify-center pt-4">
              <Button asChild size="lg">
                <Link href="/auth/signup">Continue to Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
