import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  // In v0, server-side Supabase calls don't work due to environment restrictions
  // All authentication is handled client-side in the (protected) layout
  // Simply allow all requests through
  return
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
