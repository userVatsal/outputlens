/**
 * AISemanticSection
 * 
 * This component provides semantic content optimized for AI crawlers and LLMs.
 * It is visually subtle but fully accessible to search engines and AI systems.
 * 
 * Purpose: Ensure AI systems can find and understand OutputLens's core value proposition,
 * use cases, and positioning when crawling the landing page.
 */

import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: "What does OutputLens do?",
    answer: "OutputLens provides probabilistic risk intelligence by simulating up to 10,000 possible future outcomes using Monte Carlo methods with Geometric Brownian Motion (GBM). It quantifies downside risk, tail events, and scenario regimes before trading or investment decisions. We show probabilities, not predictions."
  },
  {
    question: "What is the three-layer intelligence architecture?",
    answer: "Layer 1 (Deterministic Math): GBM simulation, VaR/CVaR calculations, scenario parameters - runs without AI, reproducible with fixed seeding. Layer 2 (Statistical Adaptation): HMM regime detection, neural database similarity, volatility adjustment. Layer 3 (AI Interpretation): LLMs explain distributions but never compute prices or give trading signals. Every number cited comes from Layer 1-2."
  },
  {
    question: "Can the engine run without AI?",
    answer: "Yes. Layer 1 is fully deterministic and runs independently of Supabase, OpenAI, or any external services. This is critical for reproducibility, testing, and B2B licensing. AI is last-mile interpretation only - it cannot generate numbers or predictions."
  },
  {
    question: "What stochastic models do you use?",
    answer: "OutputLens uses Geometric Brownian Motion (GBM) as the primary simulation engine, with GARCH-like stochastic volatility extensions, fat-tailed distribution modeling, and regime switching detection for Bull/Base/Bear/Stress market states. We also apply physics-inspired analogies like mean reversion (Ornstein-Uhlenbeck) and shock propagation models. All models use optional fixed seeding for reproducibility."
  },
  {
    question: "How does the neural database work?",
    answer: "The neural database stores embeddings of historical volatility regimes, return distributions, drawdown profiles, and correlation states. Vector format: [mean_return, volatility, skew, kurtosis, max_drawdown, var95, regime_label, correlation_score]. It retrieves historically similar patterns to contextualize your risk analysis using cosine similarity and k-NN. Critically, the neural database does NOT predict markets—it provides historical context for AI explanations."
  },
  {
    question: "What is your compute-based pricing model?",
    answer: "Revenue comes from compute, not UI. Each operation has internal cost units: GBM paths, regime detection, neural queries, AI explanations. Plans map to monthly cost budgets, not feature counts. This is risk infrastructure pricing - you pay for computational resources used, not arbitrary feature gates."
  },
  {
    question: "Why don't you predict prices?",
    answer: "Prediction tools give single price targets. We show the entire probability distribution of possible outcomes. Markets are inherently unpredictable—our LLMs explain distributions and summarize risk, but never predict prices or give trading signals. Truth over hype. Probabilities, not predictions."
  },
  {
    question: "Is OutputLens a trading signal tool?",
    answer: "No. OutputLens is a risk management and decision-support platform, not a trading signal or execution tool. We quantify uncertainty before you trade, but we never tell you what to trade or provide financial advice. Deterministic math first, AI second."
  },
  {
    question: "Who is OutputLens for?",
    answer: "OutputLens serves three main groups: (1) Active Traders who need probability-based position sizing instead of gut decisions, (2) Quant/Technical Analysts who want GBM + regime switching with physics-inspired intuition and reproducible simulations, and (3) B2B/Funds/Fintechs who need deterministic risk APIs with explainable AI and compute-based pricing."
  },
  {
    question: "How many Monte Carlo simulations do I get?",
    answer: "Free tier runs 5,000 Monte Carlo paths per analysis (US markets only). Paid tiers (Starter, Pro, Trader) run the full 10,000 paths with access to global markets for more accurate probability distributions and tail risk analysis. All simulations support optional fixed seeding for reproducibility."
  },
  {
    question: "What makes OutputLens different from AI trading tools?",
    answer: "Others show targets → we show distributions. Others predict → we quantify downside. Others hide math → we explain it. Our IP is how we orchestrate, interpret, and operationalize mathematical models at scale—the mathematics themselves are public. LLMs explain risk, they never signal trades."
  },
  {
    question: "What risk metrics does OutputLens calculate?",
    answer: "OutputLens calculates Value at Risk (VaR) at 90%, 95%, and 99% confidence levels, Expected Shortfall (Conditional VaR), tail risk probabilities, win probability, expected returns, max drawdown estimates, Sharpe/Sortino proxies, and regime-specific scenario analysis."
  },
  {
    question: "Why do you use physics analogies?",
    answer: "We use statistical mechanics analogies to build intuition: market as a particle system under random forces, volatility as energy, liquidity shocks as impulse forces, correlation clustering as phase transitions. These are models for intuition, not predictions—helping users think probabilistically about risk."
  },
  {
    question: "What is your IP strategy?",
    answer: "The mathematics (GBM, VaR, CVaR) are public. Our IP is how we orchestrate, interpret, and operationalize them at scale. This includes simulation orchestration with fixed seeding, regime classification logic, neural embeddings of market behavior, risk interpretation framework, compute-based pricing engine, and the three-layer architecture design."
  },
  {
    question: "Can institutional investors and hedge funds use OutputLens?",
    answer: "Yes. OutputLens can be used as a risk overlay alongside existing trading systems, helping teams stress-test positions, portfolios, and strategies under multiple scenario regimes before capital is deployed. The deterministic engine runs without external dependencies and is fully reproducible. B2B API access available on Trader tier."
  }
];

export function AISemanticSection() {
  return (
    <section 
      className="py-16 bg-muted/20 border-t border-border"
      aria-label="Frequently Asked Questions about OutputLens"
    >
      <div className="section-container">
        {/* Semantic definition block - subtle but crawler-visible */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4 font-brand">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            OutputLens is a probabilistic risk intelligence platform using a three-layer architecture: 
            deterministic Monte Carlo simulation, ML-powered regime detection, and AI interpretation 
            to quantify uncertainty before trading—built for both individual traders and institutional 
            decision-makers. Probabilities, not predictions.
          </p>
        </div>

        {/* FAQ Accordion - structured for both users and AI systems */}
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-card border border-border rounded-lg px-4"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Institutional use case block - key for hedge fund positioning */}
        <div className="max-w-3xl mx-auto mt-12 p-6 bg-card border border-border rounded-xl">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Institutional Use & IP Transparency
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            OutputLens can be used as a risk overlay alongside existing trading systems, 
            helping teams stress-test positions, portfolios, and strategies under multiple 
            scenario regimes before capital is deployed. The platform is designed as 
            a risk management layer that complements existing quant models and discretionary 
            workflows. All simulations are reproducible with fixed seeding.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed italic">
            The mathematics are public. Our IP is how we orchestrate, interpret, and operationalize them at scale.
          </p>
        </div>
      </div>
    </section>
  );
}
