import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ArrowRight, TrendingUp, BarChart3, Building2, Target, Activity, Shield, Zap, Instagram, Youtube } from 'lucide-react';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const principles = [
  { num: '01', title: 'Truth over hype', body: 'We never predict prices. We quantify the distribution of possible outcomes. There is a difference — and it matters.' },
  { num: '02', title: 'Probabilities, not certainties', body: 'Every output is a probability distribution. Win probability. VaR. Expected shortfall. Never a "price target."' },
  { num: '03', title: 'Transparent methodology', body: 'Our models are documented. You can read exactly how we simulate, score, and explain every result.' },
  { num: '04', title: 'Accessible to everyone', body: 'Institutional risk tools should not require an institutional budget. We built the same infrastructure for every serious trader.' },
];

const glossaryTerms = [
  { term: 'Win Probability', def: 'The statistical likelihood your trade will be profitable at your target timeframe.' },
  { term: 'VaR (Value at Risk)', def: 'Maximum expected loss at a given confidence level (e.g. 95% VaR = 5% chance of exceeding).' },
  { term: 'Expected Shortfall', def: 'Average loss when things go wrong — the mean of the worst outcomes beyond VaR.' },
  { term: 'Monte Carlo Simulation', def: 'Running thousands of random price scenarios to understand the full range of possibilities.' },
  { term: 'Tail Risk', def: "Low-probability, high-impact events — the 'black swans' that can devastate portfolios." },
  { term: 'Sharpe Ratio', def: 'Risk-adjusted return: how much return you get per unit of risk taken.' },
];

export default function About() {
  useEffect(() => {
    document.title = 'About OutputLens - Our Mission';
  }, []);

  return (
    <Layout>
      {/* Hero — dark navy */}
      <section className="hero-gradient py-24 lg:py-32">
        <div className="section-container max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">Our Story</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-white leading-tight mb-8">
            Markets are irrational.<br />Risk isn't.
          </h1>
          <p className="text-xl text-white/60 leading-relaxed mb-10 max-w-2xl">
            We built OutputLens because institutional-grade risk quantification shouldn't require an institutional budget. Every serious trader deserves to know their actual downside before they trade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/workspace" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:brightness-110 group bg-primary shadow-[0_4px_16px_hsl(var(--primary)/0.4)]">
              Try Risk Analysis <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/methodology" className="inline-flex items-center gap-2 px-6 py-3 rounded font-medium text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-all">
              Read Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* Mission pull-quote */}
      <section className="py-20 border-b border-border">
        <div className="section-container max-w-4xl">
          <blockquote className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-relaxed">
            "Build the most trustworthy probabilistic risk platform — giving traders the same quantitative tools used by institutions, without hype or black-box predictions."
          </blockquote>
          <p className="mt-6 text-muted-foreground">
            Probabilities, not predictions. Truth over hype.
          </p>
        </div>
      </section>

      {/* Principles — numbered list */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-10">What We Believe</p>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 max-w-4xl">
            {principles.map(p => (
              <div key={p.num} className="flex gap-5">
                <span className="text-3xl font-bold font-mono text-border flex-shrink-0 leading-none">{p.num}</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="py-20 border-t border-border bg-surface">
        <div className="section-container">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-10">Who We Serve</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            {[
              { icon: TrendingUp, title: 'Active Traders', sub: 'Retail → Semi-Pro', body: 'Get institutional-grade risk metrics before you trade. Know your win probability and worst-case scenarios.' },
              { icon: BarChart3, title: 'Quant Analysts', sub: 'Data-Driven', body: 'Modular risk engine with reproducible simulations. Build on solid mathematical foundations.' },
              { icon: Building2, title: 'Funds & Fintechs', sub: 'Enterprise', body: 'Risk infrastructure that scales. API access, deterministic outputs, transparent methodology.' },
            ].map(p => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-card border border-border rounded-lg p-6">
                  <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-0.5">{p.title}</h3>
                  <p className="text-xs text-primary mb-3 font-medium">{p.sub}</p>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Glossary */}
      <section className="py-20 bg-background border-t border-border">
        <div className="section-container">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Learn</p>
          <h2 className="text-2xl font-bold font-display text-foreground mb-10">Risk Metrics Glossary</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
            {glossaryTerms.map(g => (
              <div key={g.term} className="border border-border rounded-lg p-5">
                <h3 className="font-semibold text-foreground mb-1.5 text-sm">{g.term}</h3>
                <p className="text-sm text-muted-foreground">{g.def}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social + CTA — dark */}
      <section className="hero-gradient py-20">
        <div className="section-container text-center">
          <h2 className="text-3xl font-bold font-display text-white mb-3">Ready to quantify your risk?</h2>
          <p className="text-white/60 mb-8">Join traders who understand their downside before they trade.</p>
          <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:brightness-110 group mb-10 bg-primary shadow-[0_4px_24px_hsl(var(--primary)/0.4)]">
            Get Started Free <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <div className="flex items-center justify-center gap-4 border-t border-white/10 pt-8 mt-4">
            {[
              { href: 'https://x.com/outputlens', Icon: XIcon },
              { href: 'https://instagram.com/outputlens', Icon: Instagram },
              { href: 'https://youtube.com/@outputlens', Icon: Youtube },
            ].map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                className="p-2 text-white/30 hover:text-white transition-colors">
                <s.Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
