# CLAUDE.md

# OutputLens Agent Operating Manual

Version: 1.0

This document provides context, rules, architecture guidance, product philosophy, UX standards, and implementation constraints for AI agents working on OutputLens.

Read this file before making any code, product, UX, architecture, copywriting, database, or business logic decisions.

---

# Product Overview

OutputLens is an institutional-grade risk intelligence platform.

The platform helps investors understand uncertainty before entering trades.

OutputLens does not attempt to predict markets.

OutputLens does not provide investment advice.

OutputLens does not generate buy or sell signals.

OutputLens quantifies potential outcomes and presents them through probability distributions, risk metrics, scenario analysis, and AI-assisted explanations.

The central product experience is analysis.

Everything else exists to support, enhance, monitor, or explain analysis.

---

# Core Mission

Help investors think like risk managers.

Most retail platforms encourage prediction.

OutputLens encourages probability-based decision making.

Every feature should improve one or more of:

- Risk understanding
- Decision quality
- Probability awareness
- Portfolio awareness
- Uncertainty management

If a proposed feature does not improve one of these areas, reconsider whether it belongs in the product.

---

# Core Philosophy

## Probability Over Prediction

OutputLens answers:

"What could happen?"

OutputLens does not answer:

"What will happen?"

Never present outputs as forecasts.

Never imply certainty.

Never imply future price direction.

---

## Risk Before Return

Risk information should always appear before upside information.

Priority order:

1. Risk Score
2. VaR
3. Expected Shortfall
4. Tail Risk
5. Regime
6. Scenario Outcomes
7. Potential Upside

---

## Explain Complexity Simply

Sophisticated quantitative outputs should be translated into plain English.

Users should not need a finance degree to understand results.

Complexity belongs in calculations, not explanations.

---

## Institutional Tone

OutputLens should feel:

- Professional
- Analytical
- Calm
- Quantitative
- Objective

Avoid:

- Hype
- Social trading language
- Meme investing
- Gambling terminology
- Emotional copy

Think:

- Bloomberg Terminal
- FactSet
- BlackRock Aladdin
- Institutional research reports

Not:

- Robinhood
- Crypto casinos
- Social trading apps

---

# Product Structure

OutputLens consists of the following major product areas.

---

## Dashboard

Purpose:

Provide a high-level overview of portfolio health.

Primary Components:

- Portfolio Risk Score
- Portfolio VaR
- Expected Drawdown
- Market Regime
- Risk Alerts
- Analysis Usage
- AI Insights
- Watchlist
- Market Snapshot

Dashboard Question:

"What requires attention today?"

---

## Analysis Workspace

Core product.

Users enter:

- Asset
- Direction
- Position Size
- Time Horizon

Output:

- Simulation Results
- Risk Metrics
- Scenario Analysis
- Regime Analysis
- Distribution Analysis
- AI Commentary

The Analysis Workspace is the highest-priority feature in the entire platform.

Protect this workflow.

---

## Analysis History

Stores previous analyses.

Purpose:

Track risk evolution over time.

Must support:

- Historical comparison
- Performance tracking
- Distribution review

---

## Portfolio Analysis

Portfolio-level aggregation of:

- Risk
- Exposure
- Correlation
- Concentration
- Scenario sensitivity

---

## Morning Briefing

Daily summary of:

- Risk changes
- Regime changes
- Portfolio health
- Important observations

Morning Briefing is not a news feed.

---

## Risk Journal

Historical archive of:

- Analyses
- Decisions
- Risk observations

---

## Risk Pulse

Live monitoring layer.

Tracks:

- Risk score changes
- Regime shifts
- Tail risk changes

Purpose:

Detect deteriorating conditions.

---

## Regime Monitor

Tracks market state transitions.

Purpose:

Identify changing market environments.

---

## Risk Alerts

User-defined monitoring system.

Triggers when:

- Risk exceeds thresholds
- Regime changes occur
- Correlation spikes emerge

---

## Scenario Builder

Allows users to create stress scenarios.

Scenarios are stress tests.

Scenarios are not predictions.

---

## Stress Test Workspace

Runs positions against:

- Bull environments
- Base environments
- Bear environments
- Custom shock events

---

## VaR Calculator

Calculates:

- Parametric VaR
- Historical VaR
- Monte Carlo VaR

---

## Correlation Scanner

Identifies:

- Hidden concentration risk
- Portfolio overlap
- Diversification quality

---

## Market Heatmap

Provides broad market context.

Purpose:

Context only.

Not a signal engine.

---

## Position Sizer

Provides risk-based sizing calculations.

Purpose:

Risk management.

Not trade recommendations.

---

## Earnings Risk

Evaluates historical earnings-event volatility.

Purpose:

Understand event risk.

---

## Volatility Analysis

Evaluates:

- Historical volatility
- Regime volatility
- Relative volatility

---

## Drawdown Analysis

Evaluates:

- Historical drawdowns
- Recovery periods
- Underwater duration

---

# Analysis Pipeline

All analysis follows the same lifecycle.

1. User submits analysis.
2. Market data retrieved.
3. Risk engine processes inputs.
4. Simulations generated.
5. Distribution constructed.
6. Risk metrics calculated.
7. Regime evaluated.
8. Scenarios generated.
9. AI commentary generated.
10. Results persisted.
11. Dashboard updated.

No workflow should bypass this pipeline.

---

# Risk Metrics

## Win Probability

Percentage of simulated paths ending positive.

Not a prediction.

Not a guarantee.

---

## Value at Risk (VaR)

Estimated maximum expected loss within a specified confidence interval.

Examples:

- VaR 90
- VaR 95
- VaR 99

---

## Expected Shortfall

Average loss beyond the VaR threshold.

Represents severe downside exposure.

---

## Tail Risk

Probability of extreme negative outcomes.

Higher tail risk requires greater caution.

---

## Risk Score

Composite indicator.

Used for ranking and monitoring.

Must never be described as expected return.

---

## Regime

Current market condition classification.

Examples:

- Bullish
- Bearish
- Transitional
- Elevated Volatility

Regimes are probabilities.

Not forecasts.

---

# AI Commentary Rules

AI commentary exists to explain.

AI commentary does not calculate.

The risk engine is the source of truth.

---

## Allowed

AI may:

- Explain risk metrics
- Explain distributions
- Explain scenarios
- Explain volatility
- Explain regime conditions
- Summarise portfolio risk
- Highlight changes

---

## Forbidden

AI must never:

- Predict future prices
- Recommend trades
- Recommend buying
- Recommend selling
- Recommend leverage
- Provide financial advice
- Guarantee outcomes

---

## Bad Examples

"AMZN will likely rise."

"This stock should outperform."

"Buy this position."

"Target price is $250."

---

## Good Examples

"Downside risk remains elevated."

"The distribution suggests wider uncertainty."

"Tail exposure has increased."

"The current regime implies increased volatility."

---

# Subscription Tiers

## Free

Includes:

- 3 analyses per month
- Limited simulation access
- Basic risk metrics
- 7-day history
- US market support

---

## Starter

Includes:

- Expanded analysis limits
- AI commentary
- Regime Monitor
- Earnings Risk
- Drawdown Analysis
- Volatility Analysis
- Position Sizer

---

## Pro

Includes:

- Correlation Scanner
- Risk Alerts
- Portfolio Analytics
- Unlimited History
- Export Features

---

## Trader

Includes:

- API Access
- Advanced Monitoring
- Larger Portfolio Limits
- Priority Processing

---

# Engineering Rules

## Business Logic

Never place business logic inside React components.

Use:

- Services
- Hooks
- Utility layers
- Backend functions

---

## Source of Truth

Risk calculations are authoritative.

AI commentary is secondary.

Visualisations are derived.

---

## Determinism

Prefer deterministic outputs whenever possible.

Avoid hidden behaviour.

Avoid unexplained scores.

---

## Data Handling

Cache market data.

Reduce redundant API requests.

Prioritise performance and consistency.

---

## Security

Never expose:

- Internal model parameters
- API secrets
- Proprietary calculations
- Internal confidence thresholds

---

# UX Rules

Always communicate:

- Probability
- Risk
- Uncertainty
- Distribution

Avoid:

- Certainty
- Forecasting
- Target prices
- Trading signals

---

# Design Principles

OutputLens should feel:

- Institutional
- Premium
- Quantitative
- Professional

Design should be:

- Information dense
- Data focused
- Low distraction
- Dark-theme friendly

Avoid:

- Excessive animation
- Gamification
- Celebration effects
- Social features

---

# Future Feature Evaluation

Before building a feature ask:

1. Does it improve risk understanding?
2. Does it improve decision quality?
3. Does it increase probability awareness?
4. Does it align with probability-first thinking?
5. Does it avoid prediction-based behaviour?

If any answer is no, reconsider the feature.

---

# Agent Decision Framework

When uncertain:

Choose the option that:

- Improves risk visibility
- Improves explainability
- Improves decision support
- Reduces ambiguity
- Preserves institutional credibility

Never choose the option that:

- Increases speculation
- Encourages gambling behaviour
- Prioritises excitement over accuracy
- Mimics retail trading apps

---

# Internal Motto

The market is not a prediction problem.

It is a probability distribution.

Everything in OutputLens should reinforce that idea.
