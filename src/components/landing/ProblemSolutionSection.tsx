import { AlertTriangle, Target, Zap, Database, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProblemSolutionSectionProps {
  className?: string;
}

const cards = [
  {
    step: 'The Problem',
    icon: AlertTriangle,
    iconBg: 'bg-bearish/10',
    iconColor: 'text-bearish',
    content: 'Traders lose money from tail events, fragmented liquidity, and gut-based decisions. Most tools give a single price target—not the probability distribution.',
  },
  {
    step: 'The Solution',
    icon: Target,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    content: 'OutputLens quantifies uncertainty before you trade. Probabilities, not predictions. See 10,000 possible outcomes, measure tail risk, understand scenario regimes.',
  },
  {
    step: 'Three-Layer Intelligence',
    icon: Layers,
    iconBg: 'bg-bullish/10',
    iconColor: 'text-bullish',
    content: '(1) GBM + GARCH stochastic simulation with fixed seeding, (2) HMM regime detection + neural database, (3) LLM interpretation with RAG. Deterministic math first. AI interprets, never predicts.',
  },
];

export function ProblemSolutionSection({ className }: ProblemSolutionSectionProps) {
  return (
    <section className={cn('py-16 bg-muted/30', className)}>
      <div className="section-container">
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Card 
              key={card.step} 
              className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'inline-flex items-center justify-center w-10 h-10 rounded-lg',
                    card.iconBg
                  )}>
                    <card.icon className={cn('h-5 w-5', card.iconColor)} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.step}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {card.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Neural DB grounding statement */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            <Database className="h-3 w-3 inline mr-1" />
            The neural database does not predict markets. It retrieves historically similar volatility and regime patterns to contextualize risk.
            All simulations are reproducible with fixed seeding.
          </p>
        </div>
      </div>
    </section>
  );
}