import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  badge?: ReactNode;
  meta?: ReactNode;
  accent?: 'default' | 'accent';
  className?: string;
  children: ReactNode;
}

export function BriefingCard({ title, badge, meta, accent = 'default', className, children }: Props) {
  return (
    <div className={cn(
      'bg-surface border border-border/50 rounded-2xl p-6 mt-4',
      accent === 'accent' && 'border-l-4 border-l-accent',
      className,
    )}>
      <div className="flex items-center gap-2">
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
        {badge}
        {meta && <span className="ml-auto font-mono text-[11px] text-muted-foreground">{meta}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}