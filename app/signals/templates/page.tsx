import { SignalTemplatesService } from "@/lib/signal-templates-service"
import { UserContextService } from "@/lib/user-context-service"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TemplatesPageClient } from "@/components/templates-page-client"

export default async function SignalTemplatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Get user context
  const userContext = await UserContextService.getUserContext(user.id)

  // Get all templates
  const allTemplates = await SignalTemplatesService.getAllTemplates()

  // Get recommended templates if context exists
  let recommendedTemplates = []
  if (userContext) {
    recommendedTemplates = await SignalTemplatesService.getRecommendedTemplates(userContext)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Signal Templates</h1>
        <p className="text-muted-foreground mt-2">
          Choose from pre-built signal templates tailored to your role and industry
        </p>
      </div>

      <TemplatesPageClient templates={allTemplates} recommendedTemplates={recommendedTemplates} userId={user.id} />
    </div>
  )
}
