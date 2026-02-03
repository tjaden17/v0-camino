# Signal Service - Master Documentation

## A) Goal

The Signal Service transforms raw business data from Zoho CRM and Zoho Desk into actionable KPIs and metrics that help businesses monitor their health, identify risks, and make data-driven decisions.

**Primary Objectives:**
1. **Data Unification** - Combine data from multiple sources (CRM deals, support tickets, accounts, contacts) into a unified view
2. **Signal Discovery** - Automatically identify which metrics can be calculated based on available data
3. **Multi-Source Intelligence** - Calculate composite signals that require data from multiple sources (e.g., "Customer Health Score" needs both CRM and Desk data)
4. **Trend Tracking** - Monitor signals over time with historical data points and benchmarks

---

## B) How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA IMPORT LAYER                           │
├───────────────┬───────────────┬───────────────┬────────────────────┤
│   CSV/XLSX    │   File Type   │   Sheet/Tab   │   Signal           │
│   Upload      │   Detection   │   Detection   │   Discovery        │
└───────┬───────┴───────┬───────┴───────┬───────┴────────┬───────────┘
        │               │               │                │
        ▼               ▼               ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         STAGING LAYER                               │
├───────────────┬───────────────┬───────────────┬────────────────────┤
│  zoho_deals   │ zoho_tickets  │ zoho_accounts │  zoho_contacts     │
│  (CRM)        │ (Desk)        │ (CRM/Desk)    │  (CRM)             │
└───────┬───────┴───────┬───────┴───────┬───────┴────────┬───────────┘
        │               │               │                │
        └───────────────┴───────────────┴────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SIGNAL CALCULATION ENGINE                        │
├─────────────────────────────────────────────────────────────────────┤
│  • Checks data source availability                                  │
│  • Matches signals to available data                                │
│  • Calculates single-source signals (e.g., Sales Pipeline)         │
│  • Calculates multi-source signals (e.g., Customer Health Score)   │
│  • Stores results with timestamps and trends                        │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         OUTPUT LAYER                                │
├───────────────┬───────────────┬───────────────┬────────────────────┤
│   signals     │  data_points  │  Signal Hub   │  User Dashboards   │
│   (current)   │  (historical) │  (admin)      │  (display)         │
└───────────────┴───────────────┴───────────────┴────────────────────┘
```

### Key Components

#### 1. File Import (`/app/admin/import`)
- Accepts CSV and XLSX files (Excel with multiple tabs)
- Auto-detects file type: Zoho CRM vs Zoho Desk
- For XLSX, processes all tabs (Leads, Deals, Contacts, Accounts, Tickets)
- Uses `lib/xlsx-parser.ts` for Excel parsing
- Uses `lib/zoho-signal-discovery.ts` for signal detection

#### 2. Signal Discovery (`lib/zoho-signal-discovery.ts`)
- Analyzes uploaded data to identify available columns
- Maps columns to pre-defined signal definitions
- Calculates sample values from the data
- Returns confidence level (high/medium/low) for each signal

#### 3. Staging Tables (Database)
```
zoho_deals      - CRM deal/opportunity data
zoho_tickets    - Support ticket data  
zoho_accounts   - Company/account data
zoho_contacts   - Contact/person data
zoho_imports    - Import session tracking
zoho_data_sources - Availability tracking per organization
```

#### 4. Signal Definitions (`signal_definitions` table)
Pre-defined signals with:
- `signal_key` - Unique identifier
- `required_sources` - Array of data types needed (e.g., `['deals', 'tickets']`)
- `calculation_type` - `single_source`, `multi_source`, or `composite`
- `trend_direction` - Whether up is good or bad

#### 5. Multi-Source Signal Service (`lib/multi-source-signal-service.ts`)
- Checks which data sources are available for an organization
- Determines which signals can be calculated
- Performs cross-table calculations for composite signals
- Links data via `account_name` or `account_id`

### Signal Types

| Type | Description | Example |
|------|-------------|---------|
| **Single-Source** | Calculated from one data type | Sales Pipeline (deals only) |
| **Multi-Source** | Requires 2+ data types | Customer Health Score (deals + tickets) |
| **Composite** | Derived from other signals | Revenue at Risk (health score + deal value) |

### Data Flow

1. **Upload**: User uploads CSV or XLSX file
2. **Detection**: System identifies file type and data structure
3. **Discovery**: Available signals are identified based on columns present
4. **Selection**: User selects which signals to enable
5. **Staging**: Raw data is stored in staging tables (optional)
6. **Calculation**: Signal values are computed
7. **Storage**: Results saved to `signals` table with `data_points` history
8. **Display**: Signals appear in user dashboards

---

## C) Constraints

### Database Schema Constraints

#### `signals` Table
| Column | Type | Constraint |
|--------|------|------------|
| `id` | UUID | Primary key |
| `name` | TEXT | **UNIQUE** - no duplicate names |
| `benchmark_type` | TEXT | Must be: `'internal'`, `'industry'`, or `'user_defined'` |
| `trend` | TEXT | Must be: `'increasing'`, `'decreasing'`, or `'stable'` |
| `owner_id` | UUID | References `auth.users(id)` |
| `created_by` | UUID | References `auth.users(id)` |

**Note**: The `signals` table does NOT have:
- `organization_id` (signals are linked via `owner_id`)
- `description` 
- `current_value` (use `data_points` for values)
- `source` field

#### Data Linking Constraint
Multi-source signals link data via `account_name`:
- `zoho_deals.account_name` ↔ `zoho_tickets.account_name` ↔ `zoho_accounts.account_name`
- This requires consistent naming across Zoho systems
- Fuzzy matching may be needed for mismatches

### File Format Constraints

#### CSV Detection
The system detects Zoho CRM vs Zoho Desk by looking for specific columns:

**CRM Indicators:**
- `deal name`, `deal owner`, `closing date`, `stage`, `amount`, `pipeline`, `probability`
- Requires 2+ matches OR (`stage` AND `amount`)

**Desk Indicators:**
- `ticket owner`, `sla violation`, `resolution time`, `first response time`, `is escalated`, `channel`, `department`
- Requires 2+ matches

#### XLSX Multi-Tab Detection
Each tab is analyzed independently:
- **Deals**: `deal name`, `deal owner`, `stage`, `amount`
- **Leads**: `lead owner`, `lead status`, `lead source`, `is converted`
- **Contacts**: `contact owner`, `last name`, `email`
- **Accounts**: `account name`, `account owner`, `industry`
- **Tickets**: `ticket owner`, `sla violation`, `resolution time`

### Signal Calculation Constraints

#### Required Data Sources
| Signal | Required Sources |
|--------|------------------|
| Sales Pipeline Value | `deals` |
| Ticket Volume | `tickets` |
| Customer Health Score | `deals` + `tickets` |
| Support Cost per Account | `deals` + `tickets` + `accounts` |

#### Minimum Data Requirements
- Signals require at least 1 record to calculate
- Date-based signals need valid `created_time` or `closing_date`
- Percentage signals need non-zero denominators

### Security Constraints

- All staging tables have Row Level Security (RLS) enabled
- Signal definitions are readable by all authenticated users
- Staging data is scoped by `organization_id`
- Upload history is scoped by `uploaded_by`

### Performance Constraints

- XLSX files are parsed entirely in memory (limit large files)
- Staging tables have indexes on `organization_id`, `account_name`, `import_id`
- Historical data points are limited to prevent unbounded growth
- 90-day rolling average function exists for benchmarks

---

## Modular Architecture

The codebase is organized into logical modules that could be extracted as microservices when scale demands:

```
lib/modules/
├── import/     # File upload, parsing, validation
├── staging/    # Data normalization, storage, source tracking
├── signals/    # Discovery, calculation, quality scoring
├── analysis/   # Trends, root cause, segments
├── impact/     # Goals, projections, business impact
└── dashboard/  # Card composition, three-view UI
```

### Module Boundaries

| Module | Responsibility | Key Exports |
|--------|----------------|-------------|
| **Import** | Get data into the system | `parseXLSX`, `detectFileType`, `validateImportFile` |
| **Staging** | Store normalized raw data | `stageRecords`, `getDataSources`, `normalizeRecord` |
| **Signals** | Signal discovery & calculation | `getAvailableSignals`, `calculateSignal`, `scoreSignalQuality` |
| **Analysis** | Generate insights | `calculateTrend`, `analyzeRootCause`, `identifySegments` |
| **Impact** | Connect to business outcomes | `getRelatedGoals`, `projectTrend`, `assessDirection` |
| **Dashboard** | Compose signal cards | `getSignalCards`, `getWhatWeFoundView`, `getWhatItMeansView`, `getSoWhatView` |

### Three-View Signal Card

Each signal card supports three views:

1. **What We Found** - Data source, date range, data quality, signal quality, export option
2. **What It Means** - Trend (30/60/90 day), root cause analysis, sub-segments
3. **So What** - Goal impact, direction (good/bad), expected/unexpected, projections

### Usage Example

```typescript
import { 
  stageRecords, 
  getDataSources 
} from '@/lib/modules/staging'

import { 
  getAvailableSignals, 
  calculateSignal 
} from '@/lib/modules/signals'

import { 
  composeFullSignalCard 
} from '@/lib/modules/dashboard'

// Stage imported data
await stageRecords(records, 'deals', organizationId, importId)

// Check what signals are now available
const { available, locked } = await getAvailableSignals(organizationId)

// Get complete signal card with all three views
const { card, found, means, soWhat } = await composeFullSignalCard(signalId, organizationId)
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| **Modules** | |
| `lib/modules/import/index.ts` | Import module - parsing, validation |
| `lib/modules/staging/index.ts` | Staging module - data storage |
| `lib/modules/signals/index.ts` | Signals module - discovery, calculation |
| `lib/modules/analysis/index.ts` | Analysis module - trends, root cause |
| `lib/modules/impact/index.ts` | Impact module - goals, projections |
| `lib/modules/dashboard/index.ts` | Dashboard module - card composition |
| **Legacy (to be migrated)** | |
| `lib/zoho-signal-discovery.ts` | Signal detection and analysis |
| `lib/multi-source-signal-service.ts` | Multi-source calculation engine |
| `lib/xlsx-parser.ts` | Excel file parsing |
| **UI** | |
| `app/admin/import/page.tsx` | Import UI |
| `app/admin/signal-hub/page.tsx` | Signal availability dashboard |
| **API Routes** | |
| `app/api/admin/import/analyze/route.ts` | File analysis API |
| `app/api/admin/import/enable-signals/route.ts` | Signal creation API |
| **Database** | |
| `scripts/002_create_signals.sql` | Core signals schema |
| `scripts/012_zoho_staging_tables.sql` | Staging tables schema |

---

## Architecture Documentation

- `docs/architecture-modules.md` - Full module specification with extraction checklist

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Jan 2026 | 1.0 | Initial multi-source signal architecture |
