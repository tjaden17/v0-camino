// UI component for 3-tier intelligent column mapping

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, ChevronDown, Info, Zap } from "lucide-react"
import type { IntelligentMappingResult } from "@/lib/intelligent-mapping-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface IntelligentMappingPanelProps {
  mappingResult: IntelligentMappingResult
  onConfirm: (finalMappings: Record<string, string>) => void
  onBack: () => void
}

export function IntelligentMappingPanel({ mappingResult, onConfirm, onBack }: IntelligentMappingPanelProps) {
  // Initialize with auto-mapped fields
  const [finalMappings, setFinalMappings] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    mappingResult.autoMapped.forEach((m) => {
      initial[m.csvColumn] = m.targetField
    })
    return initial
  })

  const [confirmedSuggestions, setConfirmedSuggestions] = useState<Set<string>>(new Set())
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set())

  const handleConfirmSuggestion = (csvColumn: string, targetField: string) => {
    setFinalMappings((prev) => ({ ...prev, [csvColumn]: targetField }))
    setConfirmedSuggestions((prev) => new Set(prev).add(csvColumn))
    setRejectedSuggestions((prev) => {
      const next = new Set(prev)
      next.delete(csvColumn)
      return next
    })
  }

  const handleRejectSuggestion = (csvColumn: string) => {
    setRejectedSuggestions((prev) => new Set(prev).add(csvColumn))
    setConfirmedSuggestions((prev) => {
      const next = new Set(prev)
      next.delete(csvColumn)
      return next
    })
    setFinalMappings((prev) => {
      const next = { ...prev }
      delete next[csvColumn]
      return next
    })
  }

  const handleChoiceSelect = (csvColumn: string, targetField: string) => {
    setFinalMappings((prev) => ({ ...prev, [csvColumn]: targetField }))
  }

  const handleProceed = () => {
    onConfirm(finalMappings)
  }

  const totalMapped = Object.keys(finalMappings).length
  const canProceed = totalMapped > 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Intelligent Column Mapping</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review and confirm how your data columns map to signal fields
        </p>
      </div>

      {/* Progress indicator */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Mapping Progress</div>
            <div className="text-xs text-muted-foreground mt-1">{totalMapped} columns mapped</div>
          </div>
          <Badge variant={canProceed ? "default" : "secondary"}>{canProceed ? "Ready" : "Review needed"}</Badge>
        </div>
      </Card>

      {/* Tier 1: Auto-mapped (95-100% confidence) */}
      {mappingResult.autoMapped.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-600" />
            <h4 className="font-medium">Auto-Mapped ({mappingResult.autoMapped.length})</h4>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              95-100% confidence
            </Badge>
          </div>
          <div className="space-y-2">
            {mappingResult.autoMapped.map((mapping) => (
              <Card key={mapping.csvColumn} className="p-3 bg-green-50/50 border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-white px-2 py-0.5 rounded">{mapping.csvColumn}</code>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-sm font-medium">{mapping.targetField}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {mapping.reasoning}
                    </div>
                  </div>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tier 2: Suggestions (80-94% confidence) */}
      {mappingResult.suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium">Suggestions ({mappingResult.suggestions.length})</h4>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              80-94% confidence
            </Badge>
          </div>
          <div className="space-y-2">
            {mappingResult.suggestions.map((mapping) => {
              const isConfirmed = confirmedSuggestions.has(mapping.csvColumn)
              const isRejected = rejectedSuggestions.has(mapping.csvColumn)

              return (
                <Card
                  key={mapping.csvColumn}
                  className={`p-3 ${
                    isConfirmed
                      ? "bg-green-50/50 border-green-200"
                      : isRejected
                        ? "bg-gray-50 border-gray-200 opacity-50"
                        : "bg-blue-50/50 border-blue-200"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-white px-2 py-0.5 rounded">{mapping.csvColumn}</code>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-sm font-medium">{mapping.targetField}</span>
                          <Badge variant="secondary" className="text-xs">
                            {mapping.confidence}%
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{mapping.reasoning}</div>
                      </div>
                    </div>

                    {!isConfirmed && !isRejected && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => handleConfirmSuggestion(mapping.csvColumn, mapping.targetField)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleRejectSuggestion(mapping.csvColumn)}>
                          <X className="h-3 w-3 mr-1" />
                          Skip
                        </Button>
                      </div>
                    )}

                    {isConfirmed && (
                      <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Confirmed
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Tier 3: Choices (60-79% confidence) */}
      {mappingResult.choices.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ChevronDown className="h-4 w-4 text-amber-600" />
            <h4 className="font-medium">Choose Mapping ({mappingResult.choices.length})</h4>
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              60-79% confidence
            </Badge>
          </div>
          <div className="space-y-2">
            {mappingResult.choices.map((mapping) => (
              <Card key={mapping.csvColumn} className="p-3 bg-amber-50/50 border-amber-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-white px-2 py-0.5 rounded">{mapping.csvColumn}</code>
                    <span className="text-muted-foreground">→</span>
                  </div>

                  <Select
                    value={finalMappings[mapping.csvColumn] || ""}
                    onValueChange={(value) => handleChoiceSelect(mapping.csvColumn, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a field mapping..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={mapping.targetField}>
                        {mapping.targetField} ({mapping.confidence}% - {mapping.reasoning})
                      </SelectItem>
                      {mapping.alternatives?.map((alt) => (
                        <SelectItem key={alt.targetField} value={alt.targetField}>
                          {alt.targetField} ({alt.confidence}% - {alt.reasoning})
                        </SelectItem>
                      ))}
                      <SelectItem value="skip">Skip this column</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Unmapped columns */}
      {mappingResult.unmapped.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-gray-400" />
            <h4 className="font-medium text-muted-foreground">Unmapped ({mappingResult.unmapped.length})</h4>
          </div>
          <Card className="p-3 bg-gray-50">
            <div className="text-xs text-muted-foreground">
              These columns will be preserved in raw data but not mapped to signals:
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {mappingResult.unmapped.map((col) => (
                <Badge key={col} variant="secondary" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleProceed} disabled={!canProceed} className="flex-1">
          Continue with {totalMapped} mapped column{totalMapped !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  )
}
