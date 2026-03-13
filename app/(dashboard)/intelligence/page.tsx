import { RelationshipGraph } from "@/components/intelligence/relationship-graph"
import { DataSourcesPanel } from "@/components/intelligence/data-sources-panel"
import { CrossSourceInsights } from "@/components/intelligence/cross-source-insights"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitBranch, Database, Lightbulb, BarChart3 } from "lucide-react"

export const metadata = {
  title: "Intelligence | Signal",
  description: "Relationship detection and cross-source intelligence"
}

export default function IntelligencePage() {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Intelligence Center</h1>
        <p className="text-muted-foreground mt-2">
          Discover relationships between signals and insights across your data sources
        </p>
      </div>

      <Tabs defaultValue="relationships" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="relationships" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Relationships</span>
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data Sources</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="relationships" className="space-y-6">
          <RelationshipGraph />
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <DataSourcesPanel />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <CrossSourceInsights />
        </TabsContent>
      </Tabs>
    </div>
  )
}
