import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NewDecisionClient } from "@/components/new-decision-client"

export default async function NewDecisionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: signals } = await supabase.from("signals").select("id, name, category").order("name")

  return <NewDecisionClient signals={signals || []} userId={user.id} />
}
