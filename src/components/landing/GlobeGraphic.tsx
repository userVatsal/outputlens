/**
 * Sarvam-inspired SVG globe/wireframe graphic with slow rotation.
 * Pure CSS 3D animation — no dependencies.
 */
export function GlobeGraphic({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        className="w-full h-full animate-globe"
        style={{ opacity: 0.12 }}
      >
        {/* Concentric circles */}
        {[80, 120, 160, 200].map(r => (
          <circle key={r} cx="200" cy="200" r={r} stroke="currentColor" strokeWidth="0.5" />
        ))}
        {/* Meridian arcs */}
        {[0, 30, 60, 90, 120, 150].map(angle => (
          <ellipse
            key={angle}
            cx="200"
            cy="200"
            rx={200 * Math.cos((angle * Math.PI) / 180)}
            ry="200"
            stroke="currentColor"
            strokeWidth="0.5"
            transform={`rotate(0 200 200)`}
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: '200px 200px' }}
          />
        ))}
        {/* Diamond center */}
        <rect x="185" y="185" width="30" height="30" rx="2" stroke="currentColor" strokeWidth="1" transform="rotate(45 200 200)" />
      </svg>
    </div>
  );
}
