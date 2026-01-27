import { cn } from '@/lib/utils';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Text-based OutputLens brand logo in deep navy
 */
export function BrandLogo({ size = 'md', className }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
    xl: 'text-3xl md:text-4xl lg:text-5xl'
  };

  return (
    <span 
      className={cn(
        'font-brand font-extrabold tracking-tight select-none text-logo-navy',
        sizeClasses[size],
        className
      )}
    >
      <span className="text-logo-navy">Output</span>
      <span className="text-logo-blue">Lens</span>
    </span>
  );
}
