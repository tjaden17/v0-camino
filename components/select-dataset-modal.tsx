"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Database, Search, X } from "lucide-react"
import { type allDatasets, getDatasetsByCategory } from "@/lib/all-datasets"

interface SelectDatasetModalProps {
  onClose: () => void
  onSelect: (dataset: { id: string; name: string }) => void
}

export function SelectDatasetModal({ onClose, onSelect }: SelectDatasetModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const datasetsByCategory = getDatasetsByCategory()

  const filteredCategories = Object.entries(datasetsByCategory).reduce(
    (acc, [category, datasets]) => {
      const filtered = datasets.filter((ds) => ds.name.toLowerCase().includes(searchQuery.toLowerCase()))
      if (filtered.length > 0) {
        acc[category] = filtered
      }
      return acc
    },
    {} as Record<string, typeof allDatasets>,
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">Connect Other Dataset</h2>
            <p className="text-sm text-muted-foreground">Choose from our comprehensive list</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {Object.entries(filteredCategories).map(([category, datasets]) => (
              <div key={category}>
                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {datasets.map((dataset) => (
                    <Card
                      key={dataset.id}
                      className="p-3 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => onSelect({ id: dataset.id, name: dataset.name })}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                          <Database className="w-4 h-4 text-primary" />
                        </div>
                        <p className="font-medium text-sm">{dataset.name}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(filteredCategories).length === 0 && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No datasets found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
