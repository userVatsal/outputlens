import { Layout } from '@/components/layout/Layout';

export default function Privacy() {
  return (
    <Layout>
      <div className="section-container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none space-y-8">
            <p className="text-muted-foreground">
              Last updated: January 2025
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
              <div className="glass-card p-6 space-y-3">
                <h3 className="font-medium text-foreground">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  When you create an account, we collect your email address and encrypted password.
                </p>
                <h3 className="font-medium text-foreground">Usage Data</h3>
                <p className="text-sm text-muted-foreground">
                  We track the number of analyses you perform each month to manage usage limits. 
                  We may store your analysis inputs and results for your history feature.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <div className="glass-card p-6">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• To provide and maintain the OutputLens service</li>
                  <li>• To manage your account and usage limits</li>
                  <li>• To process payments (for Pro subscribers)</li>
                  <li>• To communicate service updates and important notices</li>
                  <li>• To improve our service and develop new features</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Data Security</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  We implement industry-standard security measures to protect your data. 
                  Your password is encrypted and we use secure connections (HTTPS) for all data transmission. 
                  However, no method of transmission over the Internet is 100% secure.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Data Sharing</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  We do not sell your personal information. We may share data with:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• Service providers who help us operate OutputLens</li>
                  <li>• Payment processors for subscription management</li>
                  <li>• Legal authorities when required by law</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Third-Party Services</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground mb-3">
                  OutputLens integrates with third-party market data providers to deliver live analysis:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Finnhub (stock quotes and news)</li>
                  <li>• Twelve Data (forex and historical data)</li>
                  <li>• CoinGecko (cryptocurrency data)</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  These providers may have their own privacy policies regarding data they collect.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Data Retention</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  We retain your account information for as long as your account is active. 
                  Analysis history is retained for Pro users. Upon account deletion, we remove 
                  your personal data within 30 days, except where required by law.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Your Rights</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">You have the right to:</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• Access your personal data</li>
                  <li>• Request correction of inaccurate data</li>
                  <li>• Request deletion of your account and data</li>
                  <li>• Export your data</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Cookies</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  We use essential cookies for authentication and session management. 
                  We may use analytics cookies to understand how our service is used. 
                  You can disable cookies in your browser settings.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Changes to This Policy</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  We may update this privacy policy from time to time. We will notify you of 
                  significant changes via email or through the service.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">10. Contact</h2>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  For privacy-related questions, please contact us through the application.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}