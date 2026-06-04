import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { usePlatformStats } from '@/hooks/usePlatformStats';

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] text-primary uppercase border-l-2 border-primary pl-3 mt-10" style={{ letterSpacing: '0.15em' }}>
      {children}
    </div>
  );
}

export default function YC() {
  const { totalAnalyses, totalUsers, analysesThisWeek, isLoading } = usePlatformStats();
  useEffect(() => {
    document.title = 'OutputLens — YC Application';
  }, []);

  const fmt = (n: number) => (isLoading ? '—' : n.toLocaleString('en-GB'));
  const year = new Date().getFullYear();

  const linkRows: Array<{ label: string; href: string; sub: string; external?: boolean }> = [
    { label: 'Live Demo', href: '/demo', sub: 'outputlens.com/demo' },
    { label: 'Founder Page', href: '/founder', sub: 'outputlens.com/founder' },
    { label: 'Public Metrics', href: '/metrics', sub: 'outputlens.com/metrics' },
    { label: 'GitHub', href: 'https://github.com/userVatsal', sub: 'github.com/userVatsal', external: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-[760px] mx-auto px-6 py-16">
        <h1 className="font-display font-extrabold text-[48px] text-foreground leading-none">OutputLens</h1>
        <p className="font-mono text-[12px] text-muted-foreground mt-2 uppercase" style={{ letterSpacing: '0.12em' }}>For YC Startup School · {year}</p>

        <Label>THE PITCH</Label>
        <div className="bg-surface border border-border/50 rounded-2xl p-7 mt-3">
          <p className="font-display text-[20px] text-foreground leading-[1.6] font-semibold">
            OutputLens gives retail traders the same probabilistic risk tools used by hedge fund desks — Monte Carlo simulation, GARCH volatility modelling, and regime detection — in a browser, in under a second, for £12 a month.
          </p>
        </div>

        <Label>THE PROBLEM</Label>
        <div className="bg-surface border border-border/50 rounded-2xl p-7 mt-3">
          <h3 className="font-semibold text-[17px] text-foreground">Retail traders make binary decisions with distributional data.</h3>
          <div className="text-[14px] text-muted-foreground leading-relaxed mt-3 space-y-3">
            <p>Every retail trading platform shows you a price. A chart. Maybe a P&amp;L. What none of them show you is the distribution of outcomes — how likely is a 15% loss? What does the tail risk look like? What regime is this asset in right now?</p>
            <p>Professional risk desks run this analysis before every trade. The tools to do it cost £20,000+ per year (Bloomberg) or require a quant team. We built it to run in a browser in under 300ms.</p>
          </div>
        </div>

        <Label>THE SOLUTION</Label>
        <div className="bg-surface border border-border/50 rounded-2xl p-7 mt-3">
          <h3 className="font-semibold text-[17px] text-foreground">A three-layer risk intelligence engine.</h3>
          <div className="space-y-3 mt-4">
            {[
              { tag: 'L1', cls: 'bg-primary/10 text-primary', body: 'GBM, GARCH(1,1), and Hidden Markov Model regime detection — 10,000 Monte Carlo paths per simulation, running client-side in TypeScript, reproducibly seeded.' },
              { tag: 'L2', cls: 'bg-accent/10 text-accent', body: 'Yahoo Finance for live market data. VADER rule-based sentiment scoring on news headlines — instant, no LLM cost for the majority of signals.' },
              { tag: 'L3', cls: 'bg-caution/10 text-caution', body: 'Claude (Anthropic) for plain-English risk commentary. Strictly controlled — probability-aware, never predictive.' },
            ].map((r) => (
              <div key={r.tag} className="flex items-start gap-4">
                <span className={`${r.cls} font-mono font-bold text-[11px] rounded-md px-2 py-1 flex-shrink-0 mt-0.5`}>{r.tag}</span>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </div>

        <Label>WHY NOW · WHY ME</Label>
        <div className="bg-surface border border-border/50 rounded-2xl p-7 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-[15px] text-foreground">Three things converged.</h4>
            <ul className="font-mono text-[13px] text-muted-foreground space-y-2 mt-3 list-none">
              <li>• LLMs made the AI layer cheap enough to include at £12/mo</li>
              <li>• Yahoo Finance API democratised real-time data</li>
              <li>• Retail trading exploded post-2020, creating millions of users who are underprepared for tail risk</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[15px] text-foreground">Why a 19-year-old from Leicester.</h4>
            <ul className="font-mono text-[13px] text-muted-foreground space-y-2 mt-3 list-none">
              <li>• Built the entire stack solo: engine, frontend, backend, billing, auth, data pipeline</li>
              <li>• Currently apprentice at Clearer.io — learning production software delivery in parallel</li>
              <li>• Portuguese passport + UK settled status — optionality to build anywhere in Europe</li>
            </ul>
          </div>
        </div>

        <Label>TRACTION</Label>
        <div className="bg-surface border border-border/50 rounded-2xl p-7 mt-3">
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: fmt(totalAnalyses), l: 'Total Simulations' },
              { v: fmt(totalUsers), l: 'Registered Users' },
              { v: fmt(analysesThisWeek), l: 'This Week' },
              { v: '<0.3s', l: 'Time to Results' },
            ].map((s) => (
              <div key={s.l} className="bg-elevated/40 border border-border/40 rounded-xl p-4">
                <div className="font-mono font-bold text-[24px] text-primary tabular-nums">{s.v}</div>
                <div className="text-[11px] uppercase text-muted-foreground mt-1" style={{ letterSpacing: '0.08em' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-muted-foreground italic mt-4">Pre-revenue. Every number is live from our database.</p>
        </div>

        <Label>LINKS</Label>
        <div className="space-y-2 mt-3">
          {linkRows.map((r) => {
            const inner = (
              <div className="rounded-xl border border-border/50 bg-elevated/40 px-5 py-3 flex items-center justify-between hover:border-primary/20 transition-all">
                <div>
                  <div className="text-foreground font-medium text-[14px]">{r.label}</div>
                  <div className="font-mono text-[12px] text-muted-foreground">{r.sub}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-primary ml-auto" />
              </div>
            );
            return r.external ? (
              <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer">{inner}</a>
            ) : (
              <Link key={r.label} to={r.href} target="_blank" rel="noopener noreferrer">{inner}</Link>
            );
          })}
        </div>

        <Label>WHAT I NEED</Label>
        <div className="bg-surface border border-border/50 rounded-2xl p-7 mt-3 space-y-3 text-[14px] text-muted-foreground leading-relaxed">
          <p>Primarily: validation that the market framing is right, and access to the network for first institutional customers. The product works. The question is distribution — getting it in front of the 10,000 active traders who would pay £29/mo for it today if they knew it existed.</p>
          <p>Secondarily: technical guidance on the data architecture as the user base scales. The current Supabase + edge function stack is solid for early growth but will need rethinking above 10,000 daily active users.</p>
        </div>

        <p className="text-[11px] font-mono text-muted-foreground/50 text-center mt-16 pb-8">
          outputlens.com/yc — This page exists to answer YC's application questions honestly and in full. If you're reviewing this application: thank you for your time.
        </p>
      </main>
    </div>
  );
}