"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface EditContextModalProps {
  context: string
  onSave: (context: string) => void
  onClose: () => void
}

export function EditContextModal({ context, onSave, onClose }: EditContextModalProps) {
  const [editedContext, setEditedContext] = useState(context)

  const handleSave = () => {
    onSave(editedContext)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Edit Your Context</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={editedContext}
            onChange={(e) => setEditedContext(e.target.value)}
            className="min-h-32 resize-none"
            placeholder="Describe your role, goals, and objectives..."
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
