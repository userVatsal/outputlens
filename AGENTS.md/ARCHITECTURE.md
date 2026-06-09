# ARCHITECTURE.md

# OutputLens Architecture

## Overview

OutputLens is a risk intelligence platform built around a single core workflow:

User Input
→ Market Data Retrieval
→ Analysis Engine
→ Risk Metrics
→ Scenario Generation
→ AI Commentary
→ Persistence
→ Dashboard & Monitoring

The analysis engine is the source of truth.

AI commentary is an interpretation layer only.

---

# High-Level System

Frontend
↓
Application Services
↓
Supabase Backend
↓
Analysis Engine
↓
Risk Layer
↓
Persistence Layer
↓
Monitoring Layer

---

# Frontend Responsibilities

Responsible for:

- User interaction
- Visualisation
- Dashboard rendering
- Forms
- Workspace flows
- Reporting

Not responsible for:

- Risk calculations
- Subscription enforcement
- Business logic
- Financial calculations

---

# Backend Responsibilities

Responsible for:

- Analysis execution
- Risk calculations
- Data validation
- Feature gating
- Data persistence
- Alert generation

Backend is authoritative.

Frontend should never calculate risk metrics independently.

---

# Analysis Engine

Purpose:

Transform position inputs into probabilistic risk outputs.

Inputs:

- Asset
- Direction
- Position Size
- Time Horizon
- Market Data

Outputs:

- Distribution
- Risk Metrics
- Scenario Data
- Regime Classification

The analysis engine is core intellectual property.

---

# Intelligence Layer

Purpose:

Explain outputs.

The intelligence layer:

- Reads analysis outputs
- Generates summaries
- Produces commentary

The intelligence layer does not:

- Calculate
- Predict
- Override risk metrics

---

# Monitoring Layer

Responsible for:

- Risk Alerts
- Risk Pulse
- Regime Monitoring
- Portfolio Monitoring

Must consume persisted analysis data.

---

# Subscription Layer

All premium functionality must be enforced server-side.

Never rely on frontend-only checks.

Feature access must be validated before execution.

---

# Performance Targets

Analysis Experience:

- Fast perceived response time
- Progressive loading
- Graceful degradation

Monitoring:

- Near real-time updates
- Efficient caching

Dashboard:

- Fast initial load
- Cached market data

---

# Architecture Rules

Never:

- Put financial logic in UI components
- Duplicate calculations
- Allow AI to generate calculations

Always:

- Use backend as source of truth
- Keep analysis deterministic
- Keep calculations auditable
