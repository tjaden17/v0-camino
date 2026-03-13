import { ImpactPredictionService } from "@/lib/impact-prediction-service"
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

    const body = await request.json()
    const { signalId, hypotheticalChange, includeKPIMatrix } = body

    if (!signalId) {
      return NextResponse.json({ error: "Signal ID required" }, { status: 400 })
    }

    // Generate prediction
    const prediction = await ImpactPredictionService.predictImpact(signalId, hypotheticalChange)

    // Optionally include KPI matrix
    let kpiMatrices = []
    if (includeKPIMatrix) {
      kpiMatrices = await ImpactPredictionService.generateKPIImpactMatrix(user.id)
    }

    return NextResponse.json({
      success: true,
      prediction,
      kpiMatrices,
    })
  } catch (error) {
    console.error("[API] Error predicting impact:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
