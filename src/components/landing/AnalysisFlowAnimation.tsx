import { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const terminalLines = [
  { text: '$ analyze TSLA --horizon 30d --direction long', delay: 0, type: 'cmd' },
  { text: '→ Fetching TSLA market data...', delay: 600, type: 'info' },
  { text: '→ Running 10,000 Monte Carlo paths...', delay: 1300, type: 'info' },
  { text: '→ Detecting market regime: VOLATILE', delay: 2100, type: 'info' },
  { text: '→ Calculating CVaR at 95%...', delay: 2800, type: 'info' },
  { text: '→ Generating AI scenario analysis...', delay: 3500, type: 'info' },
  { text: '✓ Analysis complete in 1.8s', delay: 4200, type: 'success' },
];

const results = [
  { label: 'Win Probability', value: '67%', color: 'text-green-400' },
  { label: '95% VaR', value: '-12.4%', color: 'text-red-400' },
  { label: 'Expected Return', value: '+8.7%', color: 'text-green-400' },
  { label: 'Risk Score', value: '6/10', color: 'text-yellow-400' },
];

const scenarios = [
  { label: 'Bull case', value: '+18.4%', pct: 28, color: 'bg-green-500' },
  { label: 'Base case', value: '+5.2%', pct: 42, color: 'bg-blue-500' },
  { label: 'Bear case', value: '-14.7%', pct: 30, color: 'bg-red-500' },
];

export function AnalysisFlowAnimation() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    setVisibleLines([]);
    setShowResults(false);

    const timers: NodeJS.Timeout[] = [];

    terminalLines.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, i]);
      }, line.delay);
      timers.push(t);
    });

    const resultsTimer = setTimeout(() => setShowResults(true), 5000);
    timers.push(resultsTimer);

    // Loop
    const resetTimer = setTimeout(() => {
      setCycleKey(k => k + 1);
    }, 10000);
    timers.push(resetTimer);

    return () => timers.forEach(clearTimeout);
  }, [cycleKey]);

  return (
    <div className="terminal-window shadow-2xl max-w-2xl">
      {/* Terminal header */}
      <div className="terminal-header">
        <div className="terminal-dot" style={{ backgroundColor: '#FF5F57' }} />
        <div className="terminal-dot" style={{ backgroundColor: '#FEBC2E' }} />
        <div className="terminal-dot" style={{ backgroundColor: '#28C840' }} />
        <span className="ml-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
          outputlens — analysis engine v2.1
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-6 space-y-1.5 min-h-[280px]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', lineHeight: '1.5' }}>
        {terminalLines.map((line, i) => (
          <div
            key={`${cycleKey}-${i}`}
            className={cn(
              'transition-all duration-300',
              visibleLines.includes(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            )}
            style={{
              color: line.type === 'cmd'
                ? 'rgba(255,255,255,0.7)'
                : line.type === 'success'
                  ? '#4ade80'
                  : 'rgba(255,255,255,0.4)',
              fontWeight: line.type === 'success' ? 600 : 400,
            }}
          >
            {line.type === 'info' && visibleLines.includes(i) && !visibleLines.includes(i + 1) && i < terminalLines.length - 1 ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-blue-400 flex-shrink-0" />
                {line.text}
              </span>
            ) : line.type === 'success' ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {line.text}
              </span>
            ) : (
              line.text
            )}
          </div>
        ))}

        {/* Blinking cursor while processing */}
        {visibleLines.length > 0 && visibleLines.length < terminalLines.length && (
          <span className="inline-block w-2 h-4 align-middle animate-terminal-blink" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }} />
        )}

        {/* Results table */}
        {showResults && (
          <div className="mt-5 pt-5 border-t border-white/10 animate-fade-up">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {results.map(r => (
                <div key={r.label} className="rounded p-3" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem' }}>{r.label}</p>
                  <p className={cn('font-bold text-base mt-0.5', r.color)}>{r.value}</p>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', marginBottom: '0.5rem' }}>SCENARIO DISTRIBUTION</p>
            {scenarios.map(s => (
              <div key={s.label} className="flex items-center gap-3 mb-1.5">
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', width: '80px', flexShrink: 0 }}>{s.label}</span>
                <div className="flex-1 h-4 rounded overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div className={cn('h-full rounded flex items-center justify-end pr-2', s.color)} style={{ width: `${s.pct}%`, opacity: 0.75 }}>
                    <span className="text-white font-mono text-xs font-semibold">{s.pct}%</span>
                  </div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', width: '52px', textAlign: 'right', flexShrink: 0 }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
