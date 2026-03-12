import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UploadProtoClient } from "@/components/upload-proto-client"

export default async function UploadPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <UploadProtoClient />
}
