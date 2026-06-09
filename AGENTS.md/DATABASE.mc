# DATABASE.md

# Database Design Principles

## Purpose

The database stores:

- Users
- Analyses
- Portfolios
- Monitoring data
- Subscription data
- Alerts

The database does not perform risk calculations.

Risk calculations occur before persistence.

---

# Core Entities

## Users

Stores:

- Identity
- Preferences
- Subscription linkage

---

## Profiles

Stores:

- User settings
- Investor profile
- Onboarding state

---

## Analyses

Stores:

- Asset
- Direction
- Horizon
- Generated metrics
- Risk outputs
- Timestamps

Acts as the primary historical record.

---

## Portfolios

Stores:

- Portfolio definitions
- User-created portfolios
- Asset allocations

---

## Portfolio Holdings

Stores:

- Position information
- Portfolio relationships

---

## Alerts

Stores:

- Alert configuration
- Trigger thresholds
- Notification state

---

## Tracked Assets

Stores:

- Assets monitored by users

---

## Subscription Data

Stores:

- Plan
- Status
- Billing linkage

Never trust frontend subscription state.

---

# Data Ownership Rules

Analysis Data:
Owned by analysis engine.

AI Commentary:
Owned by intelligence layer.

Market Data:
Owned by market-data services.

Subscription Data:
Owned by billing layer.

---

# Database Rules

Never:

- Store secrets
- Store calculations that cannot be reproduced

Always:

- Preserve auditability
- Preserve historical analyses
- Preserve user ownership boundaries
