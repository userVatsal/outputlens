# OutputLens

Probabilistic risk intelligence for traders and analysts who reject point forecasts.

**The market is a distribution. Trade it like one.**

OutputLens runs 10,000 Monte Carlo simulations on any asset and returns a full probability distribution of outcomes — VaR 95%, CVaR, percentile bands, regime-adjusted volatility. Not a forecast. Not a prediction. A distribution.

---

## Architecture — Three-Layer Intelligence

1. **Layer 1 — Deterministic Math (core IP).** GBM, GARCH, jump-diffusion, Hidden Markov regime detection. Lives in `src/lib/engine/`.
2. **Layer 2 — Statistical Adaptation.** Neural database (8-dim embeddings, k-NN cosine similarity), live volatility calibration, regime-aware path generation.
3. **Layer 3 — AI Interpretation.** Plain-English commentary on the distribution shape. Strictly constrained to never predict prices or direction.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- **State / data:** React Query, custom hooks, shared `AuthContext`
- **Backend:** Lovable Cloud (Supabase) — Postgres + RLS, Edge Functions (Deno)
- **Payments:** Stripe (Starter $12 / Pro $29 / Trader $79)
- **Market data:** Finnhub + Twelve Data with TTL-cached `market_data_cache` table
- **AI:** Lovable AI Gateway (Gemini for analysis, Claude Haiku for the MCP agent)
- **Auth:** Supabase Auth with Google OAuth; roles in `user_roles` (separate from `profiles`)

## Edge Functions

| Function | Purpose |
| -- | -- |
| `analyze-asset-enhanced` | Full single-asset Monte Carlo + regime + AI interpretation |
| `analyze-trade` | Trade-level risk analysis with position economics |
| `check-subscription` | Stripe + DB plan resolution (cached via React Query) |
| `create-checkout` / `customer-portal` | Stripe subscription flow |
| `fetch-market-data` | TTL-cached quote + history + volatility |
| `monitor-assets` | Scheduled tracked-asset risk-delta alerts |
| `run-agent-pipeline` | Sentiment + news + social aggregation |

See `supabase/functions/` for the full list.

## Local development

```bash
bun install
bun run dev
```

Tests:

```bash
bunx vitest run
```

The project is managed via Lovable. Code is also synced to GitHub for parallel local development.

## Production

- Custom domain: [outputlens.com](https://outputlens.com)
- Deploy: pushed via Lovable; preview at the Lovable preview URL
