/**
 * Deterministic seeded PRNG (Mulberry32) so missions are replayable and testable.
 */
export function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function nextRandom(rngState: number): { value: number; nextState: number } {
  const t = (rngState + 0x6d2b79f5) >>> 0;
  let z = t;
  z = Math.imul(z ^ (z >>> 15), z | 1);
  z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
  const value = ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  return { value, nextState: t };
}

export function generateRandomSeed(): string {
  const words = ['OLYMPUS', 'ARES', 'VALLES', 'JEZERO', 'THARSIS', 'PHOBOS', 'SOLARIS'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${word}-${num}`;
}
