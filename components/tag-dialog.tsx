"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus } from "lucide-react"
import { getActiveProfile } from "@/lib/demo-mode"

interface TagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issueName: string
  existingTags?: string[]
}

export function TagDialog({ open, onOpenChange, issueName, existingTags = [] }: TagDialogProps) {
  const activeProfile = getActiveProfile()
  const [selectedTags, setSelectedTags] = useState<string[]>(existingTags)
  const [customTag, setCustomTag] = useState("")

  // Get default tags from user's upcoming decisions
  const defaultTags = activeProfile.upcomingDecisions?.map((d) => d.decision) || [
    "2026 Roadmap",
    "Q1 Planning",
    "Team Review",
  ]

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleAddCustomTag = () => {
    if (customTag && !selectedTags.includes(customTag)) {
      setSelectedTags([...selectedTags, customTag])
      setCustomTag("")
    }
  }

  const handleSave = () => {
    // In a real app, this would save to the backend
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tag Issue</DialogTitle>
          <DialogDescription>Add tags to organize "{issueName}" and make it easier to find later</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Your Decisions</Label>
            <div className="flex flex-wrap gap-2">
              {defaultTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="custom-tag" className="text-sm font-medium mb-2 block">
              Custom Tag
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-tag"
                placeholder="Enter custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddCustomTag()
                  }
                }}
              />
              <Button variant="outline" size="icon" onClick={handleAddCustomTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Selected Tags</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleToggleTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Tags</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
