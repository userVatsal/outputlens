/**
 * Shared Random Utilities
 *
 * FIX: SeededRandom and randomNormal were duplicated in both garch.ts and gbm.ts.
 * Extracted here as the single source of truth.
 *
 * Uses Mulberry32 PRNG — fast, good distribution, reproducible.
 */

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

/**
 * Box-Muller transform: U(0,1) → N(0,1)
 */
export function randomNormal(rng?: SeededRandom): number {
  const u1 = rng ? rng.next() : Math.random();
  const u2 = rng ? rng.next() : Math.random();
  // Guard against log(0)
  const safe_u1 = Math.max(u1, 1e-15);
  return Math.sqrt(-2 * Math.log(safe_u1)) * Math.cos(2 * Math.PI * u2);
}
