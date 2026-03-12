'use server'

import { streamText } from 'ai'
import { DELIVERY_PLAN, getDeliveryStats } from '@/docs/delivery-plan'

// Full codebase manifest - generated from actual file structure
const CODEBASE_MANIFEST = {
  pages: {
    public: ['/', '/auth/login', '/auth/signup', '/auth/check-email', '/auth/admin-login', '/auth/onboarding', '/guidance', '/setup', '/saved'],
    protected: ['/dashboard', '/signals', '/signals/[id]', '/decisions', '/decisions/new', '/decisions/[id]', '/insights', '/integrations', '/integrations/[provider]', '/upload', '/mission', '/mission/team', '/profile'],
    admin: ['/admin', '/admin/dashboard', '/admin/signals', '/admin/uploads', '/admin/users', '/admin/users/[id]', '/admin/organisations', '/admin/organisations/[id]', '/admin/organisations/[id]/upload', '/admin/integrations', '/admin/import', '/admin/data', '/admin/faq', '/admin/settings', '/admin/signal-hub'],
    test: ['/test', '/test/smoke', '/test/e2e', '/test/review', '/test-workflow', '/signals/templates'],
    standalone: ['/intelligence'],
  },
  apiRoutes: {
    auth: ['/api/auth/logout', '/api/user/complete-onboarding', '/api/user/onboarding-status', '/api/user/context', '/api/user/goals'],
    signals: ['/api/signals', '/api/signals/[id]/interpretation', '/api/signals/[id]/preferences', '/api/signals/ai-analyze', '/api/signals/detect-relationships', '/api/signals/from-templates', '/api/signals/predict-impact', '/api/signals/ranked', '/api/signals/save', '/api/signals/share'],
    data: ['/api/upload', '/api/upload/batch', '/api/upload/calculate', '/api/upload/discover', '/api/upload/discover-signals', '/api/upload/stage', '/api/upload/zoho-desk'],
    integrations: ['/api/integrations', '/api/integrations/sync', '/api/integrations/oauth/callback', '/api/integrations/oauth/hubspot', '/api/integrations/oauth/zoho-crm', '/api/integrations/oauth/zoho-desk', '/api/integrations/zoho/callback', '/api/integrations/zoho/connect'],
    admin: ['/api/admin/import/analyze', '/api/admin/import/enable-signals', '/api/admin/import/stage', '/api/admin/signals/availability', '/api/admin/signals/calculate'],
    analytics: ['/api/benchmarks', '/api/data-quality', '/api/data-sources', '/api/decisions', '/api/insights', '/api/kpis', '/api/relationships', '/api/mapping/save-template'],
    test: ['/api/test/interpret', '/api/test/organizations', '/api/test/signals', '/api/test/upload', '/api/test/users', '/api/test/workflow-signals', '/api/test/workflow-upload'],
  },
  services: {
    core: ['signals-service', 'staging-service', 'upload-service', 'decisions-service', 'interpretation-service'],
    ai: ['ai-analysis-service', 'signal-intelligence-service', 'signal-intelligence', 'impact-prediction-service', 'multi-source-intelligence-service'],
    data: ['csv-parser', 'xlsx-parser', 'universal-schema', 'intelligent-mapping-service', 'signal-discovery-service', 'signal-calculation-service', 'progressive-data-service'],
    integrations: ['integrations-service', 'zoho-api-client', 'zoho-oauth-service', 'zoho-signal-discovery', 'zoho-desk-processor'],
    auth: ['supabase/client', 'supabase/server', 'supabase/admin', 'supabase/proxy', 'admin-roles', 'organization-service', 'admin-org-service'],
    other: ['mock-data', 'demo-mode', 'demo-mode-service', 'demo-profiles', 'benchmark-data', 'kpi-templates', 'signal-templates-service', 'user-context-service', 'user-data', 'notifications', 'saved-issues', 'mission-service', 'value-of-information', 'date-range-utils', 'db/neon'],
  },
  components: { count: 113, custom: 53, uiLibrary: 60 },
  databases: {
    supabase: { purpose: 'Auth + primary data', tables: 27 },
    neon: { purpose: 'Staging + analytics', tables: 27 },
  },
}

export async function POST(request: Request) {
  const { reviewType } = await request.json() as { reviewType: 'delivery' | 'tech' | 'both' }

  const stats = getDeliveryStats()

  const deliveryPrompt = `You are a senior Delivery Manager reviewing a B2B SaaS product called "${DELIVERY_PLAN.productName}" - a signal intelligence platform. Your job is to review what has been ACTUALLY BUILT in the codebase against the PLANNED delivery plan with releases, user stories, and acceptance criteria.

Last updated: ${DELIVERY_PLAN.lastUpdated}

## DELIVERY SUMMARY
- ${stats.totalReleases} releases, ${stats.totalStories} user stories
- Stories: ${stats.storiesDone} done, ${stats.storiesInProgress} in progress, ${stats.storiesNotStarted} not started, ${stats.storiesBlocked} blocked
- Acceptance criteria: ${stats.criteriaMet} of ${stats.totalCriteria} met (${Math.round((stats.criteriaMet / stats.totalCriteria) * 100)}%)
- Modules: ${stats.componentsBuilt} built, ${stats.componentsPartial} partial, ${stats.componentsNotStarted} not started

## CODEBASE MANIFEST (What actually exists):
${JSON.stringify(CODEBASE_MANIFEST, null, 2)}

## DELIVERY PLAN (What was planned - includes per-criteria met/unmet status):
${JSON.stringify(DELIVERY_PLAN, null, 2)}

Provide a structured review with these EXACT sections:

## RELEASE STATUS OVERVIEW
For each release in the delivery plan, provide:
- Release name and target date
- Overall status: SHIPPED / ON TRACK / AT RISK / BLOCKED / NOT STARTED
- Percentage complete based on acceptance criteria met/unmet
- Key risks or blockers

## USER STORY REVIEW
For EVERY user story, assess:
- Story ID, title, and current status
- Which acceptance criteria are MET vs UNMET (use the met/unmet flags from the plan as your baseline, but cross-check against the codebase manifest)
- Evidence from codebase (which files/routes prove it works)
- What's missing to complete it
- Priority to finish (High / Medium / Low)

## MODULE HEALTH CHECK
For each module (Data In, Signal Core, Synthesis, User Context, Presentation):
- Which components are genuinely working end-to-end vs just having files that exist
- Gap between "file exists" and "feature works"

## DELIVERY RISKS
- Features that are half-built and could confuse users
- User flows that start but dead-end
- Acceptance criteria that are technically met but poorly implemented

## SPRINT RECOMMENDATIONS
Based on the gap analysis, recommend:
1. What to FINISH FIRST (highest value, closest to done)
2. What to CUT from MVP (too far from done, low value)
3. What to FIX (broken things blocking core flows)
4. What to DEFER (nice to have, not blocking)

Be brutally honest. Reference specific file paths. Do not guess - if you can't tell from the manifest whether something works, say so and flag it for manual testing.`

  const techPrompt = `You are a Head of Technology reviewing a SaaS product codebase for technical quality. Your job is to assess architecture, security, performance, and technical debt.

Here is the full codebase manifest:
${JSON.stringify(CODEBASE_MANIFEST, null, 2)}

Provide a structured review covering:

1. ARCHITECTURE CONSISTENCY: Are patterns consistent across the codebase? Are there multiple ways the same thing is done (e.g. different auth patterns, different DB query styles, different state management)?

2. SECURITY AUDIT: Are there exposed API routes without auth? Sensitive data in client-side code? Missing input validation? SQL injection risks? Rate limiting gaps?

3. DATABASE HEALTH: With 27 tables across two databases (Supabase + Neon), assess the dual-database strategy. Is it clean or causing confusion? Are there potential sync issues?

4. PERFORMANCE RISKS: N+1 queries, missing indexes, large client bundles, unnecessary re-renders, missing caching?

5. TECH DEBT: Duplicate services (e.g. signal-intelligence-service vs signal-intelligence), mock data mixed with production code, demo mode scattered throughout, test files mixed with production.

6. SCALABILITY: Will this architecture hold up with 100 users? 1000? What breaks first?

7. TECH VERDICT: Overall technical health score (1-10). Top 3 technical priorities to address.

Be direct, specific, and reference actual file paths. No fluff.`

  let systemPrompt: string
  if (reviewType === 'delivery') {
    systemPrompt = deliveryPrompt
  } else if (reviewType === 'tech') {
    systemPrompt = techPrompt
  } else {
    systemPrompt = `You will provide TWO reviews in sequence. First the Delivery Manager review, then the Head of Technology review. Separate them clearly with headers.

--- DELIVERY MANAGER REVIEW ---
${deliveryPrompt}

--- HEAD OF TECHNOLOGY REVIEW ---
${techPrompt}`
  }

  const result = streamText({
    model: 'openai/gpt-4o',
    system: systemPrompt,
    prompt: 'Conduct your review now. Be thorough, specific, and direct. Reference actual paths from the manifest. For the delivery review, assess EVERY user story against its acceptance criteria.',
    temperature: 0.3,
  })

  return result.toTextStreamResponse()
}
