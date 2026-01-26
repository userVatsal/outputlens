import { AlertTriangle, Target, Zap } from 'lucide-react';
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
    content: 'OutputLens quantifies your downside before you trade. See 10,000 possible outcomes, measure tail risk, and understand scenario regimes.',
  },
  {
    step: 'How We Do It',
    icon: Zap,
    iconBg: 'bg-bullish/10',
    iconColor: 'text-bullish',
    content: 'Monte Carlo simulation + live market volatility + AI interpretation. Institutional methodology, delivered in 2 seconds.',
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
      </div>
    </section>
  );
}
