"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Lightbulb,
  ArrowRight,
  LinkIcon,
  Share2,
  Bookmark,
  MoreHorizontal,
  Sparkles,
  Trash2,
  X,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Check,
  Search,
  Plus,
  Filter,
  Mail,
  Copy,
} from "lucide-react"

export default function SignalCardSpec() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-0">
            Technical Specification
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Signal Card Screen Spec</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed max-w-3xl">
            Complete specification for replicating the Signals dashboard screen, including all components, data models,
            interactions, filtering logic, and visual design tokens.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge variant="secondary">v1.0</Badge>
            <Badge variant="secondary">React / Next.js</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">shadcn/ui</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Table of Contents */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "1. Screen Overview",
              "2. Data Model",
              "3. Signal Card (Compact View)",
              "4. Ticker Card (Alternate View)",
              "5. Expanded Signal Card (Detail Modal)",
              "6. Share Modal",
              "7. Filter Bar",
              "8. Add Signal Modal",
              "9. Screen Layout & Composition",
              "10. Interaction States",
              "11. Design Tokens",
              "12. Accessibility",
            ].map((item) => (
              <p key={item} className="text-sm text-muted-foreground py-1">
                {item}
              </p>
            ))}
          </div>
        </section>

        {/* 1. Screen Overview */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">1. Screen Overview</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The Signals screen is the primary dashboard where users view, filter, save, share, and manage insight cards.
            It serves as the central hub for consuming metric intelligence. The screen is mobile-first, designed for
            390px viewport width as the primary target, scaling up to desktop.
          </p>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Screen Anatomy</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 w-8 justify-center">1</Badge>
                <div>
                  <p className="font-medium">Fixed Header</p>
                  <p className="text-muted-foreground">App logo, page title, notification bell icon with unread count badge. Stays pinned to top on scroll.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 w-8 justify-center">2</Badge>
                <div>
                  <p className="font-medium">Sticky Filter Bar</p>
                  <p className="text-muted-foreground">Horizontally scrollable row of dropdown buttons: Signals (category/metric filter), Assigned (team filter), View toggle (Card/Ticker). Sticks below header on scroll with backdrop blur.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 w-8 justify-center">3</Badge>
                <div>
                  <p className="font-medium">Scrollable Card Feed</p>
                  <p className="text-muted-foreground">Vertical list of signal cards. Full width, single column. Renders either compact cards or ticker rows based on view mode toggle.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 w-8 justify-center">4</Badge>
                <div>
                  <p className="font-medium">Floating Action Button</p>
                  <p className="text-muted-foreground">Bottom-right "+" button to add new signals. Only visible to users with "edit" permission. Positioned above bottom navigation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 w-8 justify-center">5</Badge>
                <div>
                  <p className="font-medium">Bottom Navigation</p>
                  <p className="text-muted-foreground">Fixed tab bar: Signals (active), Impact, Saved, Profile. Respects safe-area-inset-bottom for notched devices.</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 2. Data Model */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">2. Data Model</h2>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Insight (Signal) Object</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Field</th>
                    <th className="text-left py-2 pr-4 font-semibold">Type</th>
                    <th className="text-left py-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["id", "string", "Unique identifier (e.g. 'sales-1', 'bench-customer-nps')"],
                    ["category", "InsightCategory", "One of: customer, market, product, sales, marketing, engineering, delivery"],
                    ["header", "string", "Primary card title (e.g. 'Win/Loss Rate', 'NPS Benchmark')"],
                    ["metric", "string", "Metric name for filtering (e.g. 'Sales Win Rate', 'CSAT')"],
                    ["value", "string", "Current metric value displayed (e.g. '24%', '$2.4M', '47 days')"],
                    ["change", "string", "Change indicator (e.g. '+8%', '-15%', 'N/A' for benchmarks)"],
                    ["trend", "'up' | 'down'", "Direction of change. 'up' = green, 'down' = red"],
                    ["timeframe", "string", "Comparison period (e.g. 'vs last month', 'vs last quarter')"],
                    ["description", "string", "One-line summary shown on compact card"],
                    ["summary", "string", "Extended summary shown in expanded view"],
                    ["benchmark", "string (optional)", "Industry benchmark reference (e.g. 'Industry average: 28%')"],
                    ["analysis", "string", "Detailed analysis text for expanded view"],
                    ["implications", "string", "Business implications text for expanded view"],
                    ["nextSteps", "string", "Recommended actions, newline-separated for expanded view"],
                    ["source", "string", "Data source label (e.g. 'CRM Data', 'Industry Report')"],
                    ["dataSources", "DataSource[] (optional)", "Array of linked data sources with name, url, description"],
                    ["isRAG", "boolean", "Whether this is a personalised insight from connected user data"],
                    ["team", "UserGroup", "Assigned team (e.g. 'sales', 'product', 'engineering')"],
                    ["isBenchmark", "boolean (optional)", "If true, card renders in benchmark style (no trend arrow, primary color value, 'Benchmark' badge)"],
                    ["benchmarkContext", "object (optional)", "Contains productCategory[], productStage[], businessStage[] arrays for context matching"],
                  ].map(([field, type, desc]) => (
                    <tr key={field}>
                      <td className="py-2 pr-4 font-mono text-xs text-primary">{field}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">{type}</td>
                      <td className="py-2 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Category Metrics Map</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Each category contains specific sub-metrics that can be individually toggled in the Signals filter dropdown.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { cat: "customer", metrics: "CSAT, NPS, Churn Rate, Customer Retention, Support Tickets, Customer Lifetime Value, Health Score, Usage Frequency" },
                { cat: "market", metrics: "Win/Loss Rate, Market Share, Deal Velocity, Pipeline Coverage, Average Deal Size, Market Growth Rate, Competitive Position" },
                { cat: "product", metrics: "Feature Adoption, User Engagement, Activation Rate, Onboarding Completion, Time to Value, Product Usage, Task Completion" },
                { cat: "sales", metrics: "Sales Cycle Length, Lead Conversion Rate, Quota Attainment, Average Contract Value, Pipeline Health, Win Rate" },
                { cat: "marketing", metrics: "Lead Generation Rate, Marketing Qualified Leads, Campaign ROI, Brand Awareness, CAC, ROAS, Traffic" },
                { cat: "engineering", metrics: "Deploy Frequency, Change Failure Rate, Mean Time to Recovery, Code Quality Score, System Reliability, Incident Rate, Velocity" },
                { cat: "delivery", metrics: "On-Time Delivery Rate, Customer Satisfaction, Sprint Velocity, Cycle Time, WIP, Burndown" },
              ].map(({ cat, metrics }) => (
                <div key={cat} className="p-3 border border-border rounded-lg">
                  <p className="font-semibold capitalize mb-1">{cat}</p>
                  <p className="text-xs text-muted-foreground">{metrics}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 3. Signal Card (Compact View) */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">3. Signal Card (Compact View)</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The primary card component used in the default card feed. Each card represents one insight/signal and is tappable to expand.
          </p>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Visual Structure</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium mb-2">Header Row (top)</p>
                <p className="text-muted-foreground">Left side: Category badge (uppercase, secondary variant) + optional "Personalized" label with sparkle icon (if isRAG=true) + optional "Demo" badge + optional "Benchmark" badge (if isBenchmark=true). Right side: Trend icon (TrendingUp in green or TrendingDown in red). No trend icon shown for benchmark cards.</p>
              </div>
              <div>
                <p className="font-medium mb-2">Main Content (middle)</p>
                <p className="text-muted-foreground">Title: Bold text, text-lg size. Value Row: Large bold text (text-xl) showing the change value. Color logic: benchmark = primary color, positive change (starts with "+") = green-600, negative change (starts with "-") = red-600, otherwise foreground. For benchmark cards, show insight.value instead of insight.change. Timeframe label in muted text beside value. Description: Muted text, text-sm, leading-relaxed.</p>
              </div>
              <div>
                <p className="font-medium mb-2">Action Row (bottom)</p>
                <p className="text-muted-foreground">Left side: Ghost icon buttons (8x8, p-0) for Share, Save/Bookmark (filled if saved, primary color), Delete (red, only for demo signals), Expand/More. Right side: Source text label in muted xs text. All action buttons call e.stopPropagation() to prevent triggering the card-level onExpand click.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Props Interface</h3>
            <div className="bg-background rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto">
              <pre>{`interface InsightCardProps {
  insight: Insight        // The signal data object
  isSaved: boolean        // Whether user has bookmarked this card
  onSave: () => void      // Toggle bookmark
  onShare: () => void     // Open share modal
  onExpand: () => void    // Open expanded detail view
  onDelete?: () => void   // Optional: delete (demo signals only)
  fullScreen?: boolean    // If true, card expands to min-h-[70vh]
}`}</pre>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">CSS Classes</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <span className="font-mono text-xs text-primary shrink-0">Card wrapper</span>
                <span className="text-muted-foreground">w-full hover:shadow-md transition-shadow cursor-pointer</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-xs text-primary shrink-0">CardContent</span>
                <span className="text-muted-foreground">p-4 (standard) or p-8 flex flex-col justify-center (fullScreen)</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-xs text-primary shrink-0">Header row</span>
                <span className="text-muted-foreground">flex items-center justify-between mb-6</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-xs text-primary shrink-0">Action row</span>
                <span className="text-muted-foreground">flex items-center justify-between mt-auto</span>
              </div>
            </div>
          </Card>
        </section>

        {/* 4. Ticker Card */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">4. Ticker Card (Alternate View)</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            A compact single-row card used when the view mode is toggled to "Ticker". Shows minimal information for quick scanning.
          </p>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Visual Structure</h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Single row layout with: Left side - optional sparkle icon (if isRAG), header text (bold, truncated). Right side - trend icon (TrendingUp green / TrendingDown red / Minus grey) + value text (colored by trend).
              </p>
              <div className="font-mono text-xs bg-background rounded-lg p-4">
                <pre>{`Container: w-full bg-card border border-border rounded-lg p-3
           cursor-pointer hover:shadow-md transition-shadow
Layout:    flex items-center justify-between gap-2
Left:      flex items-center gap-2 flex-1 min-w-0
Right:     flex items-center gap-1 shrink-0`}</pre>
              </div>
              <div>
                <p className="font-medium mb-1">Props</p>
                <p className="text-muted-foreground font-mono text-xs">{"{ insight: Insight, onClick: () => void }"}</p>
              </div>
            </div>
          </Card>
        </section>

        {/* 5. Expanded Signal Card */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">5. Expanded Signal Card (Detail Modal)</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Full-screen modal overlay that opens when a user taps a signal card. Shows all detail fields with structured sections.
          </p>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Modal Container</h3>
            <div className="font-mono text-xs bg-background rounded-lg p-4 mb-4">
              <pre>{`Overlay:   fixed inset-0 bg-black/50 flex items-center
           justify-center p-4 z-50
Card:      w-full max-w-md h-[90vh] flex flex-col`}</pre>
            </div>
            <p className="text-sm text-muted-foreground">The card uses flex-col with a fixed header, scrollable content area, and fixed action footer.</p>
          </Card>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Content Sections (in order)</h3>
            <div className="space-y-3 text-sm">
              {[
                { icon: "BarChart3", label: "Key Metric", desc: "Large change value (text-3xl, colored by trend) + timeframe text. Centered layout." },
                { icon: "BarChart3", label: "Summary", desc: "insight.summary - Extended description of the signal." },
                { icon: "Target", label: "Benchmark", desc: "insight.benchmark - Industry comparison reference." },
                { icon: "Lightbulb", label: "Analysis", desc: "insight.analysis - Detailed breakdown of what's happening and why." },
                { icon: "TrendingUp", label: "Implications", desc: "insight.implications - Business impact and consequences." },
                { icon: "ArrowRight", label: "Next Steps", desc: "insight.nextSteps - Actionable recommendations. Newline-separated items." },
                { icon: "LinkIcon", label: "Data Sources", desc: "insight.dataSources[] - Linked sources with optional URLs. Falls back to insight.source string if no dataSources array." },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0 text-xs">{icon}</Badge>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Footer Actions</h3>
            <p className="text-sm text-muted-foreground">
              Two buttons side-by-side in a fixed footer (flex gap-2 p-4): "Share" (outline variant with Share2 icon) and "Save"/"Saved" (outline when unsaved, default when saved, with filled Bookmark icon). Each button is flex-1.
            </p>
          </Card>
        </section>

        {/* 6. Share Modal */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">6. Share Modal</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Modal for sharing a signal via email, social media, or link copy. Opens as a centered overlay.
          </p>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Sections (in order)</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">1. Add a Note (Optional)</p>
                <p className="text-muted-foreground">Textarea, 3 rows, resize-none. Custom note appended to share text.</p>
              </div>
              <div>
                <p className="font-medium">2. Send via Email</p>
                <p className="text-muted-foreground">Email input + send button (Mail icon). Opens mailto: link with pre-filled subject ("Insight: [header]"), body (share text + note + URL), and recipient.</p>
              </div>
              <div>
                <p className="font-medium">3. Share on Social Media</p>
                <p className="text-muted-foreground">Two outline buttons side-by-side: LinkedIn (share-offsite URL) and Twitter/X (intent/tweet URL). Each opens new window.</p>
              </div>
              <div>
                <p className="font-medium">4. Copy Link</p>
                <p className="text-muted-foreground">Full-width outline button. Uses navigator.clipboard.writeText(). Text toggles to "Copied!" for 2 seconds on success.</p>
              </div>
            </div>
          </Card>
        </section>

        {/* 7. Filter Bar */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">7. Filter Bar</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Sticky bar below header containing all filtering controls. Horizontally scrollable on mobile with min-w-max on the inner flex container.
          </p>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Container CSS</h3>
            <div className="font-mono text-xs bg-background rounded-lg p-4">
              <pre>{`Wrapper:  sticky top-16 bg-background/95 backdrop-blur-sm
          border-b border-border z-10
Scroll:   overflow-x-auto scrollbar-hide
Inner:    flex items-center gap-2 p-4 pb-2 pt-4 min-w-max`}</pre>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Signals Dropdown</h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Trigger button shows "Signals ([count])" with ChevronDown icon. Opens a DropdownMenu (w-64, align start).
              </p>
              <div>
                <p className="font-medium mb-1">Dropdown Sections:</p>
                <ol className="list-decimal ml-4 space-y-2 text-muted-foreground">
                  <li><strong>Select All / Deselect All:</strong> Two ghost buttons side-by-side.</li>
                  <li><strong>Show Benchmarks Only:</strong> Checkbox item. When enabled, filters to only show isBenchmark=true cards.</li>
                  <li><strong>Recommended:</strong> Checkbox item. When enabled, filters to show only cards whose metric matches the user's selected lagging/leading metrics from localStorage ("camino-selected-metrics").</li>
                  <li><strong>Category Checkboxes:</strong> 7 categories, each with a expand/collapse chevron. When expanded, shows individual metric checkboxes (text-xs) indented ml-6.</li>
                  <li><strong>OK / Cancel:</strong> Two buttons at bottom. OK applies temp selections to active filters. Cancel reverts temp to current active.</li>
                </ol>
              </div>
              <div>
                <p className="font-medium mb-1">State Management Pattern:</p>
                <p className="text-muted-foreground">Uses paired state: selectedCategories (active) + tempSelectedCategories (editing). Same for selectedMetrics/tempSelectedMetrics. On dropdown open, temp syncs from active. OK copies temp to active. Cancel reverts temp.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Assigned Dropdown</h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Trigger shows "Assigned ([count] or 'All')". Opens DropdownMenu (w-56, align end).
              </p>
              <div>
                <p className="font-medium mb-1">Teams available:</p>
                <p className="text-muted-foreground">product, design, engineering, finance, marketing, sales, customer-success, delivery</p>
              </div>
              <p className="text-muted-foreground">
                Includes Select All / Deselect All buttons at top, individual team checkboxes, and OK/Cancel at bottom. Same temp/active state pattern as Signals dropdown.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">View Mode Toggle</h3>
            <p className="text-sm text-muted-foreground">
              Single outline button that toggles between "Card" (LayoutGrid icon) and "Ticker" (BarChart3 icon) view modes. Switches the feed rendering between InsightCard components and TickerCard components.
            </p>
          </Card>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Filter Logic (Pseudocode)</h3>
            <div className="font-mono text-xs bg-background rounded-lg p-4 overflow-x-auto">
              <pre>{`filteredInsights = insights.filter(insight => {
  // 1. Category must be in selected set
  categoryMatch = selectedCategories.has(insight.category)

  // 2. If specific metrics selected, insight.metric must match
  metricMatch = selectedMetrics.size === 0 
    || selectedMetrics.has(insight.metric)

  // 3. If specific teams selected, insight.team must match
  teamMatch = selectedTeams.size === 0 
    || selectedTeams.has(insight.team)

  // 4. Benchmark filter: if enabled, ONLY show benchmarks
  if (showBenchmark && !insight.isBenchmark) return false

  // 5. Recommended filter: match against user's 
  //    lagging + leading metrics from localStorage
  if (showRecommended) {
    userMetrics = [...lagging, ...leading]
    recommendedMatch = userMetrics.some(m =>
      insight.metric.includes(m) || m.includes(insight.metric)
      || insight.header.includes(m) || m.includes(insight.header)
    )
    if (!recommendedMatch) return false
  }

  return categoryMatch && metricMatch && teamMatch
})`}</pre>
            </div>
          </Card>
        </section>

        {/* 8. Add Signal Modal */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">8. Add Signal Modal</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Multi-step modal for adding new signals. Triggered by the floating "+" button (only visible to users with "edit" permission).
          </p>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Steps</h3>
            <div className="space-y-4 text-sm">
              <div className="p-4 border border-border rounded-lg">
                <p className="font-medium mb-2">Step 1: Choose Source</p>
                <p className="text-muted-foreground mb-2">Four card options:</p>
                <ol className="list-decimal ml-4 space-y-1 text-muted-foreground">
                  <li><strong>Browse Signal Library</strong> - Navigates to /signals page</li>
                  <li><strong>Add Dataset</strong> - Shows data source browser with search + category grouping</li>
                  <li><strong>From Benchmark Signals</strong> - Filters to unconnected signals</li>
                  <li><strong>From My Role</strong> - Filters to signals matching user's team groups</li>
                </ol>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <p className="font-medium mb-2">Step 2: Choose Signal (if Benchmark or Role selected)</p>
                <p className="text-muted-foreground">Search bar + team filter badges (All, Product, Sales, Marketing, Design, Engineering, CS, Finance, Delivery) + scrollable signal list. Each signal card shows name, connected/unconnected icon, description, data source badge, and team badge.</p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <p className="font-medium mb-2">Step 3: Choose Connection Method</p>
                <p className="text-muted-foreground">Two options: "I'll connect it myself" (closes modal, would open integration flow) or "Request from team member" (proceeds to request form).</p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <p className="font-medium mb-2">Step 4: Request Form (if team member selected)</p>
                <p className="text-muted-foreground">Name input, email input, optional suggested signals textarea (only for ELT users). Sends notification via notification system and closes modal.</p>
              </div>
            </div>
          </Card>
        </section>

        {/* 9. Screen Layout */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">9. Screen Layout and Composition</h2>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Root Container</h3>
            <div className="font-mono text-xs bg-background rounded-lg p-4">
              <pre>{`<div className="flex flex-col min-h-screen bg-background 
  overflow-x-hidden pt-0"
  style={{ paddingBottom: 
    "max(5rem, calc(5rem + env(safe-area-inset-bottom)))" 
  }}
>`}</pre>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Component Tree</h3>
            <div className="font-mono text-xs bg-background rounded-lg p-4 overflow-x-auto">
              <pre>{`InsightsScreen
├── FixedHeader (onNotifications)
├── StickyFilterBar
│   ├── SignalsDropdown (categories + metrics + benchmark + recommended)
│   ├── AssignedDropdown (teams)
│   └── ViewModeToggle (card | ticker)
├── CardFeed (scrollable)
│   ├── [Card View] InsightCard[] (compact cards)
│   └── [Ticker View] TickerCard[] (compact rows)
├── FloatingActionButton (conditional: edit permission)
├── ExpandedInsightCard (conditional: when card tapped)
├── ShareModal (conditional: when share clicked)
├── NotificationsModal (conditional)
├── AddSignalModal (conditional)
├── AlertsModal (conditional)
└── BottomNavigation`}</pre>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Card Feed Layout</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Card view:</strong> flex flex-col gap-4 p-4 w-full</p>
              <p><strong>Ticker view:</strong> flex flex-col gap-3 p-4 w-full</p>
              <p><strong>Loading state:</strong> Centered spinner (h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin) with "Loading your signals..." text below.</p>
            </div>
          </Card>
        </section>

        {/* 10. Interaction States */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">10. Interaction States</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { action: "Tap card", result: "Opens ExpandedInsightCard modal with full detail view" },
              { action: "Tap Share icon", result: "Opens ShareModal. e.stopPropagation() prevents card expand." },
              { action: "Tap Bookmark icon", result: "Toggles saved state. Persisted to localStorage key 'camino-saved-insights' as JSON array of IDs." },
              { action: "Tap Delete icon", result: "Removes demo signal from local state (not persisted). Only shown for demo signals (id starts with 'demo-')." },
              { action: "Tap More icon", result: "Same as tapping card - opens expanded view." },
              { action: "Tap FAB (+)", result: "Opens AddSignalModal. Only visible if user has 'edit' permission." },
              { action: "Toggle view mode", result: "Switches between InsightCard[] (card) and TickerCard[] (ticker) rendering." },
              { action: "Apply filters", result: "Clicking OK in dropdown applies tempSelected to selected state. Clicking Cancel reverts temp to match selected." },
            ].map(({ action, result }) => (
              <Card key={action} className="p-4">
                <p className="font-medium text-sm mb-1">{action}</p>
                <p className="text-xs text-muted-foreground">{result}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* 11. Design Tokens */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">11. Design Tokens</h2>

          <Card className="p-6 bg-muted/30 mb-6">
            <h3 className="font-semibold mb-4">Color Usage</h3>
            <div className="space-y-2 text-sm">
              {[
                ["Positive trend", "text-green-600 (value), text-green-500 (icon)"],
                ["Negative trend", "text-red-600 (value), text-red-500 (icon)"],
                ["Benchmark value", "text-primary"],
                ["Category badge", "Badge variant='secondary'"],
                ["Benchmark badge", "Badge variant='outline' + bg-primary/10"],
                ["Personalised label", "text-primary with Sparkles icon"],
                ["Demo badge", "Badge variant='outline'"],
                ["Delete button", "text-destructive"],
                ["Saved bookmark", "text-primary + fill-current"],
                ["Card background", "bg-card (via Card component)"],
                ["Page background", "bg-background"],
                ["Muted text", "text-muted-foreground"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="font-medium shrink-0 w-40">{label}</span>
                  <span className="text-muted-foreground font-mono text-xs">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Spacing and Sizing</h3>
            <div className="space-y-2 text-sm">
              {[
                ["Card padding", "p-4 (compact), p-8 (fullScreen)"],
                ["Card gap in feed", "gap-4 (card view), gap-3 (ticker view)"],
                ["Feed padding", "p-4"],
                ["Header gap", "mb-6"],
                ["Icon button size", "h-8 w-8 p-0"],
                ["Icon size (small)", "w-4 h-4"],
                ["Icon size (medium)", "w-5 h-5"],
                ["Trend icon size", "w-5 h-5"],
                ["FAB size", "h-14 w-14 rounded-full"],
                ["FAB position", "fixed bottom-24 right-4"],
                ["Modal max width", "max-w-md (expanded), max-w-sm (share)"],
                ["Modal height", "h-[90vh] (expanded)"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="font-medium shrink-0 w-40">{label}</span>
                  <span className="text-muted-foreground font-mono text-xs">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 12. Accessibility */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">12. Accessibility</h2>
          <Card className="p-6 bg-muted/30">
            <div className="space-y-3 text-sm">
              {[
                ["Keyboard navigation", "All interactive elements (buttons, checkboxes, dropdowns) are focusable and operable via keyboard. Cards are clickable divs with cursor-pointer."],
                ["Screen readers", "Category badges provide context. Trend icons have implicit meaning via color but should include sr-only text. Source labels identify data origin."],
                ["Color contrast", "Green-600/red-600 on white background meets WCAG AA. Primary color tokens are designed for sufficient contrast."],
                ["Touch targets", "All icon buttons are minimum 32x32px (h-8 w-8). FAB is 56x56px. Cards are full-width tap targets."],
                ["Focus management", "Modals trap focus when open. Closing modal returns focus to trigger element. Dropdown menus support arrow key navigation via Radix UI."],
                ["Motion", "hover:shadow-md transition-shadow on cards. Chevron rotate-90 transition on category expand. Spinner animation for loading state. All use CSS transitions, respecting prefers-reduced-motion."],
              ].map(([label, desc]) => (
                <div key={label}>
                  <p className="font-medium mb-1">{label}</p>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Dependencies */}
        <section>
          <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-border">Dependencies</h2>
          <Card className="p-6 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">UI Components (shadcn/ui)</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Button (variants: default, outline, ghost)</li>
                  <li>Card, CardContent, CardHeader</li>
                  <li>Badge (variants: default, secondary, outline)</li>
                  <li>Input</li>
                  <li>Textarea</li>
                  <li>DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Icons (lucide-react)</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>TrendingUp, TrendingDown, Minus</li>
                  <li>Share2, Bookmark, MoreHorizontal, Trash2</li>
                  <li>Sparkles, X, Plus</li>
                  <li>LayoutGrid, BarChart3</li>
                  <li>ChevronDown, ChevronRight, Check</li>
                  <li>Search, Mail, Copy, LinkIcon</li>
                  <li>Target, Lightbulb, ArrowRight</li>
                  <li>Users, BookOpen, Database, BadgeIcon</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Signal Card Screen Specification v1.0
          </p>
        </div>
      </div>
    </div>
  )
}
