import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, ExternalLink, Play, BookOpen } from 'lucide-react';
import { usePlatformStats } from '@/hooks/usePlatformStats';

const TECH_TAGS = (tags: string[]) => (
  <div className="mt-3 flex flex-wrap gap-2">
    {tags.map((t) => (
      <span key={t} className="bg-elevated border border-border/40 rounded-md px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
        {t}
      </span>
    ))}
  </div>
);

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] text-muted-foreground uppercase border-l-2 border-primary pl-3" style={{ letterSpacing: '0.15em' }}>
      {children}
    </div>
  );
}

export default function Founder() {
  const { totalAnalyses, totalUsers, analysesThisWeek, isLoading } = usePlatformStats();

  useEffect(() => {
    document.title = 'Vatsal — Founder of OutputLens';
    const existing = document.querySelector('meta[name="description"][data-page="founder"]');
    if (!existing) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.setAttribute('data-page', 'founder');
      meta.content = 'Vatsal, 19, Leicester. Built OutputLens — probabilistic risk intelligence for retail traders. GARCH + Monte Carlo + regime detection in the browser.';
      document.head.appendChild(meta);
    }
  }, []);

  const fmt = (n: number) => (isLoading ? '—' : n.toLocaleString('en-GB'));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-[760px] mx-auto px-6 py-20">
        {/* Identity */}
        <div className="font-mono text-[11px] text-primary uppercase" style={{ letterSpacing: '0.15em' }}>FOUNDER</div>
        <h1 className="font-display font-extrabold text-[48px] tracking-tight text-foreground mt-3 leading-none">Vatsal</h1>
        <p className="text-[18px] text-muted-foreground mt-2 font-medium">Building the risk layer for retail traders.</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[12px] text-muted-foreground">
          <span>📍 Leicester, UK</span>
          <span>·</span>
          <span>🇬🇧 🇵🇹</span>
          <span>·</span>
          <span>Apprentice @ Clearer.io</span>
          <span>·</span>
          <span>Age 19</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://github.com/userVatsal"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border/50 px-4 h-9 text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all flex items-center gap-2"
          >
            <Github className="h-4 w-4" /> userVatsal
          </a>
          <Link
            to="/demo"
            className="bg-primary/10 border border-primary/20 text-primary rounded-lg px-4 h-9 text-[13px] font-medium flex items-center gap-2 hover:bg-primary/15 transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> Live Demo
          </Link>
        </div>

        {/* Story */}
        <section className="mt-16">
          <SectionLabel>THE STORY</SectionLabel>
          <h2 className="font-display font-bold text-[28px] text-foreground mt-3 tracking-tight">Why I built this.</h2>
          <div className="text-[15px] text-muted-foreground leading-[1.8] space-y-4 mt-5">
            <p>Retail traders lose money not because they pick bad stocks — they lose because they don't know how much they stand to lose before they enter. A hedge fund desk would never put on a position without running it through a risk model first. That tool didn't exist for everyone else.</p>
            <p>I'm 19, based in Leicester, and I built OutputLens from scratch — the Monte Carlo engine, the GARCH volatility model, the regime detection, the whole stack — in TypeScript, running client-side, seeded for reproducibility. The same mathematics that Bloomberg charges $24,000 a year for, running in your browser for £29 a month.</p>
            <p>I'm not a finance professional. I'm a builder who got obsessed with one question: what does the distribution of outcomes look like for this position? Every feature in OutputLens exists because I needed it to answer that question more precisely.</p>
          </div>
        </section>

        {/* Stack */}
        <section className="mt-16">
          <SectionLabel>THE STACK</SectionLabel>
          <h2 className="font-display font-bold text-[24px] text-foreground mt-3">What's actually inside OutputLens.</h2>
          <div className="space-y-3 mt-5">
            <div className="rounded-xl bg-surface border border-border/50 p-5">
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary font-mono text-[10px] font-bold rounded-md px-2 py-1">L1</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-[15px] text-foreground">The Simulation Engine</h3>
                  <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">GBM, GARCH(1,1), Regime-Switched GBM, and Hidden Markov Model regime detection — all implemented from scratch in TypeScript. Seeded with Mulberry32 for reproducible results. 10,000 paths in under 300ms.</p>
                  {TECH_TAGS(['TypeScript', 'GBM', 'GARCH', 'HMM', 'Monte Carlo'])}
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-surface border border-border/50 p-5">
              <div className="flex items-start gap-3">
                <span className="bg-accent/10 text-accent font-mono text-[10px] font-bold rounded-md px-2 py-1">L2</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-[15px] text-foreground">Live Market Data + VADER Sentiment</h3>
                  <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">Yahoo Finance for real-time quotes across US, UK, EU markets. VADER rule-based sentiment scoring on news headlines — instant, no LLM latency, ~70% of signals handled in &lt;1ms. LLM enrichment only for ambiguous cases.</p>
                  {TECH_TAGS(['Yahoo Finance', 'VADER', 'Supabase Edge', 'Deno', 'CoinGecko'])}
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-surface border border-border/50 p-5">
              <div className="flex items-start gap-3">
                <span className="bg-caution/10 text-caution font-mono text-[10px] font-bold rounded-md px-2 py-1">L3</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-[15px] text-foreground">AI Interpretation Layer</h3>
                  <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">Claude (via Anthropic) for qualitative risk commentary. Strictly controlled — never generates price targets, only probability-aware plain-English context. Tier-gated model selection: Haiku for free, Sonnet for Pro.</p>
                  {TECH_TAGS(['Claude API', 'Anthropic', 'Prompt Engineering', 'React', 'Supabase'])}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Traction */}
        <section className="mt-16">
          <SectionLabel>TRACTION</SectionLabel>
          <h2 className="font-display font-bold text-[24px] text-foreground mt-3">Where it is now.</h2>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { v: fmt(totalAnalyses), l: 'Simulations' },
              { v: fmt(totalUsers), l: 'Users' },
              { v: fmt(analysesThisWeek), l: 'This Week' },
              { v: '40+', l: 'Countries' },
            ].map((s) => (
              <div key={s.l} className="bg-surface border border-border/50 rounded-xl p-4">
                <div className="font-mono font-bold text-[28px] text-primary tabular-nums">{s.v}</div>
                <div className="text-[11px] uppercase text-muted-foreground mt-1" style={{ letterSpacing: '0.08em' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] text-muted-foreground leading-relaxed">
            Built and launched in {new Date().getFullYear()}. Currently pre-revenue, building toward first paying customers. The engine works — every number on this page is computed live, not hardcoded.
          </p>
        </section>

        {/* Insight */}
        <section className="mt-16">
          <SectionLabel>THE INSIGHT</SectionLabel>
          <div className="bg-surface border border-primary/20 rounded-2xl p-8 mt-3 border-l-4 border-l-primary">
            <p className="font-display text-[18px] text-foreground leading-[1.65] italic">
              "The entire retail trading market treats risk as a single number. A stop-loss. A price target. A percentage. But risk is a distribution — and every decision made from a single number is made blind to the 9,999 other outcomes that were also possible."
            </p>
            <p className="font-mono text-[12px] text-muted-foreground mt-4">— The reason OutputLens exists.</p>
          </div>
        </section>

        {/* Links */}
        <section className="mt-16 pb-20 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/demo"
            className="block bg-primary/[0.08] border border-primary/25 rounded-2xl p-6 hover:border-primary/50 transition-all"
          >
            <Play className="text-primary h-8 w-8" />
            <h3 className="font-display font-bold text-[20px] text-foreground mt-3">Live Demo</h3>
            <p className="text-[13px] text-muted-foreground mt-2">5 real positions, engine running live in your browser. No signup required.</p>
            <p className="text-primary font-mono text-[13px] mt-4">Open demo →</p>
          </Link>
          <Link
            to="/methodology"
            className="block bg-accent/[0.08] border border-accent/25 rounded-2xl p-6 hover:border-accent/50 transition-all"
          >
            <BookOpen className="text-accent h-8 w-8" />
            <h3 className="font-display font-bold text-[20px] text-foreground mt-3">The Mathematics</h3>
            <p className="text-[13px] text-muted-foreground mt-2">GBM, GARCH, HMM, VaR, CVaR — all documented. No black boxes.</p>
            <p className="text-accent font-mono text-[13px] mt-4">Read methodology →</p>
          </Link>
        </section>
      </main>
    </div>
  );
}