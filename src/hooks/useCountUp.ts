import { useEffect, useState } from 'react';

interface CountUpOptions {
  /** When false, value stays at 0 and animation is deferred. Defaults to true. */
  trigger?: boolean;
  /** Duration in milliseconds. Defaults to 900. */
  duration?: number;
}

/**
 * Animates a numeric value from 0 → target with an ease-out cubic.
 * Backwards-compatible: also accepts a number as the second arg (legacy duration).
 */
export function useCountUp(
  target: number,
  optionsOrDuration: CountUpOptions | number = {}
) {
  const opts: CountUpOptions = typeof optionsOrDuration === 'number'
    ? { duration: optionsOrDuration }
    : optionsOrDuration;
  const { trigger = true, duration = 900 } = opts;

  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    if (!isFinite(target)) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, trigger]);

  return value;
}