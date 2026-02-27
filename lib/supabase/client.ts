import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

export function createBrowserClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window !== "undefined" && (window as any).ENV?.NEXT_PUBLIC_SUPABASE_URL)

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window !== "undefined" && (window as any).ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!supabaseUrl || !supabaseAnonKey) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/client.ts:missing-env',message:'Supabase env missing',data:{hasUrl:!!supabaseUrl,hasKey:!!supabaseAnonKey},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{})
    // #endregion
    throw new Error(
      "Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the Vars section.",
    )
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bc0a0876-b22a-43a2-8bb5-3b0f14e7c9c0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/client.ts:before-create',message:'About to create Supabase client',data:{urlLen:supabaseUrl?.length,keyLen:supabaseAnonKey?.length},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{})
  // #endregion
  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createClient() {
  return createBrowserClient()
}
