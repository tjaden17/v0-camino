"use client"

import { useState } from "react"
import { SignalTemplateBrowser } from "./signal-template-browser"
import type { SignalTemplate } from "@/lib/signal-templates-service"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface TemplatesPageClientProps {
  templates: SignalTemplate[]
  recommendedTemplates: SignalTemplate[]
  userId: string
}

export function TemplatesPageClient({ templates, recommendedTemplates, userId }: TemplatesPageClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectTemplates = async (templateIds: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/signals/from-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateIds, userId }),
      })

      if (!response.ok) throw new Error("Failed to create signals")

      const data = await response.json()

      toast.success(`Successfully created ${data.signalIds.length} signal(s)`)
      router.push("/signals")
      router.refresh()
    } catch (error) {
      console.error("[TemplatesPageClient] Error creating signals:", error)
      toast.error("Failed to create signals. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SignalTemplateBrowser
      templates={templates}
      recommendedTemplates={recommendedTemplates}
      onSelectTemplates={handleSelectTemplates}
      isLoading={isLoading}
    />
  )
}
