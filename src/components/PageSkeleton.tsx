export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Top progress bar */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-primary"
        style={{
          zIndex: 9999,
          boxShadow: '0 0 8px hsl(var(--primary) / 0.6)',
          animation: 'top-progress 800ms cubic-bezier(0.16,1,0.3,1) both',
        }}
      />

      <div className="flex flex-col items-center gap-5 animate-fade-in relative z-[1]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: 'hsl(var(--primary) / 0.10)' }}
          >
            <span className="font-display font-bold text-[17px]" style={{ color: 'hsl(var(--primary))' }}>O</span>
          </div>
          <span className="font-display font-bold text-[17px] tracking-tight">
            <span className="text-foreground">Output</span>
            <span className="text-primary">Lens</span>
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-[200px] h-[3px] rounded-full overflow-hidden"
          style={{ background: 'hsl(var(--elevated))' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 8px hsl(var(--primary) / 0.5)',
              animation: 'skeleton-progress 1.2s cubic-bezier(0.16,1,0.3,1) both',
            }}
          />
        </div>

        <p
          className="text-[11px] font-mono text-muted-foreground/60 uppercase animate-fade-in"
          style={{ letterSpacing: '0.18em', animationDelay: '300ms' }}
        >
          Loading risk engine…
        </p>
      </div>
    </div>
  );
}
