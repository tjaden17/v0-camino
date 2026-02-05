"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface AdditionalContext {
  businessKPIs: string[]
  productKPIs: string[]
  competitors: string[]
  productCategory: string
  website: string
  deadlines: string[]
  constraints: string[]
}

interface AddContextModalProps {
  context: AdditionalContext
  onSave: (context: AdditionalContext) => void
  onClose: () => void
}

export function AddContextModal({ context, onSave, onClose }: AddContextModalProps) {
  const [editedContext, setEditedContext] = useState(context)
  const [newItems, setNewItems] = useState({
    businessKPI: "",
    productKPI: "",
    competitor: "",
    deadline: "",
    constraint: "",
  })

  const addItem = (type: keyof typeof newItems, arrayKey: keyof AdditionalContext) => {
    const value = newItems[type].trim()
    if (value) {
      setEditedContext((prev) => ({
        ...prev,
        [arrayKey]: [...(prev[arrayKey] as string[]), value],
      }))
      setNewItems((prev) => ({ ...prev, [type]: "" }))
    }
  }

  const removeItem = (arrayKey: keyof AdditionalContext, index: number) => {
    setEditedContext((prev) => ({
      ...prev,
      [arrayKey]: (prev[arrayKey] as string[]).filter((_, i) => i !== index),
    }))
  }

  const handleSave = () => {
    onSave(editedContext)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Add Context Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business KPIs */}
          <div className="space-y-2">
            <Label>Business KPIs</Label>
            <div className="flex gap-2">
              <Input
                value={newItems.businessKPI}
                onChange={(e) => setNewItems((prev) => ({ ...prev, businessKPI: e.target.value }))}
                placeholder="Add business KPI"
                onKeyPress={(e) => e.key === "Enter" && addItem("businessKPI", "businessKPIs")}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => addItem("businessKPI", "businessKPIs")}
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedContext.businessKPIs.map((kpi, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeItem("businessKPIs", index)}
                >
                  {kpi} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Product KPIs */}
          <div className="space-y-2">
            <Label>Product KPIs</Label>
            <div className="flex gap-2">
              <Input
                value={newItems.productKPI}
                onChange={(e) => setNewItems((prev) => ({ ...prev, productKPI: e.target.value }))}
                placeholder="Add product KPI"
                onKeyPress={(e) => e.key === "Enter" && addItem("productKPI", "productKPIs")}
              />
              <Button variant="outline" size="sm" onClick={() => addItem("productKPI", "productKPIs")} className="px-3">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedContext.productKPIs.map((kpi, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeItem("productKPIs", index)}
                >
                  {kpi} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Competitors */}
          <div className="space-y-2">
            <Label>Competitors</Label>
            <div className="flex gap-2">
              <Input
                value={newItems.competitor}
                onChange={(e) => setNewItems((prev) => ({ ...prev, competitor: e.target.value }))}
                placeholder="Add competitor"
                onKeyPress={(e) => e.key === "Enter" && addItem("competitor", "competitors")}
              />
              <Button variant="outline" size="sm" onClick={() => addItem("competitor", "competitors")} className="px-3">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedContext.competitors.map((competitor, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => removeItem("competitors", index)}
                >
                  {competitor} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Product Category */}
          <div className="space-y-2">
            <Label>Product Category</Label>
            <Input
              value={editedContext.productCategory}
              onChange={(e) => setEditedContext((prev) => ({ ...prev, productCategory: e.target.value }))}
              placeholder="e.g., SaaS Analytics Platform"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label>Product Website</Label>
            <Input
              value={editedContext.website}
              onChange={(e) => setEditedContext((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="https://yourproduct.com"
            />
          </div>

          <div className="flex gap-2 pt-4">
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
