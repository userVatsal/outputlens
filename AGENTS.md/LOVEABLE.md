# LOVABLE.md

# OutputLens — Lovable Project Context

Version: 1.0

This file exists specifically for Lovable.

Read this before generating code, modifying UI, creating features, refactoring architecture, adding database tables, editing copy, changing navigation, or altering workflows.

This document is the permanent source of product context.

---

# What Is OutputLens?

OutputLens is an institutional-grade risk intelligence platform.

The platform helps investors understand uncertainty through probability distributions rather than predictions.

OutputLens does not forecast prices.

OutputLens does not generate buy signals.

OutputLens does not generate sell signals.

OutputLens quantifies possible outcomes using risk models, simulations, scenario analysis, and regime detection.

Everything in the platform should reinforce this philosophy.

Internal Motto:

"The market is a distribution. Trade it like one."

---

# Primary Product Goal

Help investors make better decisions by understanding risk.

Not by predicting outcomes.

Every feature should improve:

- Risk understanding
- Probability awareness
- Portfolio awareness
- Decision quality
- Scenario planning

If a feature does not improve one of these areas, it likely does not belong in OutputLens.

---

# Most Important Product Rule

OutputLens is analysis-first.

The Analysis Workspace is the most important part of the platform.

Everything else exists to:

- Support analysis
- Explain analysis
- Monitor analysis
- Compare analyses
- Alert on analyses

Never weaken the analysis workflow.

Never replace analysis with generic market information.

---

# Product Navigation

Main Navigation:

- Dashboard
- New Analysis
- Morning Briefing
- Risk Journal
- Portfolio Analysis
- Analysis History
- Saved Scenarios
- Stress Test
- VaR Calculator
- Correlation Matrix

Intelligence Section:

- Risk Pulse
- Regime Monitor
- Risk Alerts
- Market Heatmap

Markets & Analysis:

- Market Heatmap
- Earnings Risk
- Volatility
- Drawdown
- Correlations
- Ranker
- Position Sizer

Account:

- Profile
- Subscription
- Privacy

Maintain this structure unless explicitly instructed otherwise.

---

# Core Analysis Workflow

Step 1

User selects:

- Asset
- Direction
- Position Size
- Horizon

Step 2

System retrieves market data.

Step 3

Risk engine runs analysis.

Step 4

System generates:

- Distribution
- VaR
- CVaR
- Risk Score
- Win Probability
- Regime Analysis
- Scenario Analysis

Step 5

AI commentary explains results.

Step 6

Results saved to history.

Step 7

Dashboard updates.

This workflow must remain consistent.

---

# Product Priorities

Priority Order:

1. Analysis Accuracy
2. Risk Visibility
3. Explainability
4. Portfolio Awareness
5. Monitoring
6. Reporting
7. Visual Design

Never prioritise aesthetics over risk communication.

---

# Platform Personality

OutputLens should feel:

- Institutional
- Professional
- Premium
- Analytical
- Calm

Avoid:

- Hype
- Excitement
- Trading guru language
- Social trading behaviour
- Meme investing language

Think:

- Bloomberg
- FactSet
- BlackRock Aladdin
- Institutional research terminal

Not:

- Robinhood
- Trading212
- eToro
- Crypto casinos

---

# Design System

Theme:

- Dark mode first
- Information dense
- Minimal distractions

Visual Characteristics:

- Compact layouts
- Large data visibility
- Quantitative focus
- Serious professional appearance

Avoid:

- Excessive whitespace
- Excessive animations
- Confetti
- Gamification
- Achievement systems

---

# Risk Communication Rules

Always show:

- Risk Score
- VaR
- Tail Risk
- Expected Shortfall
- Regime

Before showing:

- Potential Upside
- Best Case Outcomes

Risk always comes first.

---

# AI Commentary Rules

AI commentary exists to explain.

It does not calculate.

It does not predict.

Allowed:

- Explain distributions
- Explain regimes
- Explain risk
- Explain scenarios
- Explain volatility

Forbidden:

- Buy recommendations
- Sell recommendations
- Price targets
- Financial advice
- Future predictions

Bad:

"NVDA should rise."

Good:

"Downside risk remains elevated."

---

# Feature Definitions

## Dashboard

Purpose:

Show portfolio health.

Question:

"What needs attention today?"

---

## Analysis Workspace

Purpose:

Generate risk analysis.

This is the most important feature in OutputLens.

---

## Analysis History

Purpose:

Store historical simulations.

---

## Morning Briefing

Purpose:

Summarise changes since previous session.

Not a news feed.

---

## Risk Pulse

Purpose:

Detect changing risk conditions.

---

## Regime Monitor

Purpose:

Monitor market state changes.

---

## Risk Alerts

Purpose:

Notify when risk thresholds are breached.

---

## Scenario Builder

Purpose:

Create custom stress scenarios.

Scenarios are not forecasts.

---

## Stress Test

Purpose:

Evaluate positions under different market conditions.

---

## VaR Calculator

Purpose:

Standalone risk calculator.

---

## Correlation Scanner

Purpose:

Identify hidden concentration risk.

---

## Position Sizer

Purpose:

Risk-aware position sizing.

Not investment advice.

---

# Subscription Rules

## Free

- 3 analyses per month
- Basic analysis
- Limited history

## Starter

- AI Commentary
- Regime Monitor
- Earnings Risk
- Drawdown Analysis
- Volatility Analysis
- Position Sizer

## Pro

- Correlation Scanner
- Risk Alerts
- Portfolio Analytics
- Exports
- Unlimited History

## Trader

- API Access
- Advanced Monitoring
- Higher Limits

Never expose paid features to lower plans.

Always enforce feature gating.

---

# Technical Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind
- shadcn/ui

## Backend

- Supabase
- PostgreSQL
- Edge Functions

## Authentication

- Supabase Auth
- Google OAuth

## Payments

- Stripe

## Market Data

- Finnhub
- Twelve Data

## AI

- Gemini
- Claude

---

# Engineering Rules

Never:

- Place calculations in React components
- Duplicate business logic
- Bypass feature gating
- Hardcode subscription permissions

Always:

- Use TypeScript
- Reuse existing services
- Keep calculations server-side
- Maintain type safety

---

# Security Rules

Never expose:

- Internal prompts
- Model parameters
- Proprietary calculations
- Secrets
- API keys

Never trust frontend validation.

---

# When Making Product Decisions

Choose the option that:

- Improves risk understanding
- Improves decision quality
- Improves explainability
- Preserves institutional credibility

Reject options that:

- Increase speculation
- Encourage gambling behaviour
- Prioritise excitement over analysis

---

# Final Rule

If uncertain about a change:

Ask:

"Does this help the user understand risk better?"

If not, reconsider the implementation.
