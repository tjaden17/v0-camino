import { NextResponse } from "next/server"
import { getInterpretation } from "@/lib/interpretation-service"

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  try {
    const { signalId, forceRefresh = false } = await request.json()

    if (!signalId) {
      return NextResponse.json({ error: "signalId is required" }, { status: 400 })
    }

    const result = await getInterpretation(signalId, forceRefresh)

    if (!result) {
      return NextResponse.json(
        { error: "Failed to generate interpretation" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      interpretation: result.interpretation,
      prompt: result.prompt,
      rawOutput: result.rawOutput,
      tokenCost: result.tokenCost,
      cached: result.cached,
    })
  } catch (error) {
    console.error("[v0] Interpretation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
