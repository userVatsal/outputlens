import { Link } from 'react-router-dom';
import { BarChart3, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function WorkspaceCTA() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Risk & Scenario Workspace
        </CardTitle>
        <CardDescription>
          Run institutional-grade risk analysis with Monte Carlo simulation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feature highlights */}
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            10,000 Monte Carlo paths
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Scenario regimes & tail risk analysis
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Live market data integration
          </li>
        </ul>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link to="/workspace">
              <BarChart3 className="h-4 w-4 mr-2" />
              Perform Risk Analysis
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/workspace?mode=portfolio">
              <Briefcase className="h-4 w-4 mr-2" />
              Portfolio Mode
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
