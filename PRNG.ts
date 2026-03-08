// OMEGA-64 | PRNG.ts | The Immutable Deterministic Oracle
// A seeded Linear Congruential Generator (LCG) for reproducible evolution.
// In Era 8, this is immutable to prevent race conditions in the Memory Matrix.

export class PRNG {
  private readonly state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /**
   * Generates the next value and a new PRNG instance.
   * @returns { value: number, next: PRNG }
   */
  next(): { value: number; next: PRNG } {
    // LCG constants from Numerical Recipes
    const nextState = (this.state * 1664525 + 1013904223) >>> 0;
    return {
      value: nextState / 0xFFFFFFFF,
      next: new PRNG(nextState),
    };
  }

  /**
   * Static helper to derive a seed from tick and atom ID.
   */
  static seedFrom(tick: number, atomId: string): number {
    let hash = tick;
    for (let i = 0; i < atomId.length; i++) {
      hash = ((hash << 5) - hash) + atomId.charCodeAt(i);
      hash |= 0; // Convert to 32bit int
    }
    return Math.abs(hash);
  }
}
