export type BlogLevel = 'Basics' | 'Intermediate' | 'Advanced';

export interface BlogSection {
  heading: string;
  body: string;
  bullets?: string[];
  callout?: { label: string; text: string };
}

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  level: BlogLevel;
  category: string;
  readMinutes: number;
  gradient: string; // tailwind gradient classes for hero card
  icon: string;     // lucide icon name
  kpis?: { label: string; value: string }[];
  sections: BlogSection[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'what-is-investing',
    title: 'What Is Investing? A First-Principles Guide',
    excerpt: 'Why investing exists, how compounding works, and the difference between speculation and ownership.',
    level: 'Basics', category: 'Foundations', readMinutes: 6,
    gradient: 'from-sky-500/30 via-indigo-500/20 to-transparent', icon: 'BookOpen',
    kpis: [{ label: 'Avg. S&P 500 return', value: '~9.8%/yr' }, { label: 'Compounding doubles at', value: '7.2yr @ 10%' }],
    sections: [
      { heading: 'The core idea', body: 'Investing is exchanging present consumption for a claim on future cash flows. You give up money today to own something — a share of a business, a loan, a piece of real estate — that is expected to produce more money later.' },
      { heading: 'Compounding', body: 'Returns earn returns. £1,000 at 10% becomes £2,594 in 10 years and £6,727 in 20. Time is the asymmetric variable most investors underuse.' },
      { heading: 'Speculation vs ownership', body: 'Buying a productive asset is ownership. Betting on a price move with no underlying cash flow is speculation. Both can be rational — but they require different tools.', callout: { label: 'Rule of 72', text: 'Years to double ≈ 72 ÷ annual return %.' } },
    ],
  },
  {
    slug: 'stocks-bonds-cash',
    title: 'Stocks, Bonds & Cash: The Three Building Blocks',
    excerpt: 'How equities, fixed income and cash equivalents behave — and why portfolios usually hold all three.',
    level: 'Basics', category: 'Asset Classes', readMinutes: 7,
    gradient: 'from-emerald-500/30 via-teal-500/20 to-transparent', icon: 'Layers',
    sections: [
      { heading: 'Equities', body: 'A share is partial ownership of a business. You participate in profits via dividends and capital appreciation. Highest long-run return, highest short-term volatility.' },
      { heading: 'Bonds', body: 'A bond is a loan you make to a government or company in exchange for fixed coupons and principal at maturity. Lower expected return, lower volatility, sensitive to interest rates.' },
      { heading: 'Cash & equivalents', body: 'T-bills, money market funds, savings accounts. Near-zero risk of nominal loss but real (inflation-adjusted) losses are common.' },
      { heading: 'Why blend them', body: 'The three asset classes have different return drivers and rarely fall in lockstep. Blending reduces portfolio variance without sacrificing all of the return.' },
    ],
  },
  {
    slug: 'risk-and-return',
    title: 'Risk and Return: They Are Joined at the Hip',
    excerpt: 'No asset offers excess return without excess risk. Learn to identify both before you buy.',
    level: 'Basics', category: 'Risk', readMinutes: 6,
    gradient: 'from-amber-500/30 via-orange-500/20 to-transparent', icon: 'Activity',
    sections: [
      { heading: 'The compensation principle', body: 'Markets price assets so that, in aggregate, expected return rises with expected risk. If something looks like free money, you are probably missing a risk.' },
      { heading: 'Volatility ≠ risk', body: 'Volatility is one measurement of uncertainty. True risk also includes permanent loss, illiquidity, leverage, and tail events that historical volatility cannot capture.' },
      { heading: 'Risk you can take vs need to take', body: 'Capacity, tolerance and need are three different questions. Aligning them is the single most important portfolio decision.' },
    ],
  },
  {
    slug: 'diversification',
    title: 'Diversification, Properly Understood',
    excerpt: 'Not "lots of stocks" — diversification is about combining assets with different return drivers.',
    level: 'Basics', category: 'Portfolio', readMinutes: 7,
    gradient: 'from-violet-500/30 via-purple-500/20 to-transparent', icon: 'Network',
    sections: [
      { heading: 'Correlation is the mechanism', body: 'Two assets that always move together provide no diversification benefit, no matter how many you hold. Diversification comes from combining assets whose correlations are below +1.' },
      { heading: 'The free lunch', body: 'Adding an uncorrelated asset can reduce volatility without reducing expected return — the only "free lunch" in finance.' },
      { heading: 'Diversification fails in crises', body: 'Correlations rise toward 1 in panic markets. Build in tail-risk hedges (puts, gold, long-vol exposure) rather than relying on equity-only diversification.' },
    ],
  },
  {
    slug: 'time-horizon-and-goals',
    title: 'Time Horizon Is Your Most Underrated Edge',
    excerpt: 'Why volatility shrinks (and arithmetic grows) as your horizon extends.',
    level: 'Basics', category: 'Planning', readMinutes: 5,
    gradient: 'from-rose-500/30 via-pink-500/20 to-transparent', icon: 'Clock',
    sections: [
      { heading: 'Annualised volatility scales with √t', body: 'Daily noise dominates short horizons; over years, drift dominates volatility. Patience is mathematical, not just psychological.' },
      { heading: 'Match assets to horizons', body: 'Money you need in 18 months belongs in cash or short-duration bonds. Money you need in 18 years can absorb equity drawdowns.' },
    ],
  },
  {
    slug: 'index-funds-vs-active',
    title: 'Index Funds vs Active Management',
    excerpt: 'The arithmetic of active management — and the small number of cases where active actually works.',
    level: 'Intermediate', category: 'Strategy', readMinutes: 8,
    gradient: 'from-cyan-500/30 via-blue-500/20 to-transparent', icon: 'TrendingUp',
    sections: [
      { heading: 'Sharpe\'s arithmetic', body: 'Before costs, the average active dollar must earn the index return. After costs, it must underperform. That is identity, not opinion.' },
      { heading: 'Where active can win', body: 'Inefficient markets (small caps, emerging debt), capacity-constrained strategies, and skill verified over long enough samples to overcome luck.' },
      { heading: 'Costs compound too', body: 'A 1% fee over 30 years removes roughly a quarter of your terminal wealth. Fees are the most reliable predictor of underperformance.' },
    ],
  },
  {
    slug: 'reading-financial-statements',
    title: 'Reading Financial Statements Without Falling Asleep',
    excerpt: 'The 6 numbers that tell you whether a business is healthy.',
    level: 'Intermediate', category: 'Fundamentals', readMinutes: 9,
    gradient: 'from-lime-500/30 via-green-500/20 to-transparent', icon: 'FileText',
    sections: [
      { heading: 'The income statement', body: 'Revenue → gross profit → operating profit → net income. Each line answers a different question about pricing power, operational efficiency and capital structure.' },
      { heading: 'The balance sheet', body: 'Assets = liabilities + equity. Focus on the composition of liabilities and the quality of intangible assets.' },
      { heading: 'The cash flow statement', body: 'Earnings are an opinion; cash is a fact. Free cash flow is the cleanest measure of value creation.' },
      { heading: 'Six numbers to memorise', body: 'Gross margin, operating margin, return on invested capital, free cash flow yield, net debt / EBITDA, revenue growth.' },
    ],
  },
  {
    slug: 'valuation-basics',
    title: 'Valuation Basics: Price vs Value',
    excerpt: 'DCF, multiples and the most common valuation traps.',
    level: 'Intermediate', category: 'Fundamentals', readMinutes: 9,
    gradient: 'from-fuchsia-500/30 via-pink-500/20 to-transparent', icon: 'Calculator',
    sections: [
      { heading: 'DCF in one paragraph', body: 'A business is worth the present value of the cash it will produce. Project free cash flows, discount them at the cost of capital, add a terminal value.' },
      { heading: 'Multiples are shortcuts', body: 'P/E, EV/EBITDA, P/B compress a DCF into a ratio. They work when the comparable peer set is genuinely comparable — rarely true in practice.' },
      { heading: 'The biggest valuation trap', body: 'Anchoring on past multiples. A cyclical at 8× earnings at the peak is more dangerous than a compounder at 25× during a downturn.' },
    ],
  },
  {
    slug: 'technical-analysis-honest-look',
    title: 'Technical Analysis: An Honest Look',
    excerpt: 'Where price patterns add value, where they add noise, and how to test the difference.',
    level: 'Intermediate', category: 'Trading', readMinutes: 7,
    gradient: 'from-orange-500/30 via-red-500/20 to-transparent', icon: 'LineChart',
    sections: [
      { heading: 'Trend, range, breakout', body: 'Three regimes describe almost all price action. Your edge is not predicting the regime but having a plan for each.' },
      { heading: 'Indicators are derivatives of price', body: 'RSI, MACD, moving averages are all mathematical transforms of OHLC data. They cannot contain information that is not in price.' },
      { heading: 'Always backtest', body: 'A pattern that "looks predictive" needs out-of-sample evidence. Without it, you are pattern-matching on noise.' },
    ],
  },
  {
    slug: 'options-101',
    title: 'Options 101: Calls, Puts and Asymmetric Payoffs',
    excerpt: 'How options work, why they are priced the way they are, and the four core positions.',
    level: 'Intermediate', category: 'Derivatives', readMinutes: 10,
    gradient: 'from-indigo-500/30 via-violet-500/20 to-transparent', icon: 'GitBranch',
    sections: [
      { heading: 'Calls and puts', body: 'A call gives you the right (not obligation) to buy at a strike. A put gives you the right to sell. The seller takes the opposite obligation in exchange for premium.' },
      { heading: 'Why options have time value', body: 'More time → more uncertainty → more potential to finish in the money. Time value decays non-linearly toward expiry (theta).' },
      { heading: 'The four base positions', body: 'Long call (bullish), long put (bearish hedge), short put (income / be willing to own), short call (capped income). Every strategy is a combination of these.' },
    ],
  },
  {
    slug: 'position-sizing-and-kelly',
    title: 'Position Sizing: Survive First, Compound Second',
    excerpt: 'Why how much you bet matters more than what you bet on. A practical look at Kelly and fractional Kelly.',
    level: 'Advanced', category: 'Risk', readMinutes: 8,
    gradient: 'from-red-500/30 via-rose-500/20 to-transparent', icon: 'Scale',
    kpis: [{ label: 'Full Kelly bias', value: 'Maximum geometric growth' }, { label: 'Half Kelly', value: '75% growth, 50% vol' }],
    sections: [
      { heading: 'The asymmetry of drawdowns', body: 'A 50% loss requires a 100% gain to recover. Position sizing is the discipline that keeps drawdowns survivable.' },
      { heading: 'Kelly formula', body: 'f* = (bp − q) / b. Solve for the fraction of capital that maximises long-run geometric growth. Pure Kelly is too aggressive in practice because edge is overestimated.' },
      { heading: 'Why most pros use fractional Kelly', body: 'Halving Kelly retains ~75% of expected growth while halving volatility — a much better risk-adjusted ride.' },
    ],
  },
  {
    slug: 'value-at-risk',
    title: 'Value at Risk (VaR): What It Tells You and What It Hides',
    excerpt: 'The standard institutional risk metric — its strengths, weaknesses, and what to use alongside it.',
    level: 'Advanced', category: 'Risk', readMinutes: 8,
    gradient: 'from-amber-500/30 via-yellow-500/20 to-transparent', icon: 'ShieldAlert',
    sections: [
      { heading: 'What VaR is', body: '95% 1-day VaR of £10,000 means: 95% of days you will lose less than £10,000. It does NOT bound the worst 5%.' },
      { heading: 'Three calculation methods', body: 'Historical (use realised distribution), parametric (assume normality), Monte Carlo (simulate). Each makes different assumptions about tails.' },
      { heading: 'What VaR hides', body: 'The size of the tail. CVaR (expected shortfall) answers "when I exceed VaR, how bad on average?" Always report both.' },
    ],
  },
  {
    slug: 'monte-carlo-simulation',
    title: 'Monte Carlo Simulation for Traders',
    excerpt: 'Why simulating 10,000 futures beats predicting one — and how to do it without lying to yourself.',
    level: 'Advanced', category: 'Quant', readMinutes: 9,
    gradient: 'from-blue-500/30 via-indigo-500/20 to-transparent', icon: 'Sparkles',
    sections: [
      { heading: 'The setup', body: 'Pick a price process (GBM, GARCH, regime-switching). Sample thousands of paths. Aggregate to a distribution of outcomes. Decide based on the distribution, not a single number.' },
      { heading: 'Common mistakes', body: 'Calibrating volatility on a calm window. Ignoring fat tails. Using independent draws when correlations matter. Garbage in, distribution-of-garbage out.' },
      { heading: 'What it lets you say', body: '"There is a 12% probability of a 20%+ drawdown over my horizon." That is a sentence you can build risk policy around.' },
    ],
  },
  {
    slug: 'regime-switching',
    title: 'Market Regimes: Calm, Trending, Crisis',
    excerpt: 'Why a single volatility number lies, and how regime-switching models capture what actually happens.',
    level: 'Advanced', category: 'Quant', readMinutes: 8,
    gradient: 'from-teal-500/30 via-cyan-500/20 to-transparent', icon: 'Radio',
    sections: [
      { heading: 'Markets are not stationary', body: 'Volatility clusters. Trends persist then reverse. A 30-day historical vol is a blend that fits no specific regime.' },
      { heading: 'Hidden Markov Models', body: 'HMMs estimate a discrete latent state (e.g. calm / trending / crisis) and the transition probabilities between them. Risk metrics conditioned on the current regime are far more honest than unconditional ones.' },
      { heading: 'Practical use', body: 'Size down when regime probability shifts toward crisis. Many "alpha" strategies are simply regime detectors in disguise.' },
    ],
  },
  {
    slug: 'factor-investing',
    title: 'Factor Investing: The Sources of Equity Returns',
    excerpt: 'Value, momentum, size, quality, low-vol — what the academic factors are and how they behave.',
    level: 'Advanced', category: 'Strategy', readMinutes: 9,
    gradient: 'from-purple-500/30 via-fuchsia-500/20 to-transparent', icon: 'Grid3x3',
    sections: [
      { heading: 'The factor zoo', body: 'Decades of academic research isolated a handful of premia that explain most of the cross-section of equity returns: value, momentum, size, profitability, low-vol.' },
      { heading: 'Why they persist', body: 'Some are compensation for risk (value in deep recessions). Some are behavioural (momentum). Pure data-mining factors die out of sample.' },
      { heading: 'Combining factors', body: 'Factors have low correlations with each other. A multi-factor portfolio is more robust than any single tilt.' },
    ],
  },
  {
    slug: 'macro-and-the-cycle',
    title: 'Macro for Traders: The Cycle in 4 Quadrants',
    excerpt: 'Growth up/down × inflation up/down. Asset performance is dramatically different in each.',
    level: 'Advanced', category: 'Macro', readMinutes: 8,
    gradient: 'from-yellow-500/30 via-amber-500/20 to-transparent', icon: 'Globe',
    sections: [
      { heading: 'The four quadrants', body: 'Reflation (growth↑ inflation↓), overheat (growth↑ inflation↑), stagflation (growth↓ inflation↑), deflation (growth↓ inflation↓). Each favours different assets.' },
      { heading: 'Mapping assets', body: 'Equities love reflation. Commodities love overheat. Gold and TIPS love stagflation. Long-duration bonds love deflation. All-weather portfolios hold all four sleeves.' },
    ],
  },
  {
    slug: 'behavioural-biases',
    title: 'The Behavioural Biases That Cost You Money',
    excerpt: 'Loss aversion, recency, overconfidence, confirmation. The biggest edge is not having these.',
    level: 'Intermediate', category: 'Psychology', readMinutes: 7,
    gradient: 'from-pink-500/30 via-rose-500/20 to-transparent', icon: 'Brain',
    sections: [
      { heading: 'Loss aversion', body: 'Losses hurt ~2× as much as equivalent gains feel good. This causes premature profit-taking and stubborn loss-holding.' },
      { heading: 'Recency bias', body: 'You overweight recent experience. The asset that just went up feels safest — exactly when it is most expensive.' },
      { heading: 'Process beats willpower', body: 'Pre-commit rules (stop-losses, rebalancing thresholds, position-sizing formulas) so that decisions happen before emotion arrives.' },
    ],
  },
  {
    slug: 'crypto-without-the-hype',
    title: 'Crypto Without the Hype',
    excerpt: 'What digital assets actually are, why volatility is structurally high, and how to size them.',
    level: 'Intermediate', category: 'Crypto', readMinutes: 8,
    gradient: 'from-orange-500/30 via-amber-500/20 to-transparent', icon: 'Bitcoin',
    sections: [
      { heading: 'What you actually own', body: 'A cryptographic claim recorded on a public ledger. No cash flows, no enforceable rights — value derives entirely from network adoption and protocol design.' },
      { heading: 'Why volatility is structural', body: 'Thin order books, 24/7 trading, leverage, retail-driven flows, no circuit breakers. Expect ±70% annualised volatility on majors.' },
      { heading: 'Sizing', body: 'Apply the same Kelly / VaR discipline you would to any asset. A 70% drawdown is a base-rate event, not a tail.' },
    ],
  },
  {
    slug: 'tail-hedging',
    title: 'Tail Hedging: Insurance for Black Swans',
    excerpt: 'Why a small, persistent bleed can save your portfolio in the crashes that matter.',
    level: 'Advanced', category: 'Risk', readMinutes: 8,
    gradient: 'from-slate-500/30 via-zinc-500/20 to-transparent', icon: 'Umbrella',
    sections: [
      { heading: 'The convexity argument', body: 'Out-of-the-money puts lose a little 95% of the time and gain enormously in the 5%. Their expected payoff over full cycles can be positive once you account for forced-selling avoidance.' },
      { heading: 'Sizing the hedge', body: 'Allocate enough premium to materially offset a 30% drawdown but little enough that the bleed in calm years is tolerable. Typically 0.5–2% of NAV per year.' },
      { heading: 'Alternatives to puts', body: 'Long volatility, trend-following, gold, long-duration treasuries — different hedges work for different crisis types.' },
    ],
  },
  {
    slug: 'building-a-quant-workflow',
    title: 'Building Your Own Quant Workflow',
    excerpt: 'Hypothesis → data → model → backtest → walk-forward → live. The discipline that separates pros from gamblers.',
    level: 'Advanced', category: 'Quant', readMinutes: 10,
    gradient: 'from-emerald-500/30 via-green-500/20 to-transparent', icon: 'Workflow',
    sections: [
      { heading: 'Start with a hypothesis', body: 'Why should this work? Risk premium? Behavioural anomaly? Microstructure? If you cannot articulate the source of edge, you do not have one.' },
      { heading: 'Clean data is half the job', body: 'Survivorship bias, look-ahead bias, point-in-time fundamentals. Most "alphas" disappear once data is properly aligned.' },
      { heading: 'Walk-forward, not in-sample', body: 'Optimise on a window, test on the next, roll. The only honest test of whether your model survives regime change.' },
      { heading: 'Live trading is a different beast', body: 'Slippage, capacity, fees, gap risk. Always start at 10% of intended size and scale only after live performance matches paper.' },
    ],
  },
];

export const BLOG_CATEGORIES = Array.from(new Set(BLOG_ARTICLES.map(a => a.category)));
export const BLOG_LEVELS: BlogLevel[] = ['Basics', 'Intermediate', 'Advanced'];

export function getArticle(slug: string) {
  return BLOG_ARTICLES.find(a => a.slug === slug);
}