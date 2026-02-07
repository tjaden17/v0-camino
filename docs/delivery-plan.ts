/**
 * DELIVERY PLAN - Single source of truth
 * 
 * Based on: "Camino - Task: Scope MVP (Definitive) 7 Feb"
 * 
 * North Star: 1 upload (manager) + 1 view/week (any user)
 * Goal: Build enough to start charging
 * 
 * Tier 1 = "Start Charging" (Sprints 1-2, target: 2 weeks)
 *   The minimum pipeline: Upload CSV -> Stage -> Discover -> Calculate -> AI Synthesis -> Display
 * 
 * Tier 2 = "Keep Delivering Value" (Sprints 3-6, ongoing weekly)
 *   Progressive discovery, cross-correlation, market synthesis, ranking, status tracking, filters
 * 
 * Story statuses: 'not-started' | 'in-progress' | 'done' | 'blocked' | 'cut'
 * Tier: 1 = start charging, 2 = keep delivering
 */

export interface AcceptanceCriteria {
  text: string
  met: boolean
}

export interface UserStory {
  id: string
  title: string
  type: 'feature' | 'bug' | 'enhancement' | 'tech-debt'
  persona: 'Executive' | 'Manager' | 'Master Admin' | 'System' | 'All Users' | 'Prospect'
  status: 'not-started' | 'in-progress' | 'done' | 'blocked' | 'cut'
  acceptance: AcceptanceCriteria[]
  sprint?: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  tier: 1 | 2
  notes?: string
}

export interface Release {
  name: string
  status: 'Not Started' | 'In Progress' | 'Done'
  targetDate?: string
  hypothesisToTest: string
  userStories: UserStory[]
}

export interface Module {
  name: string
  components: string[]
  builtStatus: ('Built' | 'Partial' | 'Not started')[]
}

export interface Sprint {
  number: number
  name: string
  startDate: string
  endDate: string
  goal: string
  tier: 1 | 2
  status: 'planning' | 'active' | 'review' | 'done'
  storyIds: string[]
}

export interface UserProblem {
  id: number
  problem: string
  outcome: string
}

export interface DeliveryPlan {
  productName: string
  lastUpdated: string
  northStar: string
  customerPromise: string
  sprintDurationWeeks: 1
  userProblems: UserProblem[]
  sprints: Sprint[]
  releases: Release[]
  modules: Module[]
}

export const DELIVERY_PLAN: DeliveryPlan = {
  productName: 'Camino',
  lastUpdated: '2026-02-07',
  northStar: '1 upload (manager) + 1 view/week (any user)',
  customerPromise: '4-6 weeks from end of December 2025. Week 6 = Feb 7 2026.',
  sprintDurationWeeks: 1,

  userProblems: [
    { id: 1, problem: 'Too slow: Current company workflow is too slow to surface valuable information required for action', outcome: 'Increased speed to valuable information. Decrease time to produce reports, analyse information, find opps & risks.' },
    { id: 2, problem: 'So what? Lacking "so what" from managers who are providing data & reporting', outcome: 'Better business results from actions.' },
    { id: 3, problem: 'Overwhelm: Execs find it difficult to use current tools, which are analyst-first', outcome: 'Improved ease/intuitiveness in exploring valuable information.' },
    { id: 4, problem: 'Easy integrations: Easy for team members to connect & update data. No IT department required.', outcome: 'Decreased time to produce reports.' },
  ],

  sprints: [
    // --- TIER 1: START CHARGING ---
    {
      number: 1,
      name: 'Sprint 1: End-to-End Pipeline',
      startDate: '2026-02-10',
      endDate: '2026-02-16',
      goal: 'Full pipeline working: Upload CSV -> Stage -> Discover signals -> Calculate -> AI Synthesis -> Display card. Demo to customer Friday.',
      tier: 1,
      status: 'active',
      storyIds: [
        'T1-DI-1', 'T1-DI-2', 'T1-DI-3',
        'T1-SC-1', 'T1-SC-2',
        'T1-SY-1',
        'T1-PR-1', 'T1-PR-2',
      ],
    },
    {
      number: 2,
      name: 'Sprint 2: Polish + Admin + Ship',
      startDate: '2026-02-17',
      endDate: '2026-02-23',
      goal: 'AI interpretation quality, master admin user management, exec browse experience, deploy to production, start billing.',
      tier: 1,
      status: 'planning',
      storyIds: [
        'T1-SY-2',
        'T1-PR-3', 'T1-PR-4',
        'T1-AD-1', 'T1-AD-2', 'T1-AD-3',
        'T1-UP-1', 'T1-UP-2',
      ],
    },

    // --- TIER 2: KEEP DELIVERING VALUE ---
    {
      number: 3,
      name: 'Sprint 3: Weekly Uploads + Status',
      startDate: '2026-02-24',
      endDate: '2026-03-02',
      goal: 'Returning upload recognition, upload status tracking (new/updated/completed/partial), upload history.',
      tier: 2,
      status: 'planning',
      storyIds: ['T2-DI-1', 'T2-DI-2', 'T2-PR-1'],
    },
    {
      number: 4,
      name: 'Sprint 4: Progressive Discovery + Ranking',
      startDate: '2026-03-03',
      endDate: '2026-03-09',
      goal: 'Progressive user context, signal ranking by user relevance, category filters, partial signal identification.',
      tier: 2,
      status: 'planning',
      storyIds: ['T2-UC-1', 'T2-SC-1', 'T2-PR-2', 'T2-DI-3'],
    },
    {
      number: 5,
      name: 'Sprint 5: Cross-Correlation + Depth',
      startDate: '2026-03-10',
      endDate: '2026-03-16',
      goal: 'Cross-signal pattern detection, multi-source signal discovery, signal detail depth (trend viz, benchmark comparison).',
      tier: 2,
      status: 'planning',
      storyIds: ['T2-SC-2', 'T2-SC-3', 'T2-SY-1'],
    },
    {
      number: 6,
      name: 'Sprint 6: Market Synthesis + Polish',
      startDate: '2026-03-17',
      endDate: '2026-03-23',
      goal: 'Public network synthesis (news, competitors), leading indicator detection, AI review admin, QA.',
      tier: 2,
      status: 'planning',
      storyIds: ['T2-SY-2', 'T2-SY-3', 'T2-AD-1'],
    },
  ],

  releases: [
    // ============================
    // RELEASE 1: USER PROFILE, CONTEXT, ORGANISATION
    // ============================
    {
      name: 'Release 1: Profiles & Organisation',
      status: 'In Progress',
      targetDate: '2026-02-16',
      hypothesisToTest: 'Knowing (Role, desired KPIs) + (business stage, product stage, target market) is enough to inform AI calls to produce valuable synthesis for each signal.',
      userStories: [
        {
          id: 'T1-UP-1', title: 'User Sign Up & Sign In',
          type: 'feature', persona: 'All Users', status: 'done', sprint: 2, priority: 'critical', tier: 1,
          acceptance: [
            { text: 'User can sign up with email and password', met: true },
            { text: 'User can sign in with email and password', met: true },
            { text: 'System connects user to organisation', met: true },
            { text: 'System saves user name and email', met: true },
          ],
        },
        {
          id: 'T1-UP-2', title: 'User Context (Lite Discovery)',
          type: 'feature', persona: 'All Users', status: 'in-progress', sprint: 2, priority: 'high', tier: 1,
          notes: 'Tier 1 only needs: role + desired KPIs. Save business/product/market context but don\'t block on it.',
          acceptance: [
            { text: 'System saves user role (Executive or Manager)', met: true },
            { text: 'System saves user desired KPIs', met: false },
            { text: 'System saves business context: business stage, product stage, target market', met: false },
            { text: 'System saves product context: product type', met: false },
            { text: 'System saves market context: competitors', met: false },
            { text: 'Based on context, system suggests relevant signals', met: false },
          ],
        },
      ],
    },

    // ============================
    // RELEASE 2: DATA IN
    // ============================
    {
      name: 'Release 2: Data In',
      status: 'In Progress',
      targetDate: '2026-02-16',
      hypothesisToTest: 'Manager finds it easy to upload a file. Signals found are accurately based on columns from staging layer. User sees unexpected valuable signals from combining multiple columns/sources.',
      userStories: [
        {
          id: 'T1-DI-1', title: 'Manager Uploads CSV/XLSX',
          type: 'feature', persona: 'Manager', status: 'in-progress', sprint: 1, priority: 'critical', tier: 1,
          acceptance: [
            { text: 'User can drag/drop or browse for CSV/XLSX file', met: true },
            { text: 'See upload progress indicator', met: true },
            { text: 'File is parsed and columns extracted', met: true },
            { text: 'System normalises/understands what columns should mean (aliases)', met: true },
          ],
        },
        {
          id: 'T1-DI-2', title: 'System Stages Data',
          type: 'feature', persona: 'System', status: 'in-progress', sprint: 1, priority: 'critical', tier: 1,
          acceptance: [
            { text: 'System saves columns into a staging layer', met: true },
            { text: 'System stores raw data with metadata (source, date, uploader)', met: true },
            { text: 'Staging layer is queryable for signal discovery', met: true },
          ],
        },
        {
          id: 'T1-DI-3', title: 'System Discovers Signals from Upload',
          type: 'feature', persona: 'System', status: 'in-progress', sprint: 1, priority: 'critical', tier: 1,
          acceptance: [
            { text: 'System discovers new signals from columns in staging layer', met: true },
            { text: 'System discovers signals from combining multiple columns', met: false },
            { text: 'System saves new signals to signal database', met: true },
            { text: 'System updates existing signals with new data', met: false },
            { text: 'System categorises signal (user, market, tech, business) based on source tool', met: false },
            { text: 'Within 30 seconds, user sees list of detected signals with trends', met: true },
          ],
        },
        // Tier 2 Data In stories
        {
          id: 'T2-DI-1', title: 'Weekly Returning Upload',
          type: 'feature', persona: 'Manager', status: 'not-started', sprint: 3, priority: 'high', tier: 2,
          acceptance: [
            { text: 'Upload recognizes returning user/format', met: false },
            { text: 'Processing shows "Comparing to previous data..."', met: false },
            { text: 'Results grouped by: Opportunities/Risks, Improved, Steady', met: false },
            { text: 'Can view recent upload history', met: false },
          ],
        },
        {
          id: 'T2-DI-2', title: 'Upload Status Tracking',
          type: 'feature', persona: 'All Users', status: 'not-started', sprint: 3, priority: 'medium', tier: 2,
          acceptance: [
            { text: 'See status of recently uploaded data (new, updated, completed, partial)', met: false },
            { text: 'Status updates in real-time as processing progresses', met: false },
          ],
        },
        {
          id: 'T2-DI-3', title: 'Partial Signal Identification',
          type: 'feature', persona: 'System', status: 'not-started', sprint: 4, priority: 'medium', tier: 2,
          acceptance: [
            { text: 'System identifies partial signals from staging layer', met: false },
            { text: 'System identifies missing data points to inform future data suggestions', met: false },
            { text: 'User sees what data is missing to complete a signal', met: false },
          ],
        },
      ],
    },

    // ============================
    // RELEASE 3: SIGNAL CORE
    // ============================
    {
      name: 'Release 3: Signal Core',
      status: 'In Progress',
      targetDate: '2026-02-16',
      hypothesisToTest: 'Signal value and trends are accurate. Default view shows most relevant signals. Cross-correlation detection is valuable and less costly than AI calls.',
      userStories: [
        {
          id: 'T1-SC-1', title: 'Calculate Signal Values',
          type: 'feature', persona: 'System', status: 'in-progress', sprint: 1, priority: 'critical', tier: 1,
          acceptance: [
            { text: 'System calculates data from staging layer (sum, average)', met: true },
            { text: 'System saves calculated values to org signal database', met: true },
            { text: 'Each signal shows: name, current value, trend direction, change %', met: true },
          ],
        },
        {
          id: 'T1-SC-2', title: 'Detect Trends Over Time',
          type: 'feature', persona: 'System', status: 'in-progress', sprint: 1, priority: 'high', tier: 1,
          acceptance: [
            { text: 'System detects trends over time for signals', met: true },
            { text: 'Trends detected from date range in file', met: false },
            { text: 'System saves trend information to signal database', met: true },
          ],
        },
        // Tier 2 Signal Core stories
        {
          id: 'T2-SC-1', title: 'Rank Signals by User Relevance',
          type: 'feature', persona: 'System', status: 'not-started', sprint: 4, priority: 'medium', tier: 2,
          acceptance: [
            { text: 'System ranks signals based on relevance to org members and their context', met: false },
            { text: 'Priority/default view shows most relevant to least relevant', met: false },
          ],
        },
        {
          id: 'T2-SC-2', title: 'Cross-Correlation Pattern Detection',
          type: 'feature', persona: 'System', status: 'not-started', sprint: 5, priority: 'medium', tier: 2,
          acceptance: [
            { text: 'System finds cross-correlation patterns between signals', met: false },
            { text: 'System saves cross-correlation information to signal database', met: false },
            { text: 'Relationships are valuable for users', met: false },
          ],
        },
        {
          id: 'T2-SC-3', title: 'Multi-Source Signal Discovery',
          type: 'feature', persona: 'System', status: 'not-started', sprint: 5, priority: 'medium', tier: 2,
          acceptance: [
            { text: 'System discovers signals from combining columns across multiple sources', met: false },
            { text: 'New signals from multi-source are surfaced to user', met: false },
          ],
        },
      ],
    },

    // ============================
    // RELEASE 4: SIGNAL SYNTHESIS
    // ============================
    {
      name: 'Release 4: Signal Synthesis',
      status: 'In Progress',
      targetDate: '2026-02-16',
      hypothesisToTest: 'The information the AI reads is enough to create accurate synthesis. The 6-section analysis is valuable and relevant. This is the most cost-effective way to create synthesis.',
      userStories: [
        {
          id: 'T1-SY-1', title: 'AI Generates 5-Section Analysis',
          type: 'feature', persona: 'System', status: 'in-progress', sprint: 1, priority: 'critical', tier: 1,
          notes: 'This is the core "So What?" answer. Must work reliably for Tier 1.',
          acceptance: [
            { text: '1. Executive summary', met: true },
            { text: '2. What informed the executive summary', met: true },
            { text: '3. Benchmark comparison', met: true },
            { text: '4. Why it happened? What are drivers?', met: true },
            { text: '5. Relationships via causal chain analysis', met: true },
            { text: 'System caches interpretations', met: true },
          ],
        },
        {
          id: 'T1-SY-2', title: 'Implication on Company KPIs',
          type: 'feature', persona: 'System', status: 'not-started', sprint: 2, priority: 'high', tier: 1,
          notes: 'Section 6 of synthesis: Pulls from org and user context to show KPI impact.',
          acceptance: [
            { text: '6. Implication on company KPIs (from org and user context)', met: false },
            { text: 'References user\'s upcoming decisions if data is available', met: false },
            { text: 'Chases missing interpretations automatically', met: false },
          ],
        },
        // Tier 2 Synthesis stories
        {
          id: 'T2-SY-1', title: 'Signal Detail Depth (Trends + Benchmarks)',
          type: 'feature', persona: 'System', status: 'not-started', sprint: 5, priority: 'medium', tier: 2,
          acceptance: [
            { text: 'Signal detail shows trend visualisation (4+ weeks data)', met: false },
            { text: 'Benchmark comparison with industry data', met: false },
            { text: 'Detects leading indicators', met: false },
          ],
        },
        {
          id: 'T2-SY-2', title: 'Market Synthesis (Public Networks)',
          type: 'feature', persona: 'System', status: 'not-started', sprint: 6, priority: 'low', tier: 2,
          notes: 'CUT from Tier 1. Separate AI calls for market category cards.',
          acceptance: [
            { text: 'AI generates analysis for market category cards', met: false },
            { text: 'General news & trends in the target market', met: false },
            { text: 'Recent news from competitors', met: false },
          ],
        },
        {
          id: 'T2-SY-3', title: 'Leading Indicator Detection',
          type: 'feature', persona: 'System', status: 'not-started', sprint: 6, priority: 'low', tier: 2,
          acceptance: [
            { text: 'System detects leading indicators from signal patterns', met: false },
            { text: 'Leading indicators are surfaced in signal detail', met: false },
          ],
        },
      ],
    },

    // ============================
    // RELEASE 5: PRESENTATION
    // ============================
    {
      name: 'Release 5: Presentation',
      status: 'In Progress',
      targetDate: '2026-02-16',
      hypothesisToTest: 'Signal card is compelling way for users to browse signals quickly. Expanded view is right way to explore deeper. Filters help explore breadth.',
      userStories: [
        {
          id: 'T1-PR-1', title: 'Signal List Display',
          type: 'feature', persona: 'All Users', status: 'in-progress', sprint: 1, priority: 'critical', tier: 1,
          acceptance: [
            { text: 'Displays signal list in "signals" page, viewable by organisation', met: true },
            { text: 'Each signal shows: name, current value, trend indicator', met: true },
            { text: 'Signals flagged as opportunities or risks are highlighted', met: true },
          ],
        },
        {
          id: 'T1-PR-2', title: 'Expanded Signal Card View',
          type: 'feature', persona: 'All Users', status: 'in-progress', sprint: 1, priority: 'critical', tier: 1,
          acceptance: [
            { text: 'Expands signal cards to show full details from AI synthesis', met: true },
            { text: '"What We Found" section shows breakdown', met: true },
            { text: '"What It Means" section explains significance in plain language', met: true },
            { text: 'Can navigate back to signal list easily', met: true },
          ],
        },
        {
          id: 'T1-PR-3', title: 'Exec Browse Experience',
          type: 'feature', persona: 'Executive', status: 'not-started', sprint: 2, priority: 'high', tier: 1,
          notes: 'Exec can browse all signals + see expanded view. No ranking or filters yet.',
          acceptance: [
            { text: 'Executive can browse through signal list', met: true },
            { text: 'Executive can see expanded view of any signal', met: true },
            { text: 'Experience feels intuitive and not overwhelming', met: false },
          ],
        },
        {
          id: 'T1-PR-4', title: 'Manager Sees Available Signals After Upload',
          type: 'feature', persona: 'Manager', status: 'not-started', sprint: 2, priority: 'high', tier: 1,
          acceptance: [
            { text: 'After upload, manager sees list of available signals', met: true },
            { text: 'Manager can tap to explore any signal', met: true },
            { text: 'Clear connection between "I uploaded this" and "here are the signals"', met: false },
          ],
        },
        // Tier 2 Presentation stories
        {
          id: 'T2-PR-1', title: 'Upload Status View for All Users',
          type: 'feature', persona: 'All Users', status: 'not-started', sprint: 3, priority: 'medium', tier: 2,
          acceptance: [
            { text: 'See status of recently uploaded data (new, updated, completed, partial)', met: false },
            { text: 'Browse through signal list with status indicators', met: false },
          ],
        },
        {
          id: 'T2-PR-2', title: 'Filter Signals by Category',
          type: 'feature', persona: 'All Users', status: 'not-started', sprint: 4, priority: 'medium', tier: 2,
          acceptance: [
            { text: 'Filter signals by category (user, market, business, context)', met: false },
            { text: 'Filter signals by function (product, marketing, sales, tech)', met: false },
          ],
        },
      ],
    },

    // ============================
    // RELEASE 6: MASTER ADMIN
    // ============================
    {
      name: 'Release 6: Master Admin',
      status: 'In Progress',
      targetDate: '2026-02-23',
      hypothesisToTest: 'Master admin can manage users and see what customers see, enabling effective onboarding and QA without engineering involvement.',
      userStories: [
        {
          id: 'T1-AD-1', title: 'Create User Profiles & Passwords',
          type: 'feature', persona: 'Master Admin', status: 'in-progress', sprint: 2, priority: 'high', tier: 1,
          acceptance: [
            { text: 'Create new user with email, name, role, password', met: false },
            { text: 'Assign user to an organisation', met: true },
            { text: 'Update user context (role, KPIs)', met: false },
          ],
        },
        {
          id: 'T1-AD-2', title: 'See User\'s Signal View',
          type: 'feature', persona: 'Master Admin', status: 'not-started', sprint: 2, priority: 'high', tier: 1,
          acceptance: [
            { text: 'Admin can see user\'s view of signal screen', met: false },
            { text: 'Admin can verify signals are displaying correctly for that user', met: false },
          ],
        },
        {
          id: 'T1-AD-3', title: 'See User & Org Context',
          type: 'feature', persona: 'Master Admin', status: 'not-started', sprint: 2, priority: 'medium', tier: 1,
          acceptance: [
            { text: 'Admin can see user\'s and organisation\'s context', met: false },
            { text: 'Admin can verify context is correct', met: false },
          ],
        },
        // Tier 2 Admin stories
        {
          id: 'T2-AD-1', title: 'AI Review & QA Admin',
          type: 'feature', persona: 'Master Admin', status: 'not-started', sprint: 6, priority: 'medium', tier: 2,
          acceptance: [
            { text: 'Admin can review AI-generated interpretations', met: false },
            { text: 'Mark interpretations as Approved, Needs Edit, or Regenerate', met: false },
            { text: 'Edit interpretation text directly', met: false },
            { text: 'See quality metrics', met: false },
          ],
        },
      ],
    },

    // ============================
    // TIER 2 EXTRAS: USER CONTEXT (ONGOING)
    // ============================
    {
      name: 'Release 7: Progressive User Context',
      status: 'Not Started',
      targetDate: '2026-03-09',
      hypothesisToTest: 'Progressive context collection makes signals increasingly relevant over time without overwhelming users upfront.',
      userStories: [
        {
          id: 'T2-UC-1', title: 'Progressive Discovery ("What I\'m Wanting")',
          type: 'feature', persona: 'All Users', status: 'not-started', sprint: 4, priority: 'medium', tier: 2,
          acceptance: [
            { text: 'Save ongoing business context: business model type, business stage', met: false },
            { text: 'Save product context: product stage', met: false },
            { text: 'Save user context: target market', met: false },
            { text: 'Save "what\'s coming up" (upcoming decisions)', met: false },
            { text: 'System refines signal suggestions based on progressive context', met: false },
          ],
        },
      ],
    },
  ],

  modules: [
    {
      name: 'Profiles & Org',
      components: ['User signup/signin', 'Org creation', 'User profile creation', 'User context (lite)', 'User context (progressive)', 'Org context'],
      builtStatus: ['Built', 'Built', 'Built', 'Partial', 'Not started', 'Partial'],
    },
    {
      name: 'Data In',
      components: ['File upload (CSV/XLSX)', 'Column normalisation/aliases', 'Staging layer', 'Signal discovery (single source)', 'Signal discovery (multi-source)', 'Partial signal identification', 'Upload status tracking'],
      builtStatus: ['Built', 'Built', 'Built', 'Built', 'Not started', 'Not started', 'Not started'],
    },
    {
      name: 'Signal Core',
      components: ['Calculate (sum, average)', 'Trend detection', 'Save to signal DB', 'Ranking by relevance', 'Cross-correlation patterns'],
      builtStatus: ['Built', 'Built', 'Built', 'Not started', 'Not started'],
    },
    {
      name: 'Synthesis (AI)',
      components: ['5-section analysis (sections 1-5)', 'Section 6: KPI implication', 'Caching interpretations', 'Market synthesis (public)', 'Leading indicator detection'],
      builtStatus: ['Built', 'Not started', 'Built', 'Not started', 'Not started'],
    },
    {
      name: 'Presentation',
      components: ['Signal list display', 'Expanded signal cards', 'Filter by category/function', 'Upload status view', 'Signal ranking view'],
      builtStatus: ['Built', 'Built', 'Not started', 'Not started', 'Not started'],
    },
    {
      name: 'Master Admin',
      components: ['Create users/passwords', 'Manage organisations', 'See user signal view', 'See user/org context', 'AI review/QA'],
      builtStatus: ['Partial', 'Built', 'Not started', 'Not started', 'Not started'],
    },
  ],
}

// ============ Helper functions ============

export function getDeliveryStats() {
  const allStories = DELIVERY_PLAN.releases.flatMap(r => r.userStories)
  const allCriteria = allStories.flatMap(s => s.acceptance)
  const tier1Stories = allStories.filter(s => s.tier === 1)
  const tier1Criteria = tier1Stories.flatMap(s => s.acceptance)

  return {
    totalReleases: DELIVERY_PLAN.releases.length,
    totalStories: allStories.length,
    storiesDone: allStories.filter(s => s.status === 'done').length,
    storiesInProgress: allStories.filter(s => s.status === 'in-progress').length,
    storiesNotStarted: allStories.filter(s => s.status === 'not-started').length,
    storiesBlocked: allStories.filter(s => s.status === 'blocked').length,
    storiesCut: allStories.filter(s => s.status === 'cut').length,
    totalCriteria: allCriteria.length,
    criteriaMet: allCriteria.filter(c => c.met).length,
    criteriaUnmet: allCriteria.filter(c => !c.met).length,
    totalModules: DELIVERY_PLAN.modules.length,
    moduleComponents: DELIVERY_PLAN.modules.flatMap(m => m.components).length,
    componentsBuilt: DELIVERY_PLAN.modules.flatMap(m => m.builtStatus).filter(s => s === 'Built').length,
    componentsPartial: DELIVERY_PLAN.modules.flatMap(m => m.builtStatus).filter(s => s === 'Partial').length,
    componentsNotStarted: DELIVERY_PLAN.modules.flatMap(m => m.builtStatus).filter(s => s === 'Not started').length,
    // Tier 1 specific
    tier1Stories: tier1Stories.length,
    tier1Done: tier1Stories.filter(s => s.status === 'done').length,
    tier1InProgress: tier1Stories.filter(s => s.status === 'in-progress').length,
    tier1Criteria: tier1Criteria.length,
    tier1CriteriaMet: tier1Criteria.filter(c => c.met).length,
    tier1Percent: tier1Criteria.length > 0 ? Math.round((tier1Criteria.filter(c => c.met).length / tier1Criteria.length) * 100) : 0,
  }
}

export function getReleaseProgress(release: Release) {
  const criteria = release.userStories.flatMap(s => s.acceptance)
  const met = criteria.filter(c => c.met).length
  return {
    total: criteria.length,
    met,
    percent: criteria.length > 0 ? Math.round((met / criteria.length) * 100) : 0,
  }
}

export function getSprintStories(sprint: Sprint): UserStory[] {
  const allStories = DELIVERY_PLAN.releases.flatMap(r => r.userStories)
  return sprint.storyIds.map(id => allStories.find(s => s.id === id)).filter(Boolean) as UserStory[]
}

export function getSprintProgress(sprint: Sprint) {
  const stories = getSprintStories(sprint)
  const criteria = stories.flatMap(s => s.acceptance)
  const met = criteria.filter(c => c.met).length
  const storiesDone = stories.filter(s => s.status === 'done').length
  const storiesInProgress = stories.filter(s => s.status === 'in-progress').length
  return {
    totalStories: stories.length,
    storiesDone,
    storiesInProgress,
    storiesNotStarted: stories.length - storiesDone - storiesInProgress,
    totalCriteria: criteria.length,
    criteriaMet: met,
    percent: criteria.length > 0 ? Math.round((met / criteria.length) * 100) : 0,
  }
}

export function getActiveSprint(): Sprint | undefined {
  return DELIVERY_PLAN.sprints.find(s => s.status === 'active')
}

export function getBacklogStories(): UserStory[] {
  const allStories = DELIVERY_PLAN.releases.flatMap(r => r.userStories)
  const assignedIds = new Set(DELIVERY_PLAN.sprints.flatMap(s => s.storyIds))
  return allStories.filter(s => !assignedIds.has(s.id))
}

export function getStoryRelease(storyId: string): string {
  for (const release of DELIVERY_PLAN.releases) {
    if (release.userStories.some(s => s.id === storyId)) {
      return release.name.split(':')[0].trim()
    }
  }
  return 'Unassigned'
}

export function getTierStats(tier: 1 | 2) {
  const stories = DELIVERY_PLAN.releases.flatMap(r => r.userStories).filter(s => s.tier === tier)
  const criteria = stories.flatMap(s => s.acceptance)
  const met = criteria.filter(c => c.met).length
  return {
    stories: stories.length,
    done: stories.filter(s => s.status === 'done').length,
    inProgress: stories.filter(s => s.status === 'in-progress').length,
    criteria: criteria.length,
    criteriaMet: met,
    percent: criteria.length > 0 ? Math.round((met / criteria.length) * 100) : 0,
  }
}
