import { Layout } from '@/components/layout/Layout';
import { AlertTriangle } from 'lucide-react';

export default function Terms() {
  return (
    <Layout>
      <div className="section-container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none space-y-8">
            <p className="text-muted-foreground">
              Last updated: January 2025
            </p>

            {/* Important Disclaimer Box */}
            <div className="glass-card p-6 bg-caution/5 border-caution/20">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-caution flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Important Disclaimer</h3>
                  <p className="text-sm text-muted-foreground">
                    OutputLens is for <strong>educational purposes only</strong>. It does not provide 
                    financial advice, trading signals, or predictions. You are solely responsible for 
                    your trading decisions. We make no guarantees about the accuracy of any scenario 
                    or analysis.
                  </p>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  By accessing or using OutputLens, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, do not use the service.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Service Description</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground mb-3">
                  OutputLens provides educational scenario analysis for trading positions. The service:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Uses Monte Carlo simulation to generate probabilistic scenarios</li>
                  <li>• Integrates live market data when available, with fallbacks for reliability</li>
                  <li>• Does not provide financial advice or trading recommendations</li>
                  <li>• Does not execute any trades on your behalf</li>
                  <li>• Makes no claims about the accuracy of any scenario or outcome</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. No Financial Advice</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  OutputLens is NOT a financial advisor. The scenarios and analyses provided are purely 
                  educational and should not be construed as financial advice, investment recommendations, 
                  or trading signals. Simulation results show possible outcomes, not predictions. 
                  Always consult with a qualified financial advisor before making any investment decisions.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. User Responsibilities</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground mb-3">You agree to:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use the service only for educational purposes</li>
                  <li>• Not rely on OutputLens for actual trading decisions</li>
                  <li>• Maintain the security of your account credentials</li>
                  <li>• Not attempt to circumvent usage limits or access controls</li>
                  <li>• Not use the service for any illegal or unauthorized purpose</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Subscription and Payments</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  Free accounts are limited to 10 analyses per month. Pro subscriptions provide unlimited 
                  analyses and are billed monthly. You may cancel at any time and retain access until the 
                  end of your billing period.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Limitation of Liability</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  To the maximum extent permitted by law, OutputLens and its creators shall not be liable 
                  for any direct, indirect, incidental, special, consequential, or punitive damages arising 
                  from your use of the service, including but not limited to financial losses from trading 
                  decisions.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. No Warranties</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  The service is provided "as is" without warranties of any kind. We do not warrant that 
                  the scenarios are accurate, complete, or suitable for any purpose. Simulated outcomes 
                  are based on mathematical models and do not guarantee future market behavior.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Modifications</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  We reserve the right to modify these terms at any time. Continued use of the service 
                  after modifications constitutes acceptance of the updated terms.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Termination</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  We may terminate or suspend your account at any time for violations of these terms 
                  or for any other reason at our discretion.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}