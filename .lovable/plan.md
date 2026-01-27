
# Admin Analytics Panel for OutputLens Dashboard

## Overview

This plan adds an **Admin Analytics Panel** to your Dashboard page at `/home`, visible **only** when you're logged in as `uservatsal@outlook.com`. The panel provides real-time insights into user signups, traffic sources, and user behavior - all in one place.

## What You'll See

```text
Dashboard Layout (Admin View Only):
+--------------------------------------------------+
|  ADMIN ANALYTICS (Collapsible)                   |
|  +--------------------------------------------+  |
|  | Summary Cards: Signups | Sessions | Users  |  |
|  +--------------------------------------------+  |
|  | Traffic Sources Chart | Recent Signups     |  |
|  | (Pie Chart)           | (Expandable List)  |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
|  [Normal Dashboard - visible to all users]       |
|  - Account Header                                |
|  - Hero Section                                  |
|  - Workspace CTA                                 |
|  - etc...                                        |
+--------------------------------------------------+
```

### Metrics Displayed

| Metric | Description |
|--------|-------------|
| **Total Users** | Count of registered users |
| **New Signups (24h/7d)** | Recent registration activity |
| **Total Sessions** | Visitor sessions tracked |
| **Conversion Rate** | Sessions that led to signups |
| **Traffic Sources** | Where visitors come from (Reddit, Google, Direct, etc.) |
| **Recent Signups** | List of recent users with activity counts |
| **User Journey** | Click to view timeline of any user's page visits and actions |

### Security

The admin panel uses **dual-layer security**:

1. **Client-side**: Only renders if session email matches `uservatsal@outlook.com`
2. **Server-side**: Edge function rejects all requests from non-admin users with 403 Forbidden

---

## Implementation Details

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/admin-analytics/index.ts` | Backend function that aggregates data from `behavior_sessions`, `behavior_events`, `profiles`, and `analysis_history` |
| `src/components/admin/AdminAnalyticsPanel.tsx` | Main collapsible panel with summary cards, chart, and table |
| `src/components/admin/TrafficSourcesChart.tsx` | Pie chart showing traffic breakdown using Recharts |
| `src/components/admin/RecentSignupsTable.tsx` | Table of recent signups with "View Journey" buttons |
| `src/components/admin/UserJourneyModal.tsx` | Dialog showing timeline of user events |
| `src/components/admin/index.ts` | Export barrel file |
| `src/hooks/useAdminAnalytics.tsx` | React Query hook for fetching/caching admin data |

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Add admin email check and render `AdminAnalyticsPanel` at top |

---

## Technical Architecture

### Edge Function: `admin-analytics`

Handles multiple actions via query parameter:

```text
GET /admin-analytics?action=overview     -> Summary metrics
GET /admin-analytics?action=traffic      -> Traffic sources breakdown
GET /admin-analytics?action=signups      -> Recent signups with activity
GET /admin-analytics?action=journey&userId=xxx -> User event timeline
```

**Security Check** (runs first on every request):
- Extracts JWT from Authorization header
- Verifies user email is `uservatsal@outlook.com`
- Returns 403 if not admin

**Queries Used**:

Overview metrics:
- Total users from `profiles`
- Signups in last 24h/7d from `profiles.created_at`
- Total sessions from `behavior_sessions`
- Conversion rate: sessions with `user_id` / total sessions

Traffic sources:
- Groups `behavior_sessions` by `utm_source` or extracted domain from `entry_referrer`
- Returns top 10 sources with session counts

Recent signups:
- Joins `profiles` with `behavior_sessions` and counts `analysis_history`
- Shows last 20 signups with their source and activity

User journey:
- Fetches `behavior_events` for sessions linked to the user
- Orders by timestamp to show timeline

### Frontend Components

**AdminAnalyticsPanel.tsx**:
- Collapsible card with "Admin Analytics" header and shield icon
- Uses Radix Collapsible for expand/collapse
- Contains summary stat cards, chart, and table
- Only rendered when `isAdmin` is true

**TrafficSourcesChart.tsx**:
- Recharts PieChart with custom colors per source
- Shows session counts and percentages
- Responsive sizing

**RecentSignupsTable.tsx**:
- Displays masked email (first 3 chars + domain)
- Shows signup date, traffic source, analysis count
- "View" button opens UserJourneyModal

**UserJourneyModal.tsx**:
- Dialog with vertical timeline of events
- Shows page visits, clicks, scroll depth
- Color-coded event types

### Dashboard Integration

```typescript
// In Dashboard.tsx
const ADMIN_EMAIL = 'uservatsal@outlook.com';
const [userEmail, setUserEmail] = useState<string | null>(null);

// Fetch email from auth session
useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setUserEmail(data?.user?.email?.toLowerCase() || null);
  });
}, []);

const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

// In render:
{isAdmin && <AdminAnalyticsPanel />}
```

---

## Data Privacy

- User emails are **masked** in the table (e.g., `use***@outlook.com`)
- Full email only visible when expanding user journey
- All data stays within your backend - no external services

---

## Visual Design

- Uses existing glass-card styling from dashboard components
- Dark theme compatible
- Collapsible by default to not clutter the dashboard
- Admin badge/icon to clearly mark the section
- Consistent with OutputLens institutional design language

---

## Testing Checklist

After implementation:
- [ ] Panel only visible when logged in as `uservatsal@outlook.com`
- [ ] Other users (like `test@outputlens.com`) see normal dashboard without panel
- [ ] Traffic sources chart displays real data
- [ ] Recent signups table shows correct information
- [ ] User journey modal opens and shows event timeline
- [ ] Panel collapse/expand works smoothly
- [ ] Date range filter (24h/7d/30d) updates metrics
