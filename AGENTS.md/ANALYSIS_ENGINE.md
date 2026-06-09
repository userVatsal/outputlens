# ANALYSIS_ENGINE.md

# OutputLens Analysis Engine

## Purpose

The Analysis Engine is the core intellectual property of OutputLens.

Its purpose is to transform market inputs into probability distributions and risk outputs.

---

## Inputs

Required:

- Asset
- Direction
- Position Size
- Horizon

Optional:

- Portfolio Context
- Custom Scenarios
- Stress Parameters

---

## Outputs

Must generate:

- Distribution
- Win Probability
- VaR
- Expected Shortfall
- Risk Score
- Regime Classification
- Scenario Probabilities

---

## Rules

The engine calculates.

AI explains.

The AI layer must never generate calculations.

---

## Architecture

Market Data
↓
Analysis Engine
↓
Risk Metrics
↓
Scenario Generation
↓
Persistence
↓
AI Commentary

---

## Source of Truth

The Analysis Engine is authoritative.

Frontend displays results.

AI explains results.

Neither may override the engine.

---

## Forbidden

Never:

- Predict future prices
- Generate target prices
- Generate trade recommendations

Output probabilities only.
