import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UploadPageClient } from "@/components/upload-page-client"
import { isMasterAdmin } from "@/lib/admin-roles"

export default async function UploadPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const masterAdmin = await isMasterAdmin(user.email || undefined)

  const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).maybeSingle()

  const userOrgId = profile?.organization_id

  let allOrgs: Array<{ id: string; name: string }> = []
  if (masterAdmin) {
    const { data: orgs } = await supabase.from("organizations").select("id, name").order("name")
    allOrgs = orgs || []
  }

  const { data: uploadHistory } = await supabase
    .from("upload_history")
    .select("*")
    .eq("uploaded_by", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <UploadPageClient
      uploadHistory={uploadHistory || []}
      isMasterAdmin={masterAdmin}
      userOrgId={userOrgId || undefined}
      availableOrgs={allOrgs}
    />
  )
}
