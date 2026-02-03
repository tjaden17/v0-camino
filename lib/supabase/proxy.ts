import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Allow setup and auth pages through without logging errors
    if (
      request.nextUrl.pathname.startsWith("/setup") ||
      request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname === "/"
    ) {
      return NextResponse.next()
    }

    // Redirect everything else to setup
    const url = request.nextUrl.clone()
    url.pathname = "/setup"
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch (error) {
    // Continue without user (will be redirected if on protected path)
  }

  const protectedPaths = [
    "/dashboard",
    "/signals",
    "/mission",
    "/profile",
    "/saved",
    "/upload",
    "/decisions",
    "/insights",
    "/guidance",
  ]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Redirect logged in users away from auth pages to dashboard
  if (request.nextUrl.pathname.startsWith("/auth") && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
