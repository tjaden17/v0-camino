# CLAUDE.md — Camino Codebase Guide

This file provides AI assistants with the context needed to work effectively in this repository.

---

## Project Overview

**Camino** is a mobile-first business intelligence dashboard built with Next.js. It helps executives and cross-functional leaders navigate hierarchical business metrics, prioritize issues, and track company health. The app uses a Value of Information (VOI) scoring algorithm to surface the most actionable issues first.

- **Live deployment:** Vercel (synced from v0.app)
- **v0.app source:** https://v0.app/chat/lDVyrJ7laMV
- **Current state:** Client-side application with mock data (no backend or database)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| UI | React 19, shadcn/ui (new-york style) |
| Styling | Tailwind CSS v4, CSS variables for theming |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Package Manager | pnpm |
| Deployment | Vercel |

---

## Directory Structure

```
v0-camino/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (fonts, theme, bottom nav)
│   ├── page.tsx            # Home — redirects to /guidance
│   ├── globals.css         # Global styles, Tailwind imports, CSS vars
│   ├── guidance/           # Main dashboard (issue exploration)
│   ├── mission/            # User mission + bookmarked issues
│   ├── profile/            # User profile + demo mode switching
│   └── saved/              # All saved/bookmarked issues
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui primitives (button, card, badge, etc.)
│   ├── issue-card.tsx      # Primary card for a single issue
│   ├── issue-detail-card.tsx # Expanded detail view for an issue
│   ├── tree-view.tsx       # Hierarchical tree navigator
│   ├── ticker-view.tsx     # Horizontal scrolling ticker list
│   ├── bottom-nav.tsx      # Fixed bottom navigation bar
│   ├── share-dialog.tsx    # Share sheet dialog
│   ├── alerts-bell.tsx     # Notification bell with badge
│   ├── breadcrumb-nav.tsx  # Hierarchical breadcrumb
│   ├── lock-screen.tsx     # Lock screen overlay
│   ├── stacked-view.tsx    # Stacked card view variant
│   └── theme-provider.tsx  # next-themes wrapper
├── hooks/
│   └── use-toast.ts        # Toast notification hook
├── lib/                    # Data, types, and utility logic
│   ├── utils.ts            # cn() className utility
│   ├── issue-tree-data.ts  # Issue hierarchy types + mock data
│   ├── user-data.ts        # UserProfile + DataIntegration types
│   ├── demo-profiles.ts    # 5 switchable demo personas
│   ├── demo-mode.ts        # localStorage demo mode state
│   ├── saved-issues.ts     # In-memory bookmarking system
│   ├── notifications.ts    # Alert types + mock alerts
│   ├── value-of-information.ts # VOI ranking algorithm
│   └── benchmark-data.ts   # Benchmark comparison metrics
├── public/                 # Static assets (icons, placeholders)
├── components.json         # shadcn/ui config
├── next.config.mjs         # Next.js config (TS errors ignored, unoptimized images)
├── postcss.config.mjs      # PostCSS + Tailwind setup
├── tsconfig.json           # TypeScript config (strict, path alias @/*)
└── pnpm-lock.yaml          # Lockfile — do not edit manually
```

---

## Development Commands

```bash
pnpm dev       # Start dev server (localhost:3000)
pnpm build     # Production build
pnpm start     # Serve production build
pnpm lint      # Run ESLint
```

> There is no test framework configured. No Jest, Vitest, or similar tools exist.

---

## Path Aliases

The `@/` alias maps to the project root. Use it everywhere:

```ts
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { IssueCard } from "@/components/issue-card"
```

---

## Key Conventions

### Naming
- **Components:** PascalCase — `IssueCard`, `BottomNav`
- **Files:** kebab-case — `issue-card.tsx`, `use-toast.ts`
- **Functions/variables:** camelCase — `handleNextIssue`, `calculateVOI`
- **Types/Interfaces:** PascalCase — `SubIssue`, `UserProfile`
- **Constants:** camelCase — `DEMO_MODE_KEY`, `minSwipeDistance`

### File Placement
- New pages → `app/<route>/page.tsx`
- Shared components → `components/`
- shadcn/ui primitives → `components/ui/` (generate with shadcn CLI, don't hand-edit)
- Custom hooks → `hooks/`
- Data types, algorithms, utilities → `lib/`

### Client vs. Server Components
- Use `"use client"` at the top of any component that uses hooks, events, or browser APIs
- Pages in `app/` are Server Components by default unless they need interactivity
- Most components in this app are client components due to touch/swipe handling

### Styling
- Use Tailwind utility classes exclusively — no inline styles
- Use `cn()` from `@/lib/utils` to merge conditional class names
- Dark/light mode is handled via CSS variables in `globals.css` and `next-themes`
- Color tokens follow the shadcn/ui convention (`bg-background`, `text-foreground`, etc.)

### State Management
- React built-in hooks only (`useState`, `useRef`, `useMemo`, `useEffect`)
- No global state library (no Redux, Zustand, Jotai)
- **Demo mode** persisted via `localStorage` (keys: `camino_demo_mode`, `camino_demo_profile_id`)
- **Saved issues** stored in an in-memory `Map` (not persisted across page reloads)

---

## Core Data Model

All types live in `lib/issue-tree-data.ts`. The central hierarchy is:

```ts
interface SubIssue {
  id: string
  name: string
  summary: string
  trend: "up" | "down" | "stable"
  trendValue: string        // e.g. "-2.3%"
  timeframe: string         // e.g. "Last 7 days"
  dataSource: string[]      // e.g. ["Stripe", "Mixpanel"]
  owner?: string
  subIssues?: SubIssue[]    // Recursive — enables tree structure
  detail?: IssueDetail
  analysis?: AnalysisData
  synthesis?: SynthesisData
}

interface IssueDetail {
  analysisKeyTakeaway: string
  benchmark: string
  rootCauseHypothesis: string
  implications: string
  risks: string
  dataSource: string
  dataSourceUrl: string
}
```

Helper function: `getParentIssue(id: string)` in `issue-tree-data.ts` traverses the tree to find a node's parent.

---

## VOI Algorithm (`lib/value-of-information.ts`)

Issues are ranked by **Value of Information** score:

```
VOI = ValueUnlocked × ProbabilityOfAction
```

- **ValueUnlocked** — based on trend magnitude, number of sub-issues, timeframe recency, trend direction
- **ProbabilityOfAction** — based on detail availability, urgency (trend direction), ownership clarity

Use `getTopIssuesByVOI(issues, n)` to get the top N ranked issues.

---

## Demo Mode (`lib/demo-mode.ts`)

Five switchable personas are available (see `lib/demo-profiles.ts`):
- VP of Product, Design Lead, Sales Manager, CS Manager, CEO

Each persona has its own metrics, mission statement, and preset saved issues.

```ts
isDemoModeActive()            // boolean
enableDemoMode(profileId)     // sets localStorage + reloads
exitDemoMode()                // clears localStorage + reloads
```

---

## Saved Issues (`lib/saved-issues.ts`)

Bookmarking uses an in-memory `Map` — **not persisted across browser sessions**.

```ts
saveIssue(issue: SubIssue): void
unsaveIssue(id: string): void
isIssueSaved(id: string): boolean
getSavedIssues(): SubIssue[]
tagIssue(id: string, tag: string): void
```

---

## Navigation & Routing

| Route | Page | Purpose |
|---|---|---|
| `/` | page.tsx | Redirect to `/guidance` |
| `/guidance` | guidance/page.tsx | Main dashboard — issue browsing |
| `/mission` | mission/page.tsx | User mission + bookmarks |
| `/profile` | profile/page.tsx | Profile config + demo mode |
| `/saved` | saved/page.tsx | All bookmarked issues |

The `BottomNav` component renders on all pages via `app/layout.tsx` and highlights the active route.

---

## Mobile UX Patterns

The app is designed for mobile-first interaction:

- **Swipe up/down** — Navigate between sibling issues in the flat list
- **Swipe left/right** — Drill into sub-issues or navigate back up the hierarchy
- **Double-tap** — Toggle expanded detail view on an issue card
- Touch events are handled directly with `onTouchStart`/`onTouchEnd` in `app/guidance/page.tsx`
- `minSwipeDistance` threshold prevents accidental swipes

---

## shadcn/ui Usage

Components live in `components/ui/`. To add a new shadcn component:

```bash
npx shadcn@latest add <component-name>
```

Do **not** manually edit files in `components/ui/` — regenerate them via the CLI if updates are needed. Configuration is in `components.json` (style: `new-york`, base color: `neutral`).

---

## Adding New Features — Checklist

1. **New page:** Create `app/<route>/page.tsx`, add `"use client"` if interactive
2. **New component:** Add to `components/<name>.tsx` in kebab-case
3. **New data type:** Define interface in the relevant `lib/` file
4. **New mock data:** Add to `lib/issue-tree-data.ts` or create a new `lib/*.ts` file
5. **New UI primitive:** Use `npx shadcn@latest add` rather than building from scratch
6. **Styling:** Tailwind classes only; use `cn()` for conditional classes
7. **No tests exist** — manual verification via `pnpm dev`

---

## What Does NOT Exist (Yet)

- No API routes (`/app/api/`)
- No database (no Prisma, Drizzle, or any ORM)
- No authentication
- No environment variables (`.env`)
- No test suite
- No CI/CD (Vercel auto-deploys from v0.app sync)
- No Docker configuration

When adding any of these, document the pattern here.

---

## Important Config Notes

- **`next.config.mjs`** has `typescript.ignoreBuildErrors: true` — build will succeed even with TS errors. Fix errors properly; don't rely on this.
- **`next.config.mjs`** has `images.unoptimized: true` — required for the Vercel deployment target from v0.app.
- **`tsconfig.json`** has strict mode enabled — use proper types, avoid `any`.

---

## Git Workflow

- Default branch: `master`
- Single initial commit from v0.app sync
- No branch protection or PR conventions established yet
- Commits should have clear, descriptive messages in imperative mood: `Add tree view navigation`, `Fix swipe threshold on mobile`
