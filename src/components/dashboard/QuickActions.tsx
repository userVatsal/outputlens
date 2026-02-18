import { Link } from 'react-router-dom';
import { BarChart3, Briefcase, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    title: 'Single Asset',
    description: 'Stocks, crypto, ETFs',
    icon: BarChart3,
    href: '/workspace',
  },
  {
    title: 'Portfolio Mode',
    description: 'Multi-asset correlation',
    icon: Briefcase,
    href: '/workspace?mode=portfolio',
  },
  {
    title: 'View History',
    description: 'Past analyses',
    icon: TrendingUp,
    href: '/history',
  },
  {
    title: 'Methodology',
    description: 'How it works',
    icon: BookOpen,
    href: '/methodology',
  },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.title}
            to={action.href}
            className={cn(
              'inline-flex items-center gap-2.5 px-4 py-2.5 rounded border border-border bg-card',
              'text-sm font-medium text-foreground hover:border-primary/50 hover:bg-primary/5',
              'transition-all duration-200 group'
            )}
          >
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>{action.title}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        );
      })}
    </div>
  );
}
