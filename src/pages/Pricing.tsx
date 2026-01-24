import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for occasional analysis',
    features: [
      '10 analyses per month',
      'All market scenarios',
      'AI explanations',
      'Basic support',
    ],
    cta: 'Get Started',
    ctaLink: '/auth?mode=signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For active traders and learners',
    features: [
      'Unlimited analyses',
      'All market scenarios',
      'AI explanations',
      'Analysis history',
      'Priority support',
      'Early access to new features',
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/auth?mode=signup',
    highlighted: true,
  },
];

const faqs = [
  {
    question: 'Is this financial advice?',
    answer: 'No. OutputLens is an educational tool that shows potential scenarios based on predefined market conditions. It does not provide financial advice, trading signals, or predictions.',
  },
  {
    question: 'How accurate are the scenarios?',
    answer: 'Our scenarios are static and educational. They represent typical market conditions but do not reflect real-time data or provide any guarantees about actual market behavior.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Pro subscriptions can be cancelled at any time. You\'ll retain access until the end of your billing period.',
  },
  {
    question: 'What markets are supported?',
    answer: 'We support US (NYSE/NASDAQ), UK (LSE), and European (Euronext/DAX) markets with region-specific scenarios.',
  },
];

export default function Pricing() {
  return (
    <Layout>
      <div className="section-container py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-8 relative ${
                plan.highlighted ? 'border-2 border-primary' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-bullish/10 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-bullish" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                <Link to={plan.ctaLink}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            OutputLens is for educational purposes only. It does not provide financial advice 
            or trading recommendations. Past scenarios do not guarantee future results.
          </p>
        </div>
      </div>
    </Layout>
  );
}
