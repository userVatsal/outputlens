import { useState, useEffect } from 'react';

const LOADING_STAGES = [
  'Simulating thousands of possible outcomes...',
  'Measuring worst-case losses...',
  'Quantifying tail risk...',
];

export function LoadingState() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-16">
      <div className="inline-block w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mb-6" />
      <p className="text-foreground font-medium">
        {LOADING_STAGES[stage]}
      </p>
    </div>
  );
}
