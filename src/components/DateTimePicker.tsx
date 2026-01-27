import { useMemo } from 'react';
import { format, addDays, setHours, setMinutes, isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Market, MARKETS } from '@/types/trade';

interface DateTimePickerProps {
  entryDateTime: Date;
  exitDateTime: Date;
  onEntryChange: (date: Date) => void;
  onExitChange: (date: Date) => void;
  market: Market;
  disabled?: boolean;
}

// Generate hour options (0-23)
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Generate minute options (0, 15, 30, 45)
const MINUTES = [0, 15, 30, 45];

// Quick preset options
const QUICK_PRESETS = [
  { label: 'Tomorrow', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
];

// Market hours by market
const MARKET_HOURS: Record<Market, { openHour: number; openMinute: number; closeHour: number; closeMinute: number }> = {
  US: { openHour: 9, openMinute: 30, closeHour: 16, closeMinute: 0 },
  UK: { openHour: 8, openMinute: 0, closeHour: 16, closeMinute: 30 },
  EU: { openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 30 },
};

export function DateTimePicker({
  entryDateTime,
  exitDateTime,
  onEntryChange,
  onExitChange,
  market,
  disabled = false,
}: DateTimePickerProps) {
  const marketInfo = MARKETS[market];
  const marketHours = MARKET_HOURS[market];

  // Update just the time portion of a date
  const updateTime = (date: Date, hour: number, minute: number): Date => {
    return setMinutes(setHours(date, hour), minute);
  };

  // Handle entry date change
  const handleEntryDateChange = (date: Date | undefined) => {
    if (date) {
      const newEntry = updateTime(date, entryDateTime.getHours(), entryDateTime.getMinutes());
      onEntryChange(newEntry);
      
      // If exit is now before entry, push exit forward
      if (isBefore(exitDateTime, newEntry)) {
        onExitChange(addDays(newEntry, 1));
      }
    }
  };

  // Handle exit date change
  const handleExitDateChange = (date: Date | undefined) => {
    if (date) {
      const newExit = updateTime(date, exitDateTime.getHours(), exitDateTime.getMinutes());
      onExitChange(newExit);
    }
  };

  // Handle time change
  const handleTimeChange = (
    type: 'entry' | 'exit',
    component: 'hour' | 'minute',
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    const targetDate = type === 'entry' ? entryDateTime : exitDateTime;
    const setter = type === 'entry' ? onEntryChange : onExitChange;

    if (component === 'hour') {
      setter(setHours(targetDate, numValue));
    } else {
      setter(setMinutes(targetDate, numValue));
    }
  };

  // Apply quick preset
  const applyPreset = (days: number) => {
    const newExit = addDays(entryDateTime, days);
    // Set to market close time
    const exitWithTime = updateTime(newExit, marketHours.closeHour, marketHours.closeMinute);
    onExitChange(exitWithTime);
  };

  // Set market open time
  const setMarketOpen = () => {
    const withMarketOpen = updateTime(entryDateTime, marketHours.openHour, marketHours.openMinute);
    onEntryChange(withMarketOpen);
  };

  // Set market close time
  const setMarketClose = () => {
    const withMarketClose = updateTime(exitDateTime, marketHours.closeHour, marketHours.closeMinute);
    onExitChange(withMarketClose);
  };

  // Calculate holding period
  const holdingPeriod = useMemo(() => {
    const diffMs = exitDateTime.getTime() - entryDateTime.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Same day';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 14) return '~1 week';
    if (diffDays < 30) return `~${Math.round(diffDays / 7)} weeks`;
    return `~${Math.round(diffDays / 30)} month${diffDays >= 60 ? 's' : ''}`;
  }, [entryDateTime, exitDateTime]);

  return (
    <div className="space-y-4">
      {/* Section Label */}
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Clock className="h-4 w-4 text-muted-foreground" />
        What's your timeframe?
      </Label>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset.days)}
            disabled={disabled}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
              "border border-border/50 bg-muted/30",
              "hover:bg-accent hover:border-accent",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Entry Date/Time */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Starting from</Label>
          <div className="flex gap-2">
            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    "trading-input"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(entryDateTime, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background border" align="start">
                <Calendar
                  mode="single"
                  selected={entryDateTime}
                  onSelect={handleEntryDateChange}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Time Picker */}
            <div className="flex items-center gap-1">
              <Select
                value={entryDateTime.getHours().toString()}
                onValueChange={(v) => handleTimeChange('entry', 'hour', v)}
                disabled={disabled}
              >
                <SelectTrigger className="w-[70px] trading-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">:</span>
              <Select
                value={entryDateTime.getMinutes().toString()}
                onValueChange={(v) => handleTimeChange('entry', 'minute', v)}
                disabled={disabled}
              >
                <SelectTrigger className="w-[70px] trading-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <button
            type="button"
            onClick={setMarketOpen}
            disabled={disabled}
            className="text-xs text-primary hover:underline"
          >
            Set to market open ({marketHours.openHour}:{marketHours.openMinute.toString().padStart(2, '0')} {marketInfo.timezone})
          </button>
        </div>

        {/* Exit Date/Time */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Until</Label>
          <div className="flex gap-2">
            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    "trading-input"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(exitDateTime, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background border" align="start">
                <Calendar
                  mode="single"
                  selected={exitDateTime}
                  onSelect={handleExitDateChange}
                  disabled={(date) => isBefore(date, startOfDay(entryDateTime))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Time Picker */}
            <div className="flex items-center gap-1">
              <Select
                value={exitDateTime.getHours().toString()}
                onValueChange={(v) => handleTimeChange('exit', 'hour', v)}
                disabled={disabled}
              >
                <SelectTrigger className="w-[70px] trading-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">:</span>
              <Select
                value={exitDateTime.getMinutes().toString()}
                onValueChange={(v) => handleTimeChange('exit', 'minute', v)}
                disabled={disabled}
              >
                <SelectTrigger className="w-[70px] trading-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <button
            type="button"
            onClick={setMarketClose}
            disabled={disabled}
            className="text-xs text-primary hover:underline"
          >
            Set to market close ({marketHours.closeHour}:{marketHours.closeMinute.toString().padStart(2, '0')} {marketInfo.timezone})
          </button>
        </div>
      </div>

      {/* Holding Period Summary */}
      <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 flex items-center justify-between">
        <span>Holding period:</span>
        <span className="font-medium text-foreground">{holdingPeriod}</span>
      </div>
    </div>
  );
}