import { useEffect, useState } from 'react';

// NYSE regular hours: 09:30–16:00 America/New_York, Mon–Fri.
// Pre-market window we surface: 04:00–09:30. After-hours: 16:00–20:00.
export type MarketState = 'open' | 'pre' | 'after' | 'closed';

function nyParts(d: Date) {
  // Use Intl to get the wall-clock time in America/New_York without depending on local TZ.
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = fmt.formatToParts(d).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  return {
    weekday: parts.weekday,
    minutes: parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10),
  };
}

function computeStatus(now: Date) {
  const { weekday, minutes } = nyParts(now);
  const isWeekday = !['Sat', 'Sun'].includes(weekday);
  if (!isWeekday) return { state: 'closed' as MarketState, minutesToOpen: minutesUntilNextOpen(now) };
  if (minutes >= 570 && minutes < 960) return { state: 'open' as MarketState, minutesToOpen: 0 };
  if (minutes >= 240 && minutes < 570) return { state: 'pre' as MarketState, minutesToOpen: 570 - minutes };
  if (minutes >= 960 && minutes < 1200) return { state: 'after' as MarketState, minutesToOpen: minutesUntilNextOpen(now) };
  return { state: 'closed' as MarketState, minutesToOpen: minutesUntilNextOpen(now) };
}

function minutesUntilNextOpen(now: Date) {
  // Approximate: walk forward in 15-min steps up to 4 days to find next 09:30 weekday.
  for (let i = 0; i < 96 * 4; i++) {
    const t = new Date(now.getTime() + i * 15 * 60_000);
    const { weekday, minutes } = nyParts(t);
    if (['Sat', 'Sun'].includes(weekday)) continue;
    if (minutes >= 570 && minutes < 585) return i * 15;
  }
  return 0;
}

export function useMarketStatus() {
  const [info, setInfo] = useState(() => computeStatus(new Date()));
  useEffect(() => {
    const tick = () => setInfo(computeStatus(new Date()));
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return info;
}

export function formatCountdown(mins: number) {
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}