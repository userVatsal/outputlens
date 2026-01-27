import { Link } from 'react-router-dom';
import { ArrowRight, Clock, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const articles = [
  {
    id: 'trading-terms',
    title: 'Understanding Trading & Investment Terms',
    category: 'Glossary',
    readTime: '10 min',
    description: 'Master the essential terminology from OutputLens metrics to industry-standard concepts.',
    icon: BookOpen,
  },
  {
    id: 'strategies-2026',
    title: 'Trading & Hedge Fund Strategies in 2026',
    category: 'Strategy',
    readTime: '12 min',
    description: 'Explore momentum, mean reversion, risk parity, and quantitative approaches.',
    icon: TrendingUp,
  },
  {
    id: 'monthly-insights',
    title: 'Monthly Finance Insights',
    category: 'Coming Soon',
    readTime: 'Feb 2026',
    description: 'Stay tuned for our monthly analysis of market trends and emerging opportunities.',
    icon: Calendar,
    isComingSoon: true,
  },
];

export function LatestArticles() {
  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Learn & Explore
            </CardTitle>
            <CardDescription>
              Educational resources to sharpen your edge
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/about#learn" className="text-primary">
              See All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {articles.map((article) => {
          const Icon = article.icon;
          return (
            <Link
              key={article.id}
              to={article.isComingSoon ? '#' : `/about#${article.id}`}
              className={`block p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors ${
                article.isComingSoon ? 'opacity-60 cursor-default' : ''
              }`}
              onClick={article.isComingSoon ? (e) => e.preventDefault() : undefined}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={article.isComingSoon ? 'secondary' : 'outline'} 
                      className="text-xs"
                    >
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {article.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {article.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
