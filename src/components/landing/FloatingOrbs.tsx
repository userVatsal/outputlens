/**
 * Sarvam-inspired floating gradient orbs for hero/section backgrounds.
 * Provides ambient 3D motion depth.
 */
export function FloatingOrbs({ variant = 'warm' }: { variant?: 'warm' | 'cool' | 'dark' }) {
  if (variant === 'dark') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="orb orb-blue w-[500px] h-[500px] -top-40 -right-40 animate-float-slow opacity-20" />
        <div className="orb orb-lavender w-[400px] h-[400px] bottom-0 -left-32 animate-float-reverse opacity-15" />
      </div>
    );
  }

  if (variant === 'cool') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="orb orb-blue w-[450px] h-[450px] top-10 right-10 animate-float-slow opacity-30" />
        <div className="orb orb-lavender w-[350px] h-[350px] bottom-20 left-10 animate-float-reverse opacity-25" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="orb orb-amber w-[600px] h-[600px] -top-32 left-1/4 animate-float-slow animate-morph opacity-60" />
      <div className="orb orb-lavender w-[500px] h-[500px] top-1/3 -right-32 animate-float-reverse opacity-40" />
      <div className="orb orb-peach w-[400px] h-[400px] bottom-0 left-0 animate-float-slow opacity-30" />
      <div className="orb orb-blue w-[350px] h-[350px] bottom-1/4 right-1/4 animate-float-reverse opacity-25" />
    </div>
  );
}
