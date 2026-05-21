# OutputLens Psychology-Driven Redesign

A full visual + behavioural rebuild applying loss aversion, social proof, anchoring, reciprocity, and peak-end across the design system, landing, signup, pricing, and dashboard.

---

## Phase 1 — Design system foundation
Rewrite `src/index.css` + `tailwind.config.ts` + `index.html` fonts.

- **Palette** (dark-first, semantic tokens in HSL):
  - bg `#0A0C10`, surface `#0F1117`, elevated `#161B24`
  - primary cyan `#00D4FF` (CTAs/active only)
  - violet `#7B61FF` (AI/model badges), green `#00C896` (upside), amber `#F5A623` (warn), red `#E84545` (loss/tail)
  - text `#F0F4FF` / `#8B96A8`
- **Fonts**: Sora 700/800 (display), DM Sans 400/500/600 (UI), JetBrains Mono tabular-nums (data)
- **Type scale utilities**: `.text-display`, `.text-data-lg`, `.text-data-sm`, `.text-label` (11px +1px tracking uppercase)
- **Components**: `.btn-primary` (cyan + glow-pulse on idle), `.surface`, `.surface-elevated`, `.kpi-number`, `.live-dot` (pulsing cyan), `.glow-ring`
- **Motion**: keyframes for `glow-pulse`, `count-up`, `path-draw`, `reveal-blur`, `stagger-up`. Replace warm orb gradient with restrained grid-bg.

## Phase 2 — Landing page (`src/pages/Landing.tsx` + components)
Rebuild around reciprocity-first flow.

- Hero (staggered 0/100/200/400/600/800/1200ms):
  - Eyebrow label "AI-POWERED RISK INTELLIGENCE"
  - H1: "The market is a distribution. Your model should be too." (Sora 800, -2px)
  - Sub: distribution-not-forecast paragraph
  - **Ticker input + "Run Free Simulation →"** (no signup; runs 100 paths locally via existing engine)
  - Microcopy: "2,400+ analysts already running simulations"
- Live Monte Carlo fan chart in hero — paths draw left→right (existing `ReturnDistributionChart` adapted, 200 paths, 2ms stagger, percentile band fill, median line last)
- Stats bar (count-up on scroll): 10,000 / 2,400+ / 94.7% / <0.3s
- Loss-aversion section: tail scenarios shown FIRST with red accents
- Authority strip: "Black-Scholes-Merton · GBM · GARCH · HMM · Heston" + "How we calculate ↗"
- Testimonials with role + firm type structure
- `LiveActivityToast` component (bottom-left, 45–90s randomised, real-looking names, role, time)
- Single primary CTA throughout: "Analyse a Position Free"

## Phase 3 — Partial-reveal → signup flow
- After hero ticker run: show fan chart with blurred P25/P75 tails + overlay card "Your full distribution is ready" listing locked features → CTA "Unlock Full Analysis — Free"
- `src/pages/Auth.tsx` rebuilt as 2-step:
  - Step 1: email only, progress `●●○`, "No card required..."
  - Step 2: role dropdown (PM/Risk/Quant/Trader/Other) + password, CTA "Complete Setup & See My Results →"
- New `src/pages/Welcome.tsx` (peak-end confirmation): full-screen dark, cyan glow, counter 0→10,000 in 2.2s, then "Distribution complete. You now see [TICKER] as a probability distribution, not a consensus estimate." → auto-redirect dashboard 3s

## Phase 4 — Pricing (`src/pages/Pricing.tsx`)
- Order: **Institutional → Desk → Analyst** (anchor high)
- Annual toggle DEFAULT with "Save 30%" badge, monthly shows "Only £X/day"
- Bloomberg comparison line: "Bloomberg Terminal: £24,000/yr. OutputLens Institutional: £X/yr."
- Objection-killer strip below plans (5 bullets incl. refund guarantee)
- CTAs: "Talk to Us", "Start Quantifying Risk", "Analyse Free for 14 Days"

## Phase 5 — Dashboard empty state (`src/pages/Dashboard.tsx`)
- First-run: hide sidebar, center single input "What position do you want to quantify?", suggested tickers chips, CTA "Run 10,000 Simulations →", microcopy "Your first simulation is free. Always."
- Populated state: streak badge "N-day analysis streak 🔥", "New signal detected" badge, "Run New Simulation" primary
- KPI cards use JetBrains Mono tabular-nums; red worst-case loss remains hero metric

## Phase 6 — Cross-cutting copy + components
- Replace all generic CTAs ("Get Started", "Learn More", "Sign Up", "Try Free") with the approved list
- `<DataFreshness />` "Updated HH:MM UTC" on every live data block
- `<MethodologyLink />` "How we calculate this ↗" near every stat
- Header/Footer restyled to dark system; remove warm gradient + FloatingOrbs + GlobeGraphic (keep files, unused)

---

## Technical notes
- All colour via HSL semantic tokens in `index.css`; no raw hex in components
- Free hero simulation: reuse `src/lib/engine/stochastic/gbm.ts` client-side with mocked drift/vol so no API/auth needed
- `LiveActivityToast`: static name pool + randomised time strings; mounted once in `Layout`
- Count-up + path-draw use IntersectionObserver + requestAnimationFrame (no new deps)
- Email sequence + streak emails: out of scope this pass (frontend only)
- Files touched (new): `LiveActivityToast.tsx`, `MonteCarloHero.tsx`, `StatsBar.tsx`, `BlurredRevealOverlay.tsx`, `Welcome.tsx`, `MethodologyLink.tsx`, `DataFreshness.tsx`
- Files rewritten: `index.css`, `tailwind.config.ts`, `index.html`, `Landing.tsx`, `Auth.tsx`, `Pricing.tsx`, `Dashboard.tsx`, `Header.tsx`, `Footer.tsx`
