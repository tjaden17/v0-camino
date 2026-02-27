# Trend Recommendation

**Purpose:** Define how trend is calculated, how it should be displayed (percentage vs absolute), and recommendations by signal and value type. Implementation lives in `lib/signals-service.ts`, `lib/signal-format.ts`, and the signal card components.

**See also:** [SIGNAL_CATEGORIES_AND_CALCULATIONS.md](SIGNAL_CATEGORIES_AND_CALCULATIONS.md), [METRIC_SPECIFICATIONS.md](METRIC_SPECIFICATIONS.md).

---

## 1. How trend is calculated (current)

- **Data source:** Monthly time series from `signal_data_points` (one value per month per signal).
- **30d:** `(last month value − previous month value) / previous month value × 100` → percent. Absolute delta = `last month − previous month`.
- **90d:** `(sum of last 3 months − sum of previous 3 months) / sum of previous 3 months × 100` → percent. Absolute delta = `sum(last 3) − sum(prev 3)`.

**Code:** `lib/signals-service.ts` → `computeTrendsFromMonthlyPoints()`. Returns both `trend_30d_pct`, `trend_90d_pct` and `trend_30d_delta`, `trend_90d_delta`.

---

## 2. Trend display types

- **Percentage:** e.g. "+12.5%", "-8.2%". Good when relative change matters (rates, ratios).
- **Absolute:** e.g. "+$50K", "+5 tickets", "-2.5h", "+5 pp" (percentage points for rates). Good when the size of change in the same unit as the value is more intuitive (counts, volumes, currency, time).

The UI lets users choose **30d or 90d** and **% or Absolute** for all signal cards (Signals page and Admin org details User view).

---

## 3. Recommendation by signal (MSS 7)

| Signal | Recommended display | Notes |
|--------|---------------------|--------|
| Monthly Pipeline | **Absolute** | e.g. "+$120K"; % is volatile and often misleading. |
| Win Rate | **Percentage** | "+5.2%" is meaningful (rate metric). |
| Closed Revenue | **Absolute** | "+$50K" for quick scan. |
| Avg Sales Cycle | **Absolute** | e.g. "+3d" or "-2d" (same unit as value). |
| Ticket Volume | **Absolute** | e.g. "+12" or "+12/mo". |
| Avg Resolution Time | **Absolute** | e.g. "-2.5h" or "+0.5d". |
| Lead Conversion Rate | **Percentage** | "+2.1%" is standard for rates. |

Default in the app is **percent**; user can switch to **Absolute** via the trend controls. When Absolute is selected, formatting is by value type (see below).

---

## 4. Recommendation by value type (for any signal)

- **Rates / ratios** (win rate, conversion, NPS, CSAT): **Percentage** trend. If user selects Absolute, show as percentage points (e.g. "+5 pp").
- **Currency** (pipeline, revenue, deal size): **Absolute** trend (same currency as value), e.g. "+$50K".
- **Counts / volumes** (tickets, leads, customers): **Absolute** trend, e.g. "+5".
- **Time** (resolution time, sales cycle): **Absolute** trend in same unit (hours or days), e.g. "-2h", "+3d".

**Code:** `lib/signal-format.ts` → `inferValueType()`, `formatTrendAbsolute()`.

---

## 5. Implementation reference

- **Calculation:** `lib/signals-service.ts` — `computeTrendsFromMonthlyPoints()`, `getSignals()` (adds `trend_30d_delta`, `trend_90d_delta`).
- **Display:** `lib/signal-format.ts` — `formatTrendPct()`, `formatTrendAbsolute()`, `inferValueType()`.
- **Card:** `components/signal-accordion-card.tsx` — props `trendPeriod` ("30d" | "90d"), `trendDisplay` ("percent" | "absolute").
- **Signals page:** `components/signals-page-client.tsx` — trend toggles (30d / 90d, % / Abs).
- **Admin:** `app/api/admin/organizations/[id]/details/route.ts` returns deltas; `components/admin/organization-details-client.tsx` passes trend options to CatalogSignalsView.
