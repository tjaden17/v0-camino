import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Mail, AlertCircle } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-4">
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>We&apos;ve sent you a confirmation link to verify your email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-accent/10 p-4 text-sm text-muted-foreground">
              <p>Click the link in the email to complete your registration.</p>
              <p className="mt-2">If you don&apos;t see it, check your spam folder.</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not receiving emails?</AlertTitle>
          <AlertDescription className="mt-2 space-y-2 text-sm">
            <p>
              For development/testing, Supabase email confirmation may need to be configured in your Supabase dashboard:
            </p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to Authentication → Email Templates</li>
              <li>Ensure email sending is enabled</li>
              <li>
                For development, you can disable email confirmation in Authentication → Settings → Enable email
                confirmations
              </li>
            </ol>
            <p className="mt-2 font-semibold">
              Alternative: In development, check your Supabase project logs to see the confirmation link without waiting
              for email.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
