import { cn } from '@/lib/utils';

interface DataProviderLogosProps {
  className?: string;
}

export function DataProviderLogos({ className }: DataProviderLogosProps) {
  const providers = [
    { name: 'Finnhub', description: 'Real-time market data' },
    { name: 'TwelveData', description: 'Historical analytics' },
    { name: 'CoinGecko', description: 'Crypto pricing' },
  ];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
        Powered by institutional data
      </p>
      <div className="flex items-center gap-6 flex-wrap justify-center">
        {providers.map((provider) => (
          <div 
            key={provider.name}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50"
          >
            <span className="font-semibold text-sm text-foreground">{provider.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
