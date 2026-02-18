import { redirect } from "next/navigation"

/**
 * Redirect /admin-login -> /auth/admin-login so both URLs work.
 */
export default function AdminLoginRedirect() {
  redirect("/auth/admin-login")
}
