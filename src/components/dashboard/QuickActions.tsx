import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Briefcase, 
  TrendingUp,
  BookOpen,
  ArrowRight 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const actions = [
  {
    title: 'Single Asset Analysis',
    description: 'Run risk analysis on any stock, crypto, or ETF',
    icon: BarChart3,
    href: '/workspace',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Portfolio Mode',
    description: 'Analyze multi-asset portfolios with correlation',
    icon: Briefcase,
    href: '/workspace?mode=portfolio',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'View History',
    description: 'Review past analyses and track decisions',
    icon: TrendingUp,
    href: '/history',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    title: 'Methodology',
    description: 'Learn about our risk models and AI approach',
    icon: BookOpen,
    href: '/methodology',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link 
            key={action.title}
            to={action.href}
            className="group"
          >
            <Card className={cn(
              "h-full border-border hover:border-primary/40 transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            )}>
              <CardContent className="p-4">
                <div className={cn(
                  "p-2.5 rounded-lg w-fit mb-3 transition-transform group-hover:scale-110",
                  action.bgColor
                )}>
                  <Icon className={cn("h-5 w-5", action.color)} />
                </div>
                <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  {action.title}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </h4>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
