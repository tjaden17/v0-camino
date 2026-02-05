"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, ArrowRight, Search } from 'lucide-react'
import { dataSourceOptions, getPopularDataSources, type DataSourceOption } from "@/lib/data-sources"

interface ConnectDataSourceModalProps {
  onClose: () => void
  onSelectSource: (sourceType: string) => void
}

export function ConnectDataSourceModal({ onClose, onSelectSource }: ConnectDataSourceModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = ["all", "CRM", "Analytics", "Project Management", "Finance", "Design", "Support", "Marketing", "Infrastructure"]

  const filteredSources = dataSourceOptions.filter((source) => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || source.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularSources = getPopularDataSources()

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-background border border-border rounded-lg shadow-lg mt-20 mb-8">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Connect Data Source</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Choose a data source to connect and start tracking signals
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search data sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Popular Sources */}
          {selectedCategory === "all" && searchQuery === "" && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Popular</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {popularSources.map((source) => (
                  <Card
                    key={source.id}
                    className="p-4 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => onSelectSource(source.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl flex-shrink-0">{source.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1">{source.name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {source.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Sources */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              {selectedCategory === "all" ? "All Data Sources" : selectedCategory}
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSources.map((source) => (
                <Card
                  key={source.id}
                  className="p-3 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onSelectSource(source.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl flex-shrink-0">{source.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{source.name}</h3>
                        {source.popular && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Popular</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{source.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {filteredSources.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No data sources found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
