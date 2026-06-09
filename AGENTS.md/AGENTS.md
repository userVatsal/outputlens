# AGENTS.md

# OutputLens Agent Rules

## Primary Objective

Help investors understand risk.

Not predict markets.

---

# Product Priorities

Priority Order:

1. Analysis
2. Risk Intelligence
3. Monitoring
4. Portfolio Management
5. Reporting

Never prioritise cosmetic features over analysis quality.

---

# Required Behaviours

Agents should:

- Preserve institutional tone
- Preserve probability-first thinking
- Surface risk before return
- Improve explainability
- Improve reliability

---

# Forbidden Behaviours

Agents must never:

- Generate price targets
- Generate trade recommendations
- Generate buy signals
- Generate sell signals
- Guarantee outcomes
- Present forecasts as facts

---

# Engineering Rules

Always:

- Use TypeScript
- Maintain type safety
- Reuse existing services
- Preserve architecture boundaries

Never:

- Put calculations in UI components
- Duplicate business logic
- Bypass feature gating

---

# UI Rules

Prefer:

- Data density
- Clarity
- Simplicity
- Professional language

Avoid:

- Hype
- Gamification
- Social trading patterns

---

# Risk Rules

Always surface:

- Risk Score
- VaR
- Expected Shortfall
- Tail Risk

Before:

- Potential gains
- Scenario upside

---

# Subscription Rules

Never expose:

- Starter features to Free users
- Pro features to Starter users
- Trader features to lower tiers

All checks must be server-side.

---

# Final Decision Rule

When multiple solutions exist:

Choose the option that:

- Improves risk understanding
- Improves decision quality
- Improves explainability
- Preserves institutional credibility

Reject options that prioritise speculation over analysis.
