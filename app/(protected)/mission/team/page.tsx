import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUsersWithKPIs } from "@/lib/mission-service"
import { TeamDirectoryClient } from "@/components/team-directory-client"

export default async function TeamDirectoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const usersWithKPIs = await getUsersWithKPIs()

  return <TeamDirectoryClient users={usersWithKPIs} />
}
