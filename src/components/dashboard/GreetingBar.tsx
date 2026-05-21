interface Props {
  name?: string | null;
  attentionCount?: number;
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function GreetingBar({ name, attentionCount = 0 }: Props) {
  const first = (name || '').split(' ')[0] || 'there';
  return (
    <div className="py-6 md:py-8">
      <h1 className="font-display font-semibold text-foreground" style={{ fontSize: 'clamp(20px, 3vw, 22px)' }}>
        {timeOfDay()}, {first}.{' '}
        <span className="font-sans font-normal text-muted-foreground text-base md:text-[16px] block md:inline mt-1 md:mt-0">
          {attentionCount > 0
            ? `${attentionCount} ${attentionCount === 1 ? 'position needs' : 'positions need'} attention.`
            : 'All positions within thresholds.'}
        </span>
      </h1>
    </div>
  );
}