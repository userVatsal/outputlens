import { useEffect } from 'react';
import { Navbar } from '@/components/landing/v2/Navbar';
import { Hero, StatsBar, HowItWorks, Features, SocialProof, Pricing, FooterV2 } from '@/components/landing/v2/Sections';

export default function Landing() {
  useEffect(() => {
    document.title = 'OutputLens — The market is a distribution. Trade it like one.';
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <Features />
        <SocialProof />
        <Pricing />
      </main>
      <FooterV2 />
    </div>
  );
}