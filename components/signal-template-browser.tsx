"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  ShoppingCart,
  Headphones,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import type { SignalTemplate } from "@/lib/signal-templates-service"

interface SignalTemplateBrowserProps {
  templates: SignalTemplate[]
  recommendedTemplates: SignalTemplate[]
  onSelectTemplates: (templateIds: string[]) => void
  isLoading?: boolean
}

export function SignalTemplateBrowser({
  templates,
  recommendedTemplates,
  onSelectTemplates,
  isLoading = false,
}: SignalTemplateBrowserProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  const handleToggleTemplate = (templateId: string) => {
    const newSelected = new Set(selectedTemplates)
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId)
    } else {
      newSelected.add(templateId)
    }
    setSelectedTemplates(newSelected)
  }

  const handleAddSelected = () => {
    onSelectTemplates(Array.from(selectedTemplates))
  }

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "revenue":
      case "financial":
        return <DollarSign className="h-5 w-5" />
      case "engagement":
      case "product":
        return <TrendingUp className="h-5 w-5" />
      case "retention":
      case "customer success":
        return <Users className="h-5 w-5" />
      case "sales":
        return <ShoppingCart className="h-5 w-5" />
      case "support":
        return <Headphones className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "revenue":
      case "financial":
        return "from-green-500 to-emerald-500"
      case "engagement":
      case "product":
        return "from-blue-500 to-cyan-500"
      case "retention":
      case "customer success":
        return "from-purple-500 to-pink-500"
      case "sales":
        return "from-orange-500 to-amber-500"
      case "support":
        return "from-red-500 to-rose-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const categorizedTemplates = filteredTemplates.reduce(
    (acc, template) => {
      const category = template.category || "Other"
      if (!acc[category]) acc[category] = []
      acc[category].push(template)
      return acc
    },
    {} as Record<string, SignalTemplate[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedTemplates.size > 0 && (
          <Button onClick={handleAddSelected} disabled={isLoading}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Add {selectedTemplates.size} Signal{selectedTemplates.size !== 1 && "s"}
          </Button>
        )}
      </div>

      <Tabs defaultValue="recommended" className="w-full">
        <TabsList>
          <TabsTrigger value="recommended">
            <Sparkles className="mr-2 h-4 w-4" />
            Recommended for You
          </TabsTrigger>
          <TabsTrigger value="all">All Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="mt-6">
          {recommendedTemplates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Complete your profile to get personalized recommendations</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendedTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplates.has(template.id)}
                  onToggle={handleToggleTemplate}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                  isRecommended
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-8">
            {Object.entries(categorizedTemplates).map(([category, categoryTemplates]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category}
                  <Badge variant="outline">{categoryTemplates.length}</Badge>
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplates.has(template.id)}
                      onToggle={handleToggleTemplate}
                      getCategoryIcon={getCategoryIcon}
                      getCategoryColor={getCategoryColor}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TemplateCardProps {
  template: SignalTemplate
  isSelected: boolean
  onToggle: (id: string) => void
  getCategoryIcon: (category?: string) => React.ReactNode
  getCategoryColor: (category?: string) => string
  isRecommended?: boolean
}

function TemplateCard({
  template,
  isSelected,
  onToggle,
  getCategoryIcon,
  getCategoryColor,
  isRecommended = false,
}: TemplateCardProps) {
  return (
    <Card
      className={`relative cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
      }`}
      onClick={() => onToggle(template.id)}
    >
      {isRecommended && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-purple-600 text-white">
            <Sparkles className="mr-1 h-3 w-3" />
            Recommended
          </Badge>
        </div>
      )}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor(template.category)}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <Checkbox checked={isSelected} className="mt-1" />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base leading-tight">{template.signalName}</CardTitle>
                {template.signalDescription && (
                  <CardDescription className="text-xs mt-1 line-clamp-2">{template.signalDescription}</CardDescription>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {template.signalUnit && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>Unit: {template.signalUnit}</span>
          </div>
        )}
        {template.industryBenchmark && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Industry Avg: {template.industryBenchmark}</span>
          </div>
        )}
        <div className="flex items-center gap-1 flex-wrap pt-1">
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Priority: {template.defaultPriority}/10
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
