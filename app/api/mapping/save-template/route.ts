// API endpoint to save mapping templates for reuse

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, source_type, mappings } = body

    // Save template
    const { data: template, error } = await supabase
      .from("mapping_templates")
      .insert({
        name,
        description,
        source_type,
        mappings,
        organization_id: profile.organization_id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error saving mapping template:", error)
    return NextResponse.json({ error: "Failed to save mapping template" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const source_type = searchParams.get("source_type")

    let query = supabase
      .from("mapping_templates")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false })

    if (source_type) {
      query = query.eq("source_type", source_type)
    }

    const { data: templates, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching mapping templates:", error)
    return NextResponse.json({ error: "Failed to fetch mapping templates" }, { status: 500 })
  }
}
