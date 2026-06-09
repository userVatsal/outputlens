# FEATURE_GATING.md

# OutputLens Feature Access Matrix

## Free

Includes:

- 3 analyses per month
- Basic Monte Carlo
- Basic Risk Metrics
- 7-day history
- US equities

Restrictions:

- No exports
- No Risk Alerts
- No Correlation Scanner
- No Portfolio Analytics

---

## Starter

Includes:

- Expanded analysis limits
- AI Commentary
- Regime Monitor
- Position Sizer
- Earnings Risk
- Volatility Analysis
- Drawdown Analysis

---

## Pro

Includes:

- Correlation Scanner
- Risk Alerts
- Portfolio Analytics
- Unlimited History
- PDF Export
- CSV Export

---

## Trader

Includes:

- API Access
- Larger Portfolios
- Priority Processing
- Advanced Monitoring

---

## Enforcement Rules

Feature gating must be enforced server-side.

Frontend visibility is not security.

Every protected endpoint must validate plan access.

Never trust frontend state.
