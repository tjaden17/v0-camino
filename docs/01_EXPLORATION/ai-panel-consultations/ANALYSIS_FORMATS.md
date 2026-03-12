# AI Panel Consultation: Signal Analysis Formats for Daily Executive Glances

**Date:** February 22, 2026  
**Question:** "What are the most valuable formats to surface signal data for executives glancing at Camino daily? Beyond stock ticker-style cards, what analysis formats create the most insight with the least cognitive load?"

---

## Panel Members

- **Product Manager** - User experience and value delivery
- **Jordan** - UX patterns and information hierarchy
- **Sam** - Business strategy and executive decision-making
- **Alex** - Data visualization and cognitive science
- **Morgan** - Behavioral psychology and habit formation

---

## Current State: Stock Ticker Signal Cards

**What you have:**
- Signal name
- Current value (metric)
- Trend arrow (↑↓→)
- Maybe: comparison to previous period

**Hypothesis:** This mirrors how executives check stock portfolios - quick scan of performance.

---

## The Panel's Analysis

### Product Manager: "The answer depends on WHEN they're looking"

There are actually **3 different glance contexts**, each needing a different format:

**1. Morning Check (5 seconds) - "What needs my attention TODAY?"**
- Format: **Exception-based alerts**
- Show: Only signals that crossed a threshold or changed significantly
- Visual: Traffic light system (🔴 Red = urgent, 🟡 Yellow = watch, 🟢 Green = good)
- Example: "2 signals need attention" vs "All 8 signals stable"

**2. Weekly Review (2 minutes) - "How is the business trending?"**
- Format: **Momentum dashboard**
- Show: All signals with velocity (not just direction)
- Visual: Speedometer-style indicators showing rate of change
- Example: "Win rate improving FAST (↑ 15% in 7 days)" vs "Win rate improving slowly (↑ 2% in 30 days)"

**3. Deep Dive (10 minutes) - "WHY is this happening?"**
- Format: **Narrative insights**
- Show: Causal relationships between signals
- Visual: Connected story cards
- Example: "Pipeline value ↓ 20% BECAUSE ticket volume ↑ 40% AND response time ↑ 2 days"

**Your current ticker format works for #2 but misses #1 and #3.**

---

### Jordan (UX): "Information hierarchy beats information density"

**The problem with ticker cards:** They're democratic - every signal gets equal visual weight. But busy executives don't want equality, they want **prioritization**.

**Alternative formats ranked by cognitive efficiency:**

**Format A: Single Big Number (Most efficient)**
\`\`\`
┌─────────────────────────────┐
│  YOUR BUSINESS HEALTH: 78%  │
│  ↑ 5 points vs last week    │
│                             │
│  [Tap to see what changed]  │
└─────────────────────────────┘
\`\`\`
- One composite score from all signals
- Pro: Zero cognitive load, instant understanding
- Con: Loses nuance, need to drill down for details
- **Best for:** Morning check (5 sec glance)

**Format B: Priority Stack (Current approach + ranking)**
\`\`\`
┌─────────────────────────────┐
│ 🔴 NEEDS ATTENTION          │
│  • Ticket backlog: 47 (↑22) │
│                             │
│ 🟡 MONITOR CLOSELY          │
│  • Win rate: 31% (↓ 4%)    │
│  • Response time: 2.1 days  │
│                             │
│ 🟢 PERFORMING WELL          │
│  • 5 other signals stable   │
└─────────────────────────────┘
\`\`\`
- Grouped by urgency, not alphabetically
- Pro: Directs attention to what matters
- Con: Requires rules for "urgent" vs "stable"
- **Best for:** Daily check (30 sec scan)

**Format C: Contextual Comparison (Relative performance)**
\`\`\`
┌─────────────────────────────┐
│ Win Rate: 31%               │
│ ▓▓▓▓▓▓▓░░░ Below your goal  │
│ You: 31% | Goal: 35%        │
│ Industry: 28% (you're ahead)│
└─────────────────────────────┘
\`\`\`
- Shows performance relative to goals/benchmarks
- Pro: Adds meaning to numbers
- Con: Requires goal-setting and benchmark data
- **Best for:** Weekly review (2 min review)

**Format D: Timeline View (Change over time)**
\`\`\`
┌─────────────────────────────┐
│ Win Rate (Last 30 days)     │
│     ╱‾‾‾╲                   │
│   ╱       ╲_                │
│ ╱            ‾╲_            │
│ 28% → 33% → 31%             │
│ Peaked 2 weeks ago          │
└─────────────────────────────┘
\`\`\`
- Mini sparklines showing trajectory
- Pro: Shows volatility vs steady trends
- Con: Takes more space per signal
- **Best for:** Understanding patterns, not quick scans

**Recommendation:** Layer these formats - default to B (priority stack), drill into C or D when needed.

---

### Sam (Business Strategy): "Executives don't want data, they want decisions"

**The insight:** Your competitors show metrics. You should show **recommended actions**.

**Format E: Action-Oriented Cards (Decision support)**
\`\`\`
┌─────────────────────────────┐
│ 🔴 Ticket Backlog: 47       │
│                             │
│ RECOMMENDED ACTION:         │
│ Reassign 10 tickets from    │
│ Sarah to Tom (he has 40%    │
│ less load and faster close) │
│                             │
│ Expected impact: Clear 10   │
│ tickets in 3 days           │
│                             │
│ [Take Action] [Ignore]      │
└─────────────────────────────┘
\`\`\`
- Transforms signal into specific next step
- Pro: Executives can act immediately without thinking
- Con: Requires AI/rules to generate good recommendations
- **Best for:** Turning insight into action

**Format F: Risk Alerts (Predict problems before they happen)**
\`\`\`
┌─────────────────────────────┐
│ ⚠️ EARLY WARNING            │
│                             │
│ If ticket volume continues  │
│ at current rate, you'll hit │
│ 60 open tickets by March 1  │
│                             │
│ Historical impact:          │
│ At 60+ tickets, win rate    │
│ drops 12% on average        │
│                             │
│ [Plan Response]             │
└─────────────────────────────┘
\`\`\`
- Shows future problems based on current trends
- Pro: Proactive vs reactive management
- Con: Requires historical correlation data
- **Best for:** Preventing crises

**Sam's thesis:** The stock ticker format shows "what IS." Executives need "what to DO" and "what's COMING."

---

### Alex (Data Visualization): "Different signals need different formats"

**The mistake:** Using one format (value + trend) for all signal types.

**Signal taxonomy and ideal formats:**

**1. Volume Metrics (Tickets, Deals, Leads)**
- Current format: ❌ "47 tickets (↑ 22)"
- Better format: ✅ "47 tickets (↑ 47% vs normal - investigate)"
- Rationale: Absolute numbers need context. 22 more tickets could be normal seasonality or a crisis.

**2. Ratio Metrics (Win rate, Response time, Conversion %)**
- Current format: ❌ "31% win rate (↓ 4%)"
- Better format: ✅ "31% win rate (↓ from 35% - 4 lost deals = $80K missed revenue)"
- Rationale: Percentages are abstract. Show business impact.

**3. Time-Based Metrics (Response time, Resolution time)**
- Current format: ❌ "2.1 days avg response (↑ 0.3 days)"
- Better format: ✅ "2.1 days (⚠️ 8 tickets over 3 days - risk of churn)"
- Rationale: Averages hide outliers. Show the distribution.

**4. Sentiment/Quality Metrics (CSAT, NPS, Sentiment)**
- Current format: ❌ "78% satisfaction (→ unchanged)"
- Better format: ✅ "78% satisfaction (stable BUT 3 detractors this week - at risk accounts: Acme Corp, Globex)"
- Rationale: Aggregate scores mask individual problems.

**Format G: Signal-Appropriate Visualization**
\`\`\`
Volume:    ▓▓▓▓▓▓▓▓░░ 47 of 60 capacity
Ratio:     31% ←─●───→ 35% (4% from goal)
Time:      ●●●●●●●●○○ 8 tickets over SLA
Quality:   ⭐⭐⭐⭐☆ 4.2 (3 🔴 detractors)
\`\`\`

**Alex's recommendation:** Adaptive formats based on metric type, not one-size-fits-all.

---

### Morgan (Behavioral Psychology): "What gets glanced at gets managed"

**The habit formation question:** How do you make checking Camino a daily habit?

**Insight from research:**
- Execs check email 50x/day: Novelty and variable rewards
- Execs check stock portfolios 2-3x/day: Fear of missing changes
- Execs check dashboards 1x/week: No urgency, no habit

**Format H: Notification-First Design (Push vs Pull)**
\`\`\`
INSTEAD OF: User opens Camino → scans 8 signals → finds nothing urgent → leaves

DO THIS: Camino pushes notification → "Win rate dropped 5% - review now?" → User opens → sees context
\`\`\`

**The psychological pattern:**
1. **Variable reward:** Sometimes there's urgent news, sometimes not (like checking lottery tickets)
2. **Loss aversion:** Frame as "don't miss this problem" not "here's good news"
3. **Completion mechanics:** "3 signals need review" creates open loop (Zeigarnik effect)

**Format I: Gamification (Competitive instinct)**
\`\`\`
┌─────────────────────────────┐
│ YOUR PERFORMANCE SCORE      │
│                             │
│ This Week:  78/100 ⭐⭐⭐⭐   │
│ Last Week:  72/100 ⭐⭐⭐    │
│ Best Ever:  85/100 ⭐⭐⭐⭐⭐ │
│                             │
│ Beat your record by:        │
│ • Closing 2 more deals      │
│ • Reducing backlog by 5     │
└─────────────────────────────┘
\`\`\`

**Morgan's warning:** Don't overuse - gamification works for 3-6 months, then users tune out. Use sparingly.

---

## Synthesis: The Panel's Recommendations

### Recommendation 1: **Layered Information Architecture**

Don't choose ONE format. Build **three layers** for different glance durations:

**Layer 1: Hero Metric (5 second glance)**
\`\`\`
Business Health: 78% ↑ 5pts
2 signals need attention
\`\`\`

**Layer 2: Priority Groups (30 second scan)**
\`\`\`
🔴 URGENT (1)
🟡 MONITOR (2)  
🟢 STABLE (5)
\`\`\`

**Layer 3: Detailed Cards (2 minute review)**
\`\`\`
[Your current ticker-style cards with context and actions]
\`\`\`

**Navigation:** Expand/collapse. Default to Layer 1+2, tap to see Layer 3.

---

### Recommendation 2: **Context-Rich Signals**

Transform from:
\`\`\`
❌ Ticket Backlog: 47 (↑ 22)
\`\`\`

To:
\`\`\`
✅ Ticket Backlog: 47 (↑ 47%)
   ⚠️ Above normal by 18 tickets
   8 tickets over 3-day SLA
   Risk: Churn at Acme Corp, Globex
   
   Recommended: Reassign to Tom
   [Take Action] [Snooze 3 days]
\`\`\`

**Elements added:**
1. **Percent change** (not absolute) for context
2. **Deviation from normal** to show severity
3. **Distribution insight** (not just average)
4. **Business impact** (which customers at risk?)
5. **Recommended action** (what to do)
6. **Snooze option** (acknowledge without acting)

---

### Recommendation 3: **Smart Defaults Based on Role**

**For Executives (CEO, COO):**
- Default: Exception alerts only (Layer 1)
- Focus: Cross-functional signals (how CRM impacts Support)
- Format: Action recommendations

**For Department Heads (Sales Manager, CS Manager):**
- Default: Priority groups (Layer 2)
- Focus: Department-specific signals
- Format: Trend comparisons to goals

**For Individual Contributors:**
- Default: Full detail (Layer 3)
- Focus: Signals they can directly impact
- Format: Task lists derived from signals

---

### Recommendation 4: **Time-Based Variation**

**Monday morning:** Show "What happened last week" summary + "What to focus on this week"

**Wednesday check:** Show real-time status updates with trends

**Friday afternoon:** Show "Week in review" + early warnings for next week

**Rationale:** Different questions at different times. Don't show the same view every day.

---

## Prototype Concepts

### Concept A: "Control Tower" (Inspired by air traffic control)
\`\`\`
┌──────────────────────────────────────┐
│  ALL SYSTEMS NORMAL                  │
│  ────────────────────────────        │
│  Monitoring: 8 signals               │
│  Next check: 2 hours                 │
│                                      │
│  [View Exceptions] [Full Dashboard]  │
└──────────────────────────────────────┘

vs when there's an issue:

┌──────────────────────────────────────┐
│  ⚠️ 2 EXCEPTIONS DETECTED            │
│  ──────●─────────────────            │
│  1 urgent, 1 monitor                 │
│                                      │
│  🔴 Ticket backlog: 47 (↑ 47%)      │
│  🟡 Win rate: 31% (↓ 4pts)          │
│                                      │
│  [Review Now]                        │
└──────────────────────────────────────┘
\`\`\`
- **Philosophy:** No news is good news. Only interrupt when needed.
- **Pro:** Minimal cognitive load on normal days
- **Con:** User might ignore app if "all systems normal" too often

---

### Concept B: "Smart Brief" (Inspired by morning news briefs)
\`\`\`
┌──────────────────────────────────────┐
│  GOOD MORNING, ALEX                  │
│  Here's what you need to know:       │
│                                      │
│  ✅ Pipeline value up 12% this week  │
│     (On track to hit Q1 goal)        │
│                                      │
│  ⚠️ BUT ticket backlog growing       │
│     47 tickets (up from 25 Mon)      │
│     Sarah needs help                 │
│                                      │
│  💡 Suggestion: Review tickets with  │
│     Sarah in your 1:1 today          │
│                                      │
│  [View All Signals] [Take Action]    │
└──────────────────────────────────────┘
\`\`\`
- **Philosophy:** AI-written narrative with context and suggestions
- **Pro:** Reads like a human wrote it, highly personalized
- **Con:** Requires sophisticated AI interpretation

---

### Concept C: "Mission Control" (Inspired by NASA mission dashboards)
\`\`\`
┌──────────────────────────────────────┐
│  MISSION: Hit 35% win rate by Mar 14│
│  STATUS: ⚠️ CAUTION                  │
│  ──────────────●─────────────        │
│  You: 31%           Goal: 35%        │
│  Days remaining: 20 days             │
│                                      │
│  SUPPORTING SYSTEMS:                 │
│  🟢 Pipeline: On track               │
│  🔴 Ticket backlog: Overload         │
│  🟡 Response time: Degraded          │
│                                      │
│  [Adjust Mission] [Review Plan]      │
└──────────────────────────────────────┘
\`\`\`
- **Philosophy:** All signals roll up to a mission/goal
- **Pro:** Gives context for why any signal matters
- **Con:** Requires users to define clear goals first

---

## Implementation Roadmap

### Phase 1: Enhance Current Ticker (Week 1-2)
Add to existing cards:
- Percent change (not just absolute)
- Threshold indicators (normal/warning/critical)
- "Compared to goal" context
- "Last changed: 2 days ago" timestamp

### Phase 2: Add Priority Grouping (Week 3-4)
- Implement traffic light grouping (🔴🟡🟢)
- Define rules for each group per signal type
- Collapse/expand groups by default
- Show count: "2 urgent, 3 monitoring, 5 stable"

### Phase 3: Hero Metric (Week 5-6)
- Calculate composite "Business Health" score
- Simple weighted average of all signals
- Big number at top: "78% ↑ 5pts"
- Tap to see breakdown

### Phase 4: Smart Notifications (Week 7-8)
- Push notification when signal crosses threshold
- Daily digest: "2 signals changed significantly"
- Option to snooze signal for X days

### Phase 5: AI Insights (Month 3+)
- Generate natural language summaries
- Recommend specific actions
- Predict future trends
- Connect cause-effect between signals

---

## The Panel's Unanimous Recommendation

**Start with Priority Grouping (Phase 2) immediately.**

Why:
1. **Lowest effort:** Uses existing ticker cards, just reorders them
2. **Highest impact:** Directs attention to what matters
3. **Proven pattern:** Every monitoring tool does this (Datadog, Grafana, etc.)
4. **Backwards compatible:** Doesn't break current users' mental model

**The winning format for daily executive glances:**
\`\`\`
┌──────────────────────────────────────┐
│  CAMINO INSIGHTS                     │
│  Last updated: 2 min ago             │
│                                      │
│  🔴 NEEDS ATTENTION (1)              │
│  └─ Ticket backlog: 47 (↑ 47%)      │
│     8 tickets over SLA - Act today   │
│                                      │
│  🟡 MONITOR CLOSELY (2)              │
│  └─ Win rate: 31% (↓ 4pts from goal)│
│  └─ Response time: 2.1 days (↑ 15%) │
│                                      │
│  🟢 PERFORMING WELL (5 signals)      │
│  └─ [Tap to expand]                  │
│                                      │
│  [View All] [Set Alerts]             │
└──────────────────────────────────────┘
\`\`\`

This answers: "What needs my attention?" in 5 seconds. Everything else is a tap away.

---

## Key Metrics to Measure Success

After implementing priority grouping, track:
1. **Daily active users** (do more execs check daily?)
2. **Time to action** (how fast do they respond to red signals?)
3. **False positive rate** (how often is "urgent" actually not urgent?)
4. **Completion rate** (do red signals get resolved?)

If these improve, you've validated the format. If not, try Concept B (Smart Brief).

---

## Final Thought from Sam

"The best analysis format isn't about showing more data - it's about creating FOMO. Executives check their stock portfolios because they're afraid of missing a crash. Your ticker cards don't create urgency. Priority grouping does. That red 🔴 badge is your competitive advantage."

---

**Panel Consensus: Build priority grouping first (5 days). Test for 2 weeks. If engagement doubles, invest in AI insights. If not, pivot to narrative briefs.**
