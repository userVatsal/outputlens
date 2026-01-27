import { cn } from '@/lib/utils';
import logoWordmark from '@/assets/logo-wordmark.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * OutputLens brand logo using the official wordmark
 */
export function BrandLogo({ size = 'md', className }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12'
  };

  return (
    <img 
      src={logoWordmark}
      alt="OutputLens"
      className={cn(
        sizeClasses[size],
        'w-auto',
        className
      )}
    />
  );
}
