import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAllDecisions } from "@/lib/decisions-service"
import { DecisionsPageClient } from "@/components/decisions-page-client"

export default async function DecisionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const decisions = await getAllDecisions()

  return <DecisionsPageClient decisions={decisions} userId={user.id} />
}
