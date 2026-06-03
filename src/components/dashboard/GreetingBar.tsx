import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
  const subtitle = attentionCount === 0
    ? 'All positions are within risk thresholds.'
    : `You have ${attentionCount} ${attentionCount === 1 ? 'position' : 'positions'} needing attention.`;

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap animate-fade-up">
      <div className="min-w-0">
        <h1 className="font-display font-bold text-foreground text-[26px] tracking-tight leading-tight">
          {timeOfDay()}, {first}.
        </h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          {attentionCount === 0 ? (
            'All positions are within risk thresholds.'
          ) : (
            <>
              You have{' '}
              <span className="text-caution font-mono font-semibold animate-count-flash">
                {attentionCount}
              </span>{' '}
              {attentionCount === 1 ? 'position' : 'positions'} needing attention.
            </>
          )}
        </p>
      </div>
      <Link
        to="/workspace"
        className="btn-primary inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-xl px-4 py-2"
      >
        New Analysis <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}