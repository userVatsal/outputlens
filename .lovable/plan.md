
# Fix Track Asset Feature & Add to Portfolio Feature

## Problem Analysis

### Track Asset Feature Issues

The "Track Asset" feature fails because the database schema doesn't match what the code expects:

**Current `tracked_assets` columns:**
- `id`, `user_id`, `symbol`, `market`, `entry_price`, `baseline_risk_score`, `monitoring_frequency`, `risk_threshold`, `notes`, `created_at`, `updated_at`, `last_checked_at`

**Expected by `useTrackedAssets.tsx`:**
- 20+ columns including `direction`, `asset_name`, `track_frequency`, `alert_on_risk_change`, `risk_threshold_delta`, `risk_score_at_track`, `current_risk_score`, `risk_delta`, `status`, and more

The hook attempts to insert/query columns that don't exist, causing failures.

### Add to Portfolio Feature

Currently shows "Coming Soon" toast. Needs implementation to:
1. Create a `saved_portfolios` table for persistent portfolio storage
2. Add asset from analysis to a saved portfolio
3. Integrate with existing `PortfolioAnalyzer`

---

## Solution Overview

```text
┌────────────────────────────────────────────────────────────────┐
│                    PHASE 1: DATABASE                            │
├────────────────────────────────────────────────────────────────┤
│  1. Add missing columns to tracked_assets (17 columns)         │
│  2. Add missing columns to risk_alerts (severity, previous_val)│
│  3. Create saved_portfolios table                               │
│  4. Create portfolio_assets junction table                      │
│  5. Add unique constraints and indexes                          │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    PHASE 2: CODE UPDATES                        │
├────────────────────────────────────────────────────────────────┤
│  1. Update ActionPanel.tsx - Implement handleAddToPortfolio    │
│  2. Create AddToPortfolioModal component                        │
│  3. Create useSavedPortfolios hook                              │
│  4. Update PortfolioAnalyzer to load saved portfolios          │
└────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Migration

### 1.1 Alter `tracked_assets` Table

Add these missing columns:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| asset_name | text | NULL | Human-readable name |
| direction | varchar(10) | 'long' | Trade direction |
| position_size | numeric | NULL | Position sizing |
| position_type | varchar(20) | NULL | 'shares' or 'dollars' |
| track_frequency | varchar(20) | 'weekly' | Frequency alias |
| alert_on_risk_change | boolean | true | Enable alerts |
| risk_threshold_delta | numeric | 2.0 | Alert threshold |
| risk_score_at_track | numeric | NULL | Baseline score |
| win_prob_at_track | numeric | NULL | Baseline win prob |
| var95_at_track | numeric | NULL | Baseline VaR |
| tail_risk_at_track | numeric | NULL | Baseline tail risk |
| current_risk_score | numeric | NULL | Latest score |
| current_win_prob | numeric | NULL | Latest win prob |
| current_var95 | numeric | NULL | Latest VaR |
| current_tail_risk | numeric | NULL | Latest tail risk |
| last_analysis_at | timestamptz | NULL | Last refresh |
| risk_delta | numeric | NULL | Score change |
| status | varchar(20) | 'active' | active/paused/closed |

Also add:
- Unique constraint on `(user_id, symbol, market)` for upsert support
- Index on `(user_id, status)` for dashboard queries
- Index on `(status, last_analysis_at)` for monitor function

### 1.2 Alter `risk_alerts` Table

Add:
- `severity` varchar(20) DEFAULT 'info' 
- `previous_value` numeric NULL

### 1.3 Create `saved_portfolios` Table

```text
saved_portfolios
+-------------------+---------------+----------+
| Column            | Type          | Default  |
+-------------------+---------------+----------+
| id                | uuid          | gen_uuid |
| user_id           | uuid          | NOT NULL |
| name              | varchar(100)  | NOT NULL |
| description       | text          | NULL     |
| time_horizon      | varchar(50)   | '3-7 days'|
| is_default        | boolean       | false    |
| last_analyzed_at  | timestamptz   | NULL     |
| created_at        | timestamptz   | now()    |
| updated_at        | timestamptz   | now()    |
+-------------------+---------------+----------+
UNIQUE(user_id, name)
```

RLS Policy: Users can only access their own portfolios

### 1.4 Create `portfolio_assets` Junction Table

```text
portfolio_assets
+-------------------+---------------+----------+
| Column            | Type          | Default  |
+-------------------+---------------+----------+
| id                | uuid          | gen_uuid |
| portfolio_id      | uuid          | NOT NULL |
| user_id           | uuid          | NOT NULL |
| symbol            | varchar(20)   | NOT NULL |
| market            | varchar(10)   | 'US'     |
| direction         | varchar(10)   | 'long'   |
| weight            | numeric       | NOT NULL |
| entry_price       | numeric       | NULL     |
| created_at        | timestamptz   | now()    |
+-------------------+---------------+----------+
FK: portfolio_id → saved_portfolios(id) ON DELETE CASCADE
UNIQUE(portfolio_id, symbol, market)
```

RLS Policy: Users can only access assets in their own portfolios

---

## Phase 2: Code Updates

### 2.1 Create `useSavedPortfolios` Hook

New file: `src/hooks/useSavedPortfolios.tsx`

Features:
- `fetchPortfolios()` - Get all user's saved portfolios
- `createPortfolio(name, description?)` - Create new portfolio
- `addAssetToPortfolio(portfolioId, asset)` - Add asset to portfolio
- `removeAssetFromPortfolio(portfolioId, assetId)` - Remove asset
- `updateAssetWeight(assetId, weight)` - Update weight
- `deletePortfolio(id)` - Delete portfolio
- `getPortfolioAssets(portfolioId)` - Get all assets in portfolio

### 2.2 Create `AddToPortfolioModal` Component

New file: `src/components/workspace/AddToPortfolioModal.tsx`

Features:
- List existing portfolios
- "Create New Portfolio" option
- Set weight for the asset (slider 5-100%)
- Preview current allocation if portfolio exists
- Submit adds asset to selected portfolio

### 2.3 Update `ActionPanel.tsx`

Changes:
- Import and render `AddToPortfolioModal`
- Replace "Coming Soon" toast with modal open
- Add state for modal visibility

### 2.4 Update `PortfolioAnalyzer.tsx`

Add ability to:
- Load saved portfolios from dropdown
- Pre-populate assets from saved portfolio
- Save current composition to new/existing portfolio

---

## User Flow After Implementation

### Track Asset Flow
1. User runs analysis in Workspace
2. Clicks "Track Asset" button
3. Modal opens with frequency/threshold settings
4. Submits → Asset saved to `tracked_assets` with all metrics
5. Asset appears on Dashboard in "Monitored Assets" card
6. Background `monitor-assets` function re-analyzes on schedule
7. Alerts generated if thresholds breached

### Add to Portfolio Flow
1. User runs analysis in Workspace
2. Clicks "Add to Portfolio" button
3. Modal opens showing existing portfolios
4. User selects portfolio or creates new one
5. Sets weight percentage (slider)
6. Submits → Asset added to `portfolio_assets`
7. User navigates to Portfolio page
8. Can load saved portfolio for batch analysis

---

## Technical Details

### Database Migration SQL (Summary)

```sql
-- 1. Add columns to tracked_assets
ALTER TABLE tracked_assets 
  ADD COLUMN asset_name text,
  ADD COLUMN direction varchar(10) NOT NULL DEFAULT 'long',
  ADD COLUMN position_size numeric,
  ADD COLUMN position_type varchar(20),
  ADD COLUMN track_frequency varchar(20) DEFAULT 'weekly',
  ADD COLUMN alert_on_risk_change boolean DEFAULT true,
  ADD COLUMN risk_threshold_delta numeric DEFAULT 2.0,
  ADD COLUMN risk_score_at_track numeric,
  ADD COLUMN win_prob_at_track numeric,
  ADD COLUMN var95_at_track numeric,
  ADD COLUMN tail_risk_at_track numeric,
  ADD COLUMN current_risk_score numeric,
  ADD COLUMN current_win_prob numeric,
  ADD COLUMN current_var95 numeric,
  ADD COLUMN current_tail_risk numeric,
  ADD COLUMN last_analysis_at timestamptz,
  ADD COLUMN risk_delta numeric,
  ADD COLUMN status varchar(20) DEFAULT 'active';

-- 2. Add unique constraint for upsert
ALTER TABLE tracked_assets 
  ADD CONSTRAINT tracked_assets_user_symbol_market_key 
  UNIQUE (user_id, symbol, market);

-- 3. Add indexes
CREATE INDEX idx_tracked_assets_user_status 
  ON tracked_assets(user_id, status);
CREATE INDEX idx_tracked_assets_status_analysis 
  ON tracked_assets(status, last_analysis_at);

-- 4. Add columns to risk_alerts
ALTER TABLE risk_alerts
  ADD COLUMN IF NOT EXISTS severity varchar(20) DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS previous_value numeric;

-- 5. Create saved_portfolios table with RLS
-- 6. Create portfolio_assets table with RLS
```

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/hooks/useSavedPortfolios.tsx` | Create |
| `src/components/workspace/AddToPortfolioModal.tsx` | Create |
| `src/components/workspace/ActionPanel.tsx` | Modify |
| `src/components/PortfolioAnalyzer.tsx` | Modify |
| `src/pages/Portfolio.tsx` | Minor update |

---

## Expected Outcome

After implementation:
- **Track Asset**: Fully functional - saves to database, appears on dashboard, monitored by background function
- **Add to Portfolio**: Users can save assets to named portfolios, load them in Portfolio Analyzer, run batch analysis on saved portfolios
- **Dashboard**: Shows tracked assets with risk deltas and monitoring status
- **Alerts**: Generated when risk thresholds are breached

---

## Estimated Changes

- **1 Database Migration**: ~80 lines SQL
- **2 New Components**: ~200 lines each
- **1 New Hook**: ~150 lines
- **2-3 Modified Files**: ~50-100 lines changes each
