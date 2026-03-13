# Camino Growth Model

Date: February 27, 2026
Status: Exploration — directional model, not a financial forecast
Related docs: HOW_WILL_THIS_PRODUCT_GROW.md, VIRALITY_AND_INTERORG_CONNECTIONS.md,
              GROUP_FORMATION_AND_NETWORK_EFFECTS.md

---

## The Three Growth Inputs

Every new org that joins Camino comes from one of three sources:

  Source A — Direct: Founder-led sales, outbound, partnerships
  Source B — Viral: A non-customer receives a shared signal view and converts
  Source C — Group: A coordinator brings their network in a single event

The growth model tracks the contribution of each source over time and how they interact.

---

## The Variables

Direct sales rate (D):
  New orgs per month from direct sales effort
  Assumed constant in early stages, grows with sales investment
  Current baseline: 2-3 orgs per month

Viral coefficient (K):
  New orgs generated per existing org per month from viral loops
  K = (share events per org per month) x (recipients per share) x (conversion rate)
  Current estimated K: 0.05 (very early, no share infrastructure yet)
  Target K at Phase 2: 0.15
  Target K at Phase 3: 0.25

Group event rate (G):
  Group coordinator events per month
  Orgs per group event (N): average size of each group brought on
  Current G: 0 (not yet activated)
  Target G at Phase 3: 1-2 events per month
  Target N at Phase 3: 8-15 orgs per event

Monthly churn rate (C):
  Percentage of orgs that leave per month
  Assumed: 2-3% monthly (B2B SaaS typical for SMB)
  Improves as network effects deepen (harder to leave a network than a tool)

---

## The Growth Formula

New orgs per month = D + (Total orgs x K) + (G x N)
Net orgs per month = New orgs - (Total orgs x C)

---

## Modelled Scenarios

Phase 1 — Direct Sales Only (0 to 20 orgs)
  D = 3, K = 0.05, G = 0, N = 0, C = 2.5%

  Month 1:   3 new, 0 churn  = 3 total
  Month 3:   3 new, 0 churn  = 9 total
  Month 6:   3 new, 0 churn  = 18 total
  Month 9:   3 new, 0 churn  = 27 total

  Viral contribution at month 9: 27 x 0.05 = 1.35 orgs per month
  Growth is almost entirely direct. Viral barely registers.

---

Phase 2 — Viral Loops Active (20 to 100 orgs)
  D = 4, K = 0.15, G = 0, N = 0, C = 2.5%

  Starting at 20 orgs:
  Month 1:   4 + (20 x 0.15) = 7 new, 0.5 churn  = 26.5 total
  Month 3:   4 + (35 x 0.15) = 9.3 new, 0.9 churn = 44 total
  Month 6:   4 + (60 x 0.15) = 13 new, 1.5 churn  = 83 total
  Month 9:   4 + (90 x 0.15) = 17.5 new, 2.3 churn = 140 total

  At month 6: viral contribution (9 orgs) exceeds direct (4 orgs) for the first time.
  This is the inflection point. Product growth begins to outrun sales effort.

---

Phase 3 — Group Formation Active (100 to 500 orgs)
  D = 5, K = 0.20, G = 1.5 events/month, N = 12 orgs/event, C = 2%

  Starting at 100 orgs:
  Month 1:   5 + (100 x 0.20) + (1.5 x 12) = 43 new, 2 churn = 141 total
  Month 3:   5 + (200 x 0.20) + (1.5 x 12) = 63 new, 4 churn = 336 total
  Month 6:   5 + (350 x 0.20) + (1.5 x 12) = 93 new, 7 churn = 626 total

  Group events (18 orgs/month) are now larger than direct sales (5 orgs/month).
  Viral contribution (70+ orgs/month) dominates all other sources.
  Churn rate declining as network effects increase switching cost.

---

Phase 4 — Network Effects Moat (500+ orgs)
  D = 5, K = 0.30, G = 3 events/month, N = 15 orgs/event, C = 1.5%

  At this phase:
  - Benchmark data is statistically meaningful — product improves faster than competitors
  - New orgs join partly because the data network is valuable, not just the product features
  - Churn is structurally low — leaving Camino means losing benchmark context and group membership

  Monthly new orgs: 5 + (500 x 0.30) + (3 x 15) = 5 + 150 + 45 = 200 new orgs/month
  Monthly churn: 500 x 0.015 = 7.5 orgs/month
  Net growth: approximately 192 orgs/month

---

## What Drives K From 0.05 to 0.30

The viral coefficient is a product of three sub-variables:
  K = share_rate x recipients_per_share x conversion_rate

  share_rate: what percentage of orgs share externally in a given month
    Phase 1: 5% (no share infrastructure, low awareness)
    Phase 2: 15% (share link exists, board pack active)
    Phase 3: 25% (benchmark invite, inter-org handshakes active)
    Phase 4: 35% (rich benchmark data makes sharing more compelling)

  recipients_per_share: how many non-customers see each share
    Constant assumption: 3 recipients per share event

  conversion_rate: what percentage of recipients sign up
    Phase 1: 10% (generic shared view, low differentiation)
    Phase 2: 20% (beautiful shared view, benchmark preview)
    Phase 3: 25% (personalised receiver value before sign-up)
    Phase 4: 30% (rich benchmark data visible in shared view)

The lever with the highest impact on K at Phase 1-2 is conversion_rate.
The lever with the highest impact at Phase 3-4 is share_rate.

Both are primarily design and product problems, not marketing problems.

---

## What Drives Group Events From 0 to 3/Month

Group events require a coordinator who sees enough value in bringing their network.

  Phase 2 activation: Advisor multi-org dashboard
    Target coordinators: Accountants, CFOs-as-a-service, business advisors
    Incentive: Free multi-org view for advisors who connect 2+ client orgs
    Expected event size: 5-10 orgs per advisor

  Phase 3 activation: Investor portfolio view + accelerator partnerships
    Target coordinators: Angel investors, VCs, accelerator program managers
    Incentive: Portfolio health monitoring — genuinely useful tool, not just a referral play
    Expected event size: 8-20 orgs per investor, 12-25 per accelerator cohort

  Phase 4 activation: Franchisor and platform partnerships
    Target coordinators: Franchise brands, vertical SaaS platforms, marketplace operators
    Incentive: Operational visibility across all operators — a product they cannot build themselves
    Expected event size: 40-200 orgs per franchisor

---

## The Moat Metrics to Track From Day One

These metrics must be tracked from the first customer, even if they are zero for months:

  1. Share events per org per month
     Why: The leading indicator of K. If this is zero, nothing else matters.

  2. Share link conversion rate
     Why: The multiplier on share events. Doubling this doubles K.

  3. Time to first share event per customer
     Why: Predicts long-term viral contribution. Under 30 days = healthy. Over 90 days = churn risk.

  4. Group events per month and orgs per event
     Why: Step-change growth predictor. One good group event can outperform months of direct sales.

  5. Cross-org benchmark queries per month
     Why: Proxy for network effect depth. Growing queries = growing data dependency = falling churn.

---

## Summary: The Compounding Thesis

Camino's growth model has three gears.

Gear 1 (Direct) gets the flywheel started. Gear 2 (Viral) makes the flywheel spin faster
than sales effort alone. Gear 3 (Groups + Network Effects) makes the flywheel self-sustaining.

The transition from Gear 1 to Gear 2 happens when K x Total Orgs > D.
At K = 0.15 and D = 4, this happens at approximately 27 orgs.

The transition from Gear 2 to Gear 3 happens when group events per month x orgs per event
exceeds viral contribution. At G = 1.5 and N = 12, and K = 0.20 and Total Orgs = 90,
this is approximately equal — groups and viral are both contributing around 18 orgs/month.

The goal is to reach 100 orgs before running out of direct sales energy — at which point
the model becomes self-sustaining and the product grows faster than any sales team could.
