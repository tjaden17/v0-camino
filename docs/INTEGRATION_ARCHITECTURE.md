# Signal Intelligence: Integration Architecture

## Overview

This document outlines the **hybrid integration strategy** for pulling signals from third-party tools like Zoho Desk, Zoho CRM, HubSpot, and others. The system intelligently decides when to pull pre-calculated metrics vs. when to calculate from raw data.

---

## Integration Strategy Matrix

| Tool | Pre-Calculated Available | Calculation Needed |
|------|-------------------------|-------------------|
| **Zoho Desk** | ✅ Avg resolution time<br>✅ Avg first response<br>✅ CSAT scores<br>✅ Ticket volumes<br>✅ SLA compliance | ❌ Trend velocity<br>❌ Custom time windows<br>❌ Percentile analysis<br>❌ Cross-source correlation |
| **Zoho CRM** | ✅ Pipeline metrics<br>✅ Conversion rates<br>✅ Revenue totals<br>✅ Deal stages | ❌ Customer cohorts<br>❌ Custom segments<br>❌ Churn predictions |
| **HubSpot** | ✅ Campaign attribution<br>✅ Email stats<br>✅ Session analytics<br>✅ Revenue attribution | ❌ Multi-touch attribution<br>❌ Custom funnel analysis<br>❌ Predictive lead scoring |

---

## Architecture Components

### 1. Integration Adapters

Each platform has an adapter that knows what's available:

```typescript
// lib/integrations/base-adapter.ts
export abstract class BaseIntegrationAdapter {
  abstract platform: string
  
  // What metrics can be pulled directly
  abstract getAvailablePreCalculatedMetrics(): string[]
  
  // Pull pre-calculated metric
  abstract fetchPreCalculatedMetric(
    metricName: string, 
    options: { startDate: Date, endDate: Date }
  ): Promise<number>
  
  // Pull raw data for custom calculation
  abstract fetchRawData(
    dataType: string,
    options: { startDate: Date, endDate: Date }
  ): Promise<any[]>
}
```

### 2. Zoho Desk Adapter

```typescript
// lib/integrations/zoho-desk-adapter.ts
import { BaseIntegrationAdapter } from './base-adapter'

export class ZohoDeskAdapter extends BaseIntegrationAdapter {
  platform = 'zoho_desk'
  
  // Metrics available from Zoho Analytics API
  private preCalculatedMetrics = [
    'avg_resolution_time',
    'avg_first_response_time',
    'csat_score',
    'ticket_volume',
    'open_tickets',
    'closed_tickets',
    'sla_compliance_rate',
    'tickets_by_priority',
    'tickets_by_channel'
  ]
  
  getAvailablePreCalculatedMetrics() {
    return this.preCalculatedMetrics
  }
  
  async fetchPreCalculatedMetric(metricName: string, options: any) {
    // Call Zoho Analytics API
    const response = await fetch(
      `https://analytics.zoho.com/api/v2/workspaces/${workspaceId}/views/${viewId}/data`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ZOHO_ACCESS_TOKEN}`
        }
      }
    )
    
    const data = await response.json()
    return this.extractMetric(data, metricName)
  }
  
  async fetchRawData(dataType: string, options: any) {
    // Pull raw tickets for custom calculations
    const response = await fetch(
      `https://desk.zoho.com/api/v1/tickets?from=${options.startDate}&to=${options.endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ZOHO_ACCESS_TOKEN}`
        }
      }
    )
    
    return response.json()
  }
}
```

### 3. HubSpot Adapter

```typescript
// lib/integrations/hubspot-adapter.ts
import { BaseIntegrationAdapter } from './base-adapter'

export class HubSpotAdapter extends BaseIntegrationAdapter {
  platform = 'hubspot'
  
  private preCalculatedMetrics = [
    'email_open_rate',
    'email_click_rate',
    'campaign_revenue',
    'new_contacts_first_touch',
    'new_contacts_last_touch',
    'session_count',
    'bounce_rate',
    'avg_session_duration'
  ]
  
  getAvailablePreCalculatedMetrics() {
    return this.preCalculatedMetrics
  }
  
  async fetchPreCalculatedMetric(metricName: string, options: any) {
    switch(metricName) {
      case 'email_open_rate':
        return this.fetchEmailStats('openRatio', options)
      case 'campaign_revenue':
        return this.fetchCampaignRevenue(options)
      default:
        throw new Error(`Metric ${metricName} not available`)
    }
  }
  
  private async fetchEmailStats(metric: string, options: any) {
    const response = await fetch(
      `https://api.hubapi.com/marketing/v3/emails/statistics/list`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`
        }
      }
    )
    
    const data = await response.json()
    return data.counters[metric]
  }
  
  private async fetchCampaignRevenue(options: any) {
    const { campaignGuid } = options
    const response = await fetch(
      `https://api.hubapi.com/marketing/v3/campaigns/${campaignGuid}/reports/revenue`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`
        }
      }
    )
    
    const data = await response.json()
    return data.totalRevenue
  }
  
  async fetchRawData(dataType: string, options: any) {
    // Pull raw deals, contacts, etc.
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/${dataType}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`
        }
      }
    )
    
    return response.json()
  }
}
```

### 4. Smart Signal Router

Decides whether to pull or calculate:

```typescript
// lib/integrations/signal-router.ts
import { ZohoDeskAdapter } from './zoho-desk-adapter'
import { HubSpotAdapter } from './hubspot-adapter'

export class SignalRouter {
  private adapters = new Map<string, BaseIntegrationAdapter>()
  
  constructor() {
    this.adapters.set('zoho_desk', new ZohoDeskAdapter())
    this.adapters.set('hubspot', new HubSpotAdapter())
  }
  
  async fetchSignalValue(
    platform: string,
    metricName: string,
    options: { startDate: Date, endDate: Date, customLogic?: boolean }
  ) {
    const adapter = this.adapters.get(platform)
    if (!adapter) throw new Error(`Platform ${platform} not supported`)
    
    // Check if metric is available pre-calculated
    const availableMetrics = adapter.getAvailablePreCalculatedMetrics()
    
    if (availableMetrics.includes(metricName) && !options.customLogic) {
      console.log(`[v0] Pulling pre-calculated metric: ${metricName}`)
      return adapter.fetchPreCalculatedMetric(metricName, options)
    } else {
      console.log(`[v0] Calculating custom metric: ${metricName}`)
      const rawData = await adapter.fetchRawData('tickets', options)
      return this.calculateCustomMetric(metricName, rawData, options)
    }
  }
  
  private calculateCustomMetric(metricName: string, rawData: any[], options: any) {
    // Custom calculation logic
    switch(metricName) {
      case 'ticket_velocity':
        return this.calculateTicketVelocity(rawData)
      case 'high_priority_backlog':
        return this.calculateHighPriorityBacklog(rawData)
      default:
        throw new Error(`Custom calculation for ${metricName} not implemented`)
    }
  }
  
  private calculateTicketVelocity(tickets: any[]) {
    // Calculate week-over-week change
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    
    const thisWeek = tickets.filter(t => new Date(t.created_at) > lastWeek).length
    const prevWeek = tickets.filter(t => {
      const d = new Date(t.created_at)
      return d > twoWeeksAgo && d <= lastWeek
    }).length
    
    return ((thisWeek - prevWeek) / prevWeek) * 100 // % change
  }
  
  private calculateHighPriorityBacklog(tickets: any[]) {
    return tickets.filter(t => 
      t.status === 'Open' && 
      t.priority === 'High' &&
      this.daysSince(t.created_at) > 7
    ).length
  }
  
  private daysSince(date: string) {
    return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  }
}
```

---

## Decision Tree: Pull vs Calculate

```
┌─────────────────────────────────────┐
│ Need Signal Value                    │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ Is it a standard platform KPI?      │
│ (e.g., avg resolution time)         │
└───────────┬─────────────────────────┘
            │
       ┌────┴────┐
       │         │
      YES       NO
       │         │
       ▼         ▼
┌──────────┐  ┌──────────────────────┐
│ Pull     │  │ Does it require      │
│ Direct   │  │ custom logic?        │
└──────────┘  └─────┬────────────────┘
                    │
               ┌────┴────┐
               │         │
              YES       NO
               │         │
               ▼         ▼
        ┌────────────┐ ┌──────────────┐
        │ Calculate  │ │ Check if     │
        │ from Raw   │ │ trending/    │
        │ Data       │ │ velocity     │
        └────────────┘ └──────┬───────┘
                              │
                         ┌────┴────┐
                         │         │
                        YES       NO
                         │         │
                         ▼         ▼
                  ┌────────────┐ ┌──────────┐
                  │ Calculate  │ │ Pull     │
                  │ Trend      │ │ Direct   │
                  └────────────┘ └──────────┘
```

---

## Usage Examples

### Example 1: Pull Pre-Calculated Metric

```typescript
const router = new SignalRouter()

// This will call Zoho Analytics API directly
const avgResolutionTime = await router.fetchSignalValue(
  'zoho_desk',
  'avg_resolution_time',
  { 
    startDate: new Date('2025-12-01'),
    endDate: new Date('2025-12-31')
  }
)
```

### Example 2: Calculate Custom Metric

```typescript
// This requires custom logic, so fetch raw data
const ticketVelocity = await router.fetchSignalValue(
  'zoho_desk',
  'ticket_velocity', // Not a standard metric
  { 
    startDate: new Date('2025-12-01'),
    endDate: new Date('2025-12-31'),
    customLogic: true
  }
)
```

### Example 3: Hybrid - Standard Metric with Trend

```typescript
// Pull current value (pre-calculated)
const currentValue = await router.fetchSignalValue(
  'hubspot',
  'email_open_rate',
  { startDate: lastMonth.start, endDate: lastMonth.end }
)

// Calculate trend (requires two periods)
const previousValue = await router.fetchSignalValue(
  'hubspot',
  'email_open_rate',
  { startDate: twoMonthsAgo.start, endDate: twoMonthsAgo.end }
)

const trend = ((currentValue - previousValue) / previousValue) * 100
```

---

## Implementation Checklist

### Phase 1: Direct Pull (Quick Wins)
- [ ] Implement Zoho Desk adapter for standard metrics
- [ ] Implement HubSpot adapter for campaign metrics
- [ ] Create signal mappings in database
- [ ] Add OAuth flows for each platform

### Phase 2: Custom Calculations
- [ ] Build calculation engine for trends
- [ ] Implement velocity calculations
- [ ] Add percentile/ranking logic
- [ ] Create cross-platform correlations

### Phase 3: Optimization
- [ ] Cache pre-calculated values (refresh every 1-6 hours)
- [ ] Batch API calls to reduce quota usage
- [ ] Implement webhook listeners for real-time updates
- [ ] Add fallback logic when API fails

---

## Cost Optimization

### API Call Minimization

**Zoho Desk:**
- Cache pre-calculated metrics for 4 hours
- Batch fetch multiple metrics in one call when possible
- Use webhooks for ticket events instead of polling

**HubSpot:**
- Cache campaign revenue for 6 hours (changes slowly)
- Cache email stats for 1 hour (updates more frequently)
- Use API rate limit: 100 calls/10 seconds

**General:**
- Store historical values in database
- Only recalculate trends when new data arrives
- Use incremental updates, not full recalculation

```typescript
// Caching strategy
const CACHE_DURATION = {
  'avg_resolution_time': 4 * 60 * 60 * 1000, // 4 hours
  'ticket_volume': 1 * 60 * 60 * 1000, // 1 hour
  'campaign_revenue': 6 * 60 * 60 * 1000, // 6 hours
}

async function fetchWithCache(platform: string, metric: string, options: any) {
  const cacheKey = `${platform}:${metric}:${options.startDate}`
  const cached = await cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION[metric]) {
    return cached.value
  }
  
  const value = await router.fetchSignalValue(platform, metric, options)
  await cache.set(cacheKey, { value, timestamp: Date.now() })
  
  return value
}
```

---

## Configuration

Add to your environment variables:

```bash
# Zoho
ZOHO_DESK_CLIENT_ID=xxx
ZOHO_DESK_CLIENT_SECRET=xxx
ZOHO_DESK_ACCESS_TOKEN=xxx
ZOHO_ANALYTICS_WORKSPACE_ID=xxx

# HubSpot
HUBSPOT_ACCESS_TOKEN=xxx # Already have this
HUBSPOT_PORTAL_ID=xxx

# Refresh intervals (in minutes)
SIGNAL_CACHE_DURATION_DEFAULT=240 # 4 hours
SIGNAL_CACHE_DURATION_FAST=60 # 1 hour
```

---

## Next Steps

1. **Audit your signal requirements** - Which signals do you need?
2. **Map to platform capabilities** - What's pre-calculated vs custom?
3. **Prioritize quick wins** - Implement direct pulls first
4. **Build calculation layer** - Add custom logic for trends, velocity
5. **Optimize costs** - Add caching, batching, webhooks

This hybrid approach gives you the best of both worlds: speed from pre-calculated metrics and flexibility from custom calculations.
