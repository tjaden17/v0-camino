import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getDecisionById } from "@/lib/decisions-service"
import { DecisionDetailClient } from "@/components/decision-detail-client"

export default async function DecisionDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const decision = await getDecisionById(params.id)

  if (!decision) {
    redirect("/decisions")
  }

  return <DecisionDetailClient decision={decision} userId={user.id} />
}
