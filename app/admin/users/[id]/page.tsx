// Admin user profile editor page
import { UserProfileEditor } from "@/components/admin/user-profile-editor"

export default function AdminUserProfilePage({ params }: { params: { id: string } }) {
  return <UserProfileEditor userId={params.id} />
}
