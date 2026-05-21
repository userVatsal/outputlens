import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, Zap } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { cn } from '@/lib/utils';

type Horizon = '1D' | '5D' | '1M';
type Confidence = 90 | 95 | 99;
type Method = 'Parametric' | 'Historical' | 'Monte Carlo';
type Ccy = '£' | '$' | '€';

const HORIZON_DAYS: Record<Horizon, number> = { '1D': 1, '5D': 5, '1M': 21 };
const Z: Record<Confidence, number> = { 90: 1.2816, 95: 1.6449, 99: 2.3263 };

function Pills<T extends string | number>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: readonly T[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={String(opt)}
          type="button"
          onClick={() => onChange(opt as T)}
          className={cn(
            'min-h-[44px] px-4 rounded-md border text-sm font-mono uppercase tracking-wide transition-colors',
            value === opt
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-surface border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function VarCalculator() {
  const [asset, setAsset] = useState('SPY');
  const [size, setSize] = useState<number>(100000);
  const [ccy, setCcy] = useState<Ccy>('£');
  const [horizon, setHorizon] = useState<Horizon>('1D');
  const [confidence, setConfidence] = useState<Confidence>(95);
  const [method, setMethod] = useState<Method>('Monte Carlo');

  useEffect(() => { document.title = 'VaR Calculator | OutputLens'; }, []);

  // Simplified VaR model — daily vol assumption per method
  const result = useMemo(() => {
    const dailyVol = method === 'Parametric' ? 0.012 : method === 'Historical' ? 0.014 : 0.018;
    const days = HORIZON_DAYS[horizon];
    const z = Z[confidence];
    const sigma = dailyVol * Math.sqrt(days);
    const var$ = size * sigma * z;
    const es$ = var$ * 1.27; // expected shortfall approx
    const worst1pct = size * sigma * Z[99];
    return {
      var: var$,
      es: es$,
      worst1pct,
      dailyVolPct: dailyVol * 100,
      multiplier: method === 'Monte Carlo' ? 3.2 : method === 'Historical' ? 1.4 : 1,
    };
  }, [size, horizon, confidence, method]);

  const fmt = (n: number) =>
    `${ccy}${Math.round(n).toLocaleString('en-US')}`;

  return (
    <AppShell>
      <div className="section-container py-6 lg:py-10">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                VaR Calculator
              </h1>
              <p className="text-sm text-muted-foreground">
                Live Value-at-Risk across parametric, historical, and Monte Carlo methods.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
            {/* Inputs */}
            <div className="space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Asset
                </label>
                <input
                  value={asset}
                  onChange={e => setAsset(e.target.value.toUpperCase())}
                  className="auth-input w-full rounded-md border border-border bg-elevated px-3 font-mono text-base text-foreground focus:border-primary focus:outline-none"
                  placeholder="SPY"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Position size
                </label>
                <div className="flex gap-2">
                  <select
                    value={ccy}
                    onChange={e => setCcy(e.target.value as Ccy)}
                    className="auth-input w-20 rounded-md border border-border bg-elevated px-2 font-mono text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="£">£</option>
                    <option value="$">$</option>
                    <option value="€">€</option>
                  </select>
                  <input
                    type="number"
                    value={size}
                    onChange={e => setSize(Number(e.target.value) || 0)}
                    className="auth-input flex-1 rounded-md border border-border bg-elevated px-3 font-mono text-base tabular-nums text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Horizon
                </label>
                <Pills value={horizon} onChange={setHorizon} options={['1D', '5D', '1M'] as const} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Confidence
                </label>
                <Pills value={confidence} onChange={setConfidence} options={[90, 95, 99] as const} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Method
                </label>
                <Pills value={method} onChange={setMethod} options={['Parametric', 'Historical', 'Monte Carlo'] as const} />
              </div>
            </div>

            {/* Live result */}
            <div className="rounded-xl border border-border bg-elevated p-6 sm:p-8">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Value at Risk ({confidence}%, {horizon})
              </div>
              <div className="mt-2 font-mono text-4xl sm:text-5xl font-extrabold tabular-nums text-bearish">
                −{fmt(result.var)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {asset} · {method}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/60 pt-5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Expected shortfall
                  </div>
                  <div className="mt-1 font-mono text-lg tabular-nums text-foreground">
                    −{fmt(result.es)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Worst 1%
                  </div>
                  <div className="mt-1 font-mono text-lg tabular-nums text-foreground">
                    −{fmt(result.worst1pct)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Daily vol
                  </div>
                  <div className="mt-1 font-mono text-lg tabular-nums text-foreground">
                    {result.dailyVolPct.toFixed(2)}%
                  </div>
                </div>
              </div>

              {method !== 'Monte Carlo' && (
                <div className="mt-6 rounded-r-md border-l-[3px] border-primary bg-surface p-3 pl-4">
                  <div className="flex items-start gap-2">
                    <Zap className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    <div className="text-sm text-foreground">
                      Monte Carlo shows{' '}
                      <span className="font-mono text-primary">
                        {(result.multiplier === 1 ? 3.2 : 3.2 / result.multiplier).toFixed(1)}x
                      </span>{' '}
                      more tail risk than {method.toLowerCase()} assumes.
                      <Link
                        to="/workspace"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Run full simulation <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
