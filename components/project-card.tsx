"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronRight, Edit2, Save, X, Trash2 } from "lucide-react"
import { mockInsights } from "@/lib/mock-data"
import { InsightCard } from "@/components/insight-card"
import type { Project } from "@/lib/types"

interface ProjectCardProps {
  project: Project
  onUpdate: (project: Project) => void
  onDelete: (projectId: string) => void
  isDragging: boolean
  onDrop: (insightId: string) => void
}

export function ProjectCard({ project, onUpdate, onDelete, isDragging, onDrop }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(project.name)
  const [editedAction, setEditedAction] = useState(project.sections.action || "")
  const [editedResultText, setEditedResultText] = useState(project.sections.resultText || "")

  const handleSave = () => {
    onUpdate({
      ...project,
      name: editedName,
      sections: {
        ...project.sections,
        action: editedAction,
        resultText: editedResultText,
      },
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedName(project.name)
    setEditedAction(project.sections.action || "")
    setEditedResultText(project.sections.resultText || "")
    setIsEditing(false)
  }

  const handleDrop = (e: React.DragEvent, section: "because" | "result") => {
    e.preventDefault()
    e.stopPropagation()
    const insightId = e.dataTransfer.getData("insightId")
    if (insightId) {
      const updatedSections = { ...project.sections }
      if (section === "because") {
        updatedSections.because = [...(updatedSections.because || []), insightId]
      } else {
        updatedSections.result = [...(updatedSections.result || []), insightId]
      }
      onUpdate({ ...project, sections: updatedSections })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeInsight = (insightId: string, section: "because" | "result") => {
    const updatedSections = { ...project.sections }
    if (section === "because") {
      updatedSections.because = updatedSections.because?.filter((id) => id !== insightId)
    } else {
      updatedSections.result = updatedSections.result?.filter((id) => id !== insightId)
    }
    onUpdate({ ...project, sections: updatedSections })
  }

  const becauseInsights =
    project.sections.because?.map((id) => mockInsights.find((i) => i.id === id)).filter(Boolean) || []
  const resultInsights =
    project.sections.result?.map((id) => mockInsights.find((i) => i.id === id)).filter(Boolean) || []

  return (
    <Card className={`${isDragging ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="cursor-pointer" onClick={() => !isEditing && setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {isEditing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-lg font-semibold"
              />
            ) : (
              <CardTitle>{project.name}</CardTitle>
            )}
            <Badge variant={project.type === "review" ? "secondary" : "default"}>
              {project.type === "review" ? "Review" : "Recommend"}
            </Badge>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(project.id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancel()
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSave()
                  }}
                >
                  <Save className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Action Section */}
          <div>
            <h3 className="font-semibold mb-2">{project.type === "review" ? "We" : "We should"}</h3>
            {isEditing ? (
              <Textarea
                value={editedAction}
                onChange={(e) => setEditedAction(e.target.value)}
                placeholder={project.type === "review" ? "What did you do?" : "What should be done?"}
                className="min-h-[60px]"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{project.sections.action}</p>
            )}
          </div>

          {/* Because Section */}
          <div
            onDrop={(e) => handleDrop(e, "because")}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-4 ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <h3 className="font-semibold mb-3">Because</h3>
            {becauseInsights.length > 0 ? (
              <div className="space-y-3">
                {becauseInsights.map(
                  (insight) =>
                    insight && (
                      <div key={insight.id} className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 z-10 h-6 w-6"
                          onClick={() => removeInsight(insight.id, "because")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <InsightCard
                          insight={insight}
                          isSaved={false}
                          onSave={() => {}}
                          onShare={() => {}}
                          onExpand={() => {}}
                          fullScreen={false}
                        />
                      </div>
                    ),
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {isDragging ? "Drop insight cards here" : "Drag and drop insight cards here"}
              </p>
            )}
          </div>

          {/* Result Section */}
          <div
            onDrop={(e) => handleDrop(e, "result")}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-4 ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <h3 className="font-semibold mb-3">{project.type === "review" ? "We saw" : "We expect"}</h3>
            {resultInsights.length > 0 ? (
              <div className="space-y-3">
                {resultInsights.map(
                  (insight) =>
                    insight && (
                      <div key={insight.id} className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 z-10 h-6 w-6"
                          onClick={() => removeInsight(insight.id, "result")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <InsightCard
                          insight={insight}
                          isSaved={false}
                          onSave={() => {}}
                          onShare={() => {}}
                          onExpand={() => {}}
                          fullScreen={false}
                        />
                      </div>
                    ),
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {isDragging ? "Drop insight cards here" : "Drag and drop insight cards here"}
              </p>
            )}
          </div>

          {/* Result Text */}
          <div>
            {isEditing ? (
              <Textarea
                value={editedResultText}
                onChange={(e) => setEditedResultText(e.target.value)}
                placeholder="And overall, we saw/expect..."
                className="min-h-[60px]"
              />
            ) : (
              <p className="text-sm font-medium">{project.sections.resultText}</p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
