import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/BrandLogo';

export default function Legal() {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b border-border">
        <div className="section-container py-4 flex items-center justify-between">
          <Link to="/">
            <BrandLogo size="md" />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="section-container py-8 max-w-2xl">
        {/* Important Disclaimer - Top and prominent */}
        <div className="glass-card p-6 mb-8" style={{ borderColor: 'hsl(var(--risk) / 0.3)', backgroundColor: 'hsl(var(--risk) / 0.05)' }}>
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--risk))' }} />
            <div>
              <h2 className="font-semibold text-foreground mb-2">Important Disclaimer</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                OutputLens is for <strong>informational purposes only</strong>. It does not provide 
                financial advice, trading signals, or predictions. Simulation results show possible outcomes 
                based on mathematical models, not guarantees. You are solely responsible for your trading 
                decisions. Always consult with a qualified financial advisor.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-6">Legal & Privacy</h1>
        
        <div className="space-y-8 text-sm text-muted-foreground">
          {/* Model Limitations */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">Model Limitations</h2>
            <div className="glass-card p-5 space-y-2">
              <p>OutputLens uses Monte Carlo simulation to generate probabilistic scenarios. Key limitations:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Past volatility does not guarantee future volatility</li>
                <li>Extreme events may occur more frequently than models predict</li>
                <li>Models cannot account for unforeseen market events</li>
                <li>Results are illustrative, not predictive</li>
              </ul>
            </div>
          </section>

          {/* Data Usage */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">Data Usage</h2>
            <div className="glass-card p-5 space-y-2">
              <p>We collect minimal data to operate the service:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Email address for authentication</li>
                <li>Analysis inputs and results (to show your history)</li>
                <li>Usage counts for plan limits</li>
              </ul>
              <p className="mt-3">We do not sell your personal information. Your analysis data is private to your account.</p>
            </div>
          </section>

          {/* Terms of Service Summary */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">Terms of Service</h2>
            <div className="glass-card p-5 space-y-2">
              <p>By using OutputLens, you agree that:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>The service is for informational purposes only</li>
                <li>You will not rely on it for actual trading decisions</li>
                <li>We are not liable for any financial losses</li>
                <li>You are responsible for your own decisions</li>
              </ul>
            </div>
          </section>

          {/* Privacy Policy Summary */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">Privacy Policy</h2>
            <div className="glass-card p-5 space-y-2">
              <p>Your data rights:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Request access to your data at any time</li>
                <li>Request deletion of your account and data</li>
                <li>Data encrypted at rest and in transit</li>
                <li>No sharing with third parties for marketing</li>
              </ul>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">Data Sources</h2>
            <div className="glass-card p-5">
              <p>Market data is sourced from third-party providers including Finnhub and Twelve Data. 
                 These providers may have their own terms regarding data usage.</p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">Contact</h2>
            <div className="glass-card p-5">
              <p>For privacy or legal questions, contact us through the application.</p>
            </div>
          </section>
        </div>

        <p className="text-xs text-muted-foreground/60 mt-8">
          Last updated: January 2025
        </p>
      </main>
    </div>
  );
}
